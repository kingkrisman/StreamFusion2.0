import { useState, useCallback, useRef, useEffect } from "react";
import {
  StreamState,
  StreamPlatform,
  Guest,
  StreamSettings,
} from "@/types/streaming";

const initialPlatforms: StreamPlatform[] = [
  { id: "youtube", name: "YouTube", connected: false, enabled: false },
  { id: "twitch", name: "Twitch", connected: false, enabled: false },
  { id: "facebook", name: "Facebook", connected: false, enabled: false },
  { id: "x", name: "X (Twitter)", connected: false, enabled: false },
];

export const useStream = () => {
  const [streamState, setStreamState] = useState<StreamState>({
    isLive: false,
    isRecording: false,
    platforms: initialPlatforms,
    guests: [],
    viewerCount: 0,
    duration: 0,
  });

  const [settings, setSettings] = useState<StreamSettings>({
    title: "",
    description: "",
    quality: "FHD",
    overlays: [],
  });

  const streamStartTime = useRef<Date | null>(null);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);

  const updatePlatform = useCallback(
    (platformId: string, updates: Partial<StreamPlatform>) => {
      setStreamState((prev) => ({
        ...prev,
        platforms: prev.platforms.map((platform) =>
          platform.id === platformId ? { ...platform, ...updates } : platform,
        ),
      }));
    },
    [],
  );

  const connectPlatform = useCallback(
    async (platformId: string, rtmpUrl: string, streamKey: string) => {
      try {
        // Simulate platform connection
        updatePlatform(platformId, {
          connected: true,
          rtmpUrl,
          streamKey,
          enabled: true,
        });
        return true;
      } catch (error) {
        console.error(`Failed to connect to ${platformId}:`, error);
        return false;
      }
    },
    [updatePlatform],
  );

  const disconnectPlatform = useCallback(
    (platformId: string) => {
      updatePlatform(platformId, {
        connected: false,
        rtmpUrl: undefined,
        streamKey: undefined,
        enabled: false,
      });
    },
    [updatePlatform],
  );

  const addGuest = useCallback((guest: Guest) => {
    setStreamState((prev) => ({
      ...prev,
      guests: [...prev.guests, guest],
    }));
  }, []);

  const removeGuest = useCallback((guestId: string) => {
    setStreamState((prev) => ({
      ...prev,
      guests: prev.guests.filter((guest) => guest.id !== guestId),
    }));
  }, []);

  const updateGuest = useCallback(
    (guestId: string, updates: Partial<Guest>) => {
      setStreamState((prev) => ({
        ...prev,
        guests: prev.guests.map((guest) =>
          guest.id === guestId ? { ...guest, ...updates } : guest,
        ),
      }));
    },
    [],
  );

  const startStream = useCallback(
    async (localStream: MediaStream) => {
      try {
        streamStartTime.current = new Date();

        // Start duration timer
        durationInterval.current = setInterval(() => {
          if (streamStartTime.current) {
            const duration = Math.floor(
              (Date.now() - streamStartTime.current.getTime()) / 1000,
            );
            setStreamState((prev) => ({ ...prev, duration }));
          }
        }, 1000);

        setStreamState((prev) => ({ ...prev, isLive: true }));

        // Here you would implement actual RTMP streaming to connected platforms
        console.log(
          "Stream started to platforms:",
          streamState.platforms.filter((p) => p.enabled),
        );

        return true;
      } catch (error) {
        console.error("Failed to start stream:", error);
        return false;
      }
    },
    [streamState.platforms],
  );

  const stopStream = useCallback(() => {
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }

    streamStartTime.current = null;

    setStreamState((prev) => ({
      ...prev,
      isLive: false,
      duration: 0,
    }));
  }, []);

  const startRecording = useCallback((stream: MediaStream) => {
    try {
      recordedChunks.current = [];

      mediaRecorder.current = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp8,opus",
      });

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.start();
      setStreamState((prev) => ({ ...prev, isRecording: true }));

      return true;
    } catch (error) {
      console.error("Failed to start recording:", error);
      return false;
    }
  }, []);

  const stopRecording = useCallback(() => {
    return new Promise<Blob | null>((resolve) => {
      if (!mediaRecorder.current || streamState.isRecording === false) {
        resolve(null);
        return;
      }

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: "video/webm" });
        recordedChunks.current = [];
        setStreamState((prev) => ({ ...prev, isRecording: false }));
        resolve(blob);
      };

      mediaRecorder.current.stop();
    });
  }, [streamState.isRecording]);

  const downloadRecording = useCallback(async () => {
    const recordingBlob = await stopRecording();
    if (recordingBlob) {
      const url = URL.createObjectURL(recordingBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `stream-recording-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [stopRecording]);

  useEffect(() => {
    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, []);

  return {
    streamState,
    settings,
    setSettings,
    connectPlatform,
    disconnectPlatform,
    addGuest,
    removeGuest,
    updateGuest,
    startStream,
    stopStream,
    startRecording,
    stopRecording,
    downloadRecording,
  };
};
