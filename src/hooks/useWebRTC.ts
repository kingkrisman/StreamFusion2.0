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
      console.log("Checking media device permissions...");

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("MediaDevices API not supported");
        throw new Error("MEDIA_NOT_SUPPORTED");
      }

      // Check if we're running on HTTPS or localhost
      const isSecureContext =
        window.isSecureContext || window.location.hostname === "localhost";
      if (!isSecureContext) {
        console.error("Insecure context detected:", window.location.protocol);
        throw new Error("INSECURE_CONTEXT");
      }

      console.log("Security context OK, checking permissions...");

      // Try to get permission status if available
      if (navigator.permissions) {
        try {
          const [cameraPermission, micPermission] = await Promise.all([
            navigator.permissions.query({ name: "camera" as PermissionName }),
            navigator.permissions.query({
              name: "microphone" as PermissionName,
            }),
          ]);

          console.log("Permission states:", {
            camera: cameraPermission.state,
            microphone: micPermission.state,
          });

          if (
            cameraPermission.state === "denied" ||
            micPermission.state === "denied"
          ) {
            setPermissionState("denied");
            console.error("Permissions explicitly denied");
            throw new Error("PERMISSION_DENIED");
          } else if (
            cameraPermission.state === "granted" &&
            micPermission.state === "granted"
          ) {
            setPermissionState("granted");
            console.log("Permissions already granted");
          } else {
            setPermissionState("prompt");
            console.log("Permissions need to be requested");
          }
        } catch (permErr) {
          // Permission API might not support camera/microphone queries in all browsers
          console.log("Permission API query failed:", permErr);
          setPermissionState("prompt");
        }
      } else {
        console.log("Permission API not available, will request directly");
        setPermissionState("prompt");
      }

      return true;
    } catch (err) {
      console.error("Permission check failed:", err);
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

    if (error.message === "CAMERA_NO_VIDEO_TRACKS") {
      return {
        type: "hardware",
        message:
          "Camera is connected but not producing video. This could be a hardware issue.",
        instructions: [
          "Check if your camera has a physical privacy cover",
          "Make sure your camera isn't being used by another application",
          "Try unplugging and reconnecting your camera",
          "Check camera settings in your system preferences",
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
    console.log("Initializing media...");
    setIsInitializing(true);
    setError(null);

    try {
      // First check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("getUserMedia not supported");
        throw new Error("MEDIA_NOT_SUPPORTED");
      }

      console.log("MediaDevices API available");
      await checkPermissions();

      // Try with fallback constraints for better compatibility
      let constraints = {
        video: {
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
          frameRate: { ideal: 30, min: 15 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      };

      let stream;
      let attempt = 1;
      const maxAttempts = 3;

      // If permissions are in prompt state, try a simple request first to trigger permission dialog
      if (permissionState === "prompt") {
        console.log(
          "Permissions need to be requested, trying simple constraints first...",
        );
        try {
          const simpleStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          console.log("Simple permission request successful");
          // Stop the simple stream and continue with preferred constraints
          simpleStream.getTracks().forEach((track) => track.stop());
          setPermissionState("granted");
        } catch (simpleError) {
          console.error("Simple permission request failed:", simpleError);
          if (simpleError.name === "NotAllowedError") {
            setPermissionState("denied");
            throw simpleError;
          }
          // Continue with fallback logic for other errors
        }
      }

      try {
        console.log(`Attempt ${attempt}: Requesting high resolution media`);
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log("High resolution stream successful");
      } catch (highResError) {
        attempt++;
        console.warn(
          `Attempt ${attempt}: High resolution failed, trying lower resolution:`,
          highResError,
        );

        // Fallback to lower resolution
        constraints = {
          video: {
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 },
            frameRate: { ideal: 30, min: 15 },
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        };

        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (mediumResError) {
          attempt++;
          console.warn(
            `Attempt ${attempt}: Medium resolution failed, trying basic constraints:`,
            mediumResError,
          );

          // Final fallback to basic constraints
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: true,
            });
          } catch (basicError) {
            // If even basic constraints fail, try video-only as last resort
            console.warn(
              "Basic constraints failed, trying video-only:",
              basicError,
            );
            try {
              stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false,
              });
              console.warn("Audio access failed, continuing with video-only");
            } catch (videoOnlyError) {
              throw basicError; // Throw the basic error, not video-only
            }
          }
        }
      }

      // Validate stream before setting it
      console.log("Stream received:", {
        active: stream.active,
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length,
        settings: stream.getVideoTracks()[0]?.getSettings(),
      });

      // Check if stream has video tracks
      if (stream.getVideoTracks().length === 0) {
        console.warn("Stream has no video tracks");
        throw new Error("CAMERA_NO_VIDEO_TRACKS");
      }

      setLocalStream(stream);
      setPermissionState("granted");

      // Ensure video element is properly set up with enhanced error handling
      if (localVideoRef.current) {
        const video = localVideoRef.current;

        // Clear any existing source first
        video.srcObject = null;

        // Set up event handlers before setting the stream
        video.onloadedmetadata = () => {
          console.log("Video metadata loaded:", {
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight,
            duration: video.duration,
            readyState: video.readyState,
          });

          video.play().catch((playError) => {
            console.warn("Video play failed:", playError);
            // Try multiple recovery strategies
            setTimeout(() => {
              if (video.paused) {
                video.play().catch((retryError) => {
                  console.error("Video retry failed:", retryError);
                  // Last resort: trigger user interaction
                  setError(
                    JSON.stringify({
                      type: "playback",
                      message: "Video playback failed. Please click to start.",
                      instructions: [
                        "Click the video area to start playback",
                        "Check if browser allows autoplay",
                      ],
                    }),
                  );
                });
              }
            }, 1000);
          });
        };

        video.onloadstart = () => {
          console.log("Video load started");
        };

        video.oncanplay = () => {
          console.log("Video can play");
        };

        video.onplaying = () => {
          console.log("Video is playing");
        };

        video.onerror = (videoError) => {
          console.error("Video element error:", videoError);
          const error = video.error;
          if (error) {
            console.error("Video error details:", {
              code: error.code,
              message: error.message,
            });
          }
        };

        video.onstalled = () => {
          console.warn("Video playback stalled");
        };

        video.onsuspend = () => {
          console.warn("Video loading suspended");
        };

        // Set video properties
        video.muted = true; // Prevent audio feedback
        video.playsInline = true; // Better mobile support
        video.autoplay = true; // Autoplay for better UX

        // Now set the stream
        video.srcObject = stream;

        // Force load if needed
        video.load();

        // Additional check after a delay
        setTimeout(() => {
          if (video.readyState < 2) {
            console.warn(
              "Video not ready after 3 seconds, current state:",
              video.readyState,
            );
            // Try reloading
            video.load();
          }

          if (video.paused) {
            console.warn("Video is paused, attempting to play");
            video.play().catch(console.error);
          }
        }, 3000);
      }

      console.log("Media initialization successful");
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
