import { useState, useCallback, useRef } from "react";

export const useScreenShare = () => {
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);

  const startScreenShare = useCallback(async () => {
    try {
      setError(null);

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        },
        audio: true,
      });

      setScreenStream(stream);
      setIsScreenSharing(true);

      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = stream;
      }

      // Handle when user stops sharing via browser controls
      stream.getVideoTracks()[0].addEventListener("ended", () => {
        stopScreenShare();
      });
    } catch (err) {
      console.error("Error starting screen share:", err);
      setError("Failed to start screen sharing. Please try again.");
    }
  }, []);

  const stopScreenShare = useCallback(() => {
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
    }
    setIsScreenSharing(false);
    setError(null);
  }, [screenStream]);

  return {
    isScreenSharing,
    screenStream,
    screenVideoRef,
    error,
    startScreenShare,
    stopScreenShare,
  };
};
