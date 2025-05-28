import { useState, useEffect, useRef, useCallback } from "react";
import { WebRTCConnection } from "@/types/streaming";

export const useWebRTC = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [permissionState, setPermissionState] = useState<
    "prompt" | "granted" | "denied"
  >("prompt");

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());

  const checkPermissions = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("MEDIA_NOT_SUPPORTED");
      }

      // Check if we're running on HTTPS or localhost
      const isSecureContext =
        window.isSecureContext || window.location.hostname === "localhost";
      if (!isSecureContext) {
        throw new Error("INSECURE_CONTEXT");
      }

      // Try to get permission status if available
      if (navigator.permissions) {
        try {
          const cameraPermission = await navigator.permissions.query({
            name: "camera" as PermissionName,
          });
          const micPermission = await navigator.permissions.query({
            name: "microphone" as PermissionName,
          });

          if (
            cameraPermission.state === "denied" ||
            micPermission.state === "denied"
          ) {
            setPermissionState("denied");
            throw new Error("PERMISSION_DENIED");
          } else if (
            cameraPermission.state === "granted" &&
            micPermission.state === "granted"
          ) {
            setPermissionState("granted");
          }
        } catch (permErr) {
          // Permission API might not support camera/microphone queries in all browsers
          console.log("Permission API query failed:", permErr);
        }
      }

      return true;
    } catch (err) {
      throw err;
    }
  }, []);

  const getDetailedError = (error: any) => {
    if (
      error.name === "NotAllowedError" ||
      error.message === "PERMISSION_DENIED"
    ) {
      setPermissionState("denied");
      return {
        type: "permission",
        message:
          "Camera and microphone access was denied. Please allow access and try again.",
        instructions: [
          "Click the camera icon in your browser address bar",
          'Select "Allow" for camera and microphone access',
          "Refresh the page and try again",
        ],
      };
    }

    if (error.name === "NotFoundError") {
      return {
        type: "hardware",
        message:
          "No camera or microphone found. Please connect a device and try again.",
        instructions: [
          "Make sure your camera and microphone are connected",
          "Check that no other application is using your camera",
          "Try refreshing the page",
        ],
      };
    }

    if (error.name === "NotReadableError") {
      return {
        type: "hardware",
        message:
          "Camera or microphone is already in use by another application.",
        instructions: [
          "Close other video calling applications (Zoom, Teams, etc.)",
          "Close other browser tabs that might be using your camera",
          "Restart your browser and try again",
        ],
      };
    }

    if (error.message === "INSECURE_CONTEXT") {
      return {
        type: "security",
        message: "Camera access requires a secure connection (HTTPS).",
        instructions: [
          "Make sure you're accessing the site via HTTPS",
          "For local development, use localhost instead of IP address",
        ],
      };
    }

    if (error.message === "MEDIA_NOT_SUPPORTED") {
      return {
        type: "browser",
        message: "Your browser doesn't support camera access.",
        instructions: [
          "Use a modern browser (Chrome, Firefox, Safari, Edge)",
          "Update your browser to the latest version",
        ],
      };
    }

    return {
      type: "unknown",
      message: "Failed to access camera or microphone.",
      instructions: [
        "Refresh the page and try again",
        "Check your browser settings",
        "Try using a different browser",
      ],
    };
  };

  const initializeMedia = useCallback(async () => {
    setIsInitializing(true);
    setError(null);

    try {
      await checkPermissions();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      setLocalStream(stream);
      setPermissionState("granted");

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing media devices:", err);
      const errorDetails = getDetailedError(err);
      setError(JSON.stringify(errorDetails));
    } finally {
      setIsInitializing(false);
    }
  }, [checkPermissions]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, [localStream]);

  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  }, [localStream]);

  const createPeerConnection = useCallback(
    (guestId: string) => {
      const configuration: RTCConfiguration = {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      };

      const peerConnection = new RTCPeerConnection(configuration);

      if (localStream) {
        localStream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, localStream);
        });
      }

      peerConnections.current.set(guestId, peerConnection);

      return peerConnection;
    },
    [localStream],
  );

  const closePeerConnection = useCallback((guestId: string) => {
    const peerConnection = peerConnections.current.get(guestId);
    if (peerConnection) {
      peerConnection.close();
      peerConnections.current.delete(guestId);
    }
  }, []);

  const stopMedia = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }

    // Close all peer connections
    peerConnections.current.forEach((pc) => pc.close());
    peerConnections.current.clear();
  }, [localStream]);

  useEffect(() => {
    return () => {
      stopMedia();
    };
  }, [stopMedia]);

  return {
    localStream,
    localVideoRef,
    isVideoEnabled,
    isAudioEnabled,
    error,
    isInitializing,
    permissionState,
    initializeMedia,
    toggleVideo,
    toggleAudio,
    createPeerConnection,
    closePeerConnection,
    stopMedia,
  };
};
