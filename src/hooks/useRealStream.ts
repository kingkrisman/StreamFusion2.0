import { useState, useCallback, useRef, useEffect } from "react";
import {
  StreamState,
  StreamPlatform,
  Guest,
  StreamSettings,
} from "@/types/streaming";
import { rtmpService } from "@/services/rtmpService";
import { webrtcService } from "@/services/webrtcService";
import { chatService } from "@/services/chatService";
import { authService } from "@/services/authService";
import { v4 as uuidv4 } from "uuid";

const initialPlatforms: StreamPlatform[] = [
  { id: "youtube", name: "YouTube", connected: false, enabled: false },
  { id: "twitch", name: "Twitch", connected: false, enabled: false },
  { id: "facebook", name: "Facebook", connected: false, enabled: false },
  { id: "x", name: "X (Twitter)", connected: false, enabled: false },
];

export const useRealStream = () => {
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

  const [error, setError] = useState<string | null>(null);
  const streamSessionId = useRef<string | null>(null);
  const streamStartTime = useRef<Date | null>(null);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);

  // Initialize services
  useEffect(() => {
    // Set up chat service callbacks
    chatService.onMessage((message) => {
      console.log("New chat message:", message);
    });

    chatService.onViewerUpdate((update) => {
      setStreamState((prev) => ({
        ...prev,
        viewerCount: update.viewerCount,
      }));
    });

    chatService.onConnectionStatus((platform, connected) => {
      updatePlatform(platform, { connected });
    });

    // Set up WebRTC callbacks
    webrtcService.onRemoteStream((peerId, stream) => {
      setStreamState((prev) => ({
        ...prev,
        guests: prev.guests.map((guest) =>
          guest.id === peerId ? { ...guest, stream, isConnected: true } : guest,
        ),
      }));
    });

    webrtcService.onPeerDisconnected((peerId) => {
      setStreamState((prev) => ({
        ...prev,
        guests: prev.guests.filter((guest) => guest.id !== peerId),
      }));
    });

    return () => {
      chatService.disconnect();
      webrtcService.leaveRoom();
    };
  }, []);

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
    async (
      platformId: string,
      rtmpUrl?: string,
      streamKey?: string,
    ): Promise<boolean> => {
      try {
        setError(null);

        // If RTMP credentials provided, use them directly
        if (rtmpUrl && streamKey) {
          updatePlatform(platformId, {
            connected: true,
            rtmpUrl,
            streamKey,
            enabled: true,
          });
          return true;
        }

        // Otherwise, authenticate with OAuth
        let authResult;
        switch (platformId) {
          case "youtube":
            authResult = await authService.authenticateYouTube();
            break;
          case "twitch":
            authResult = await authService.authenticateTwitch();
            break;
          case "facebook":
            authResult = await authService.authenticateFacebook();
            break;
          case "x":
            authResult = await authService.authenticateX();
            break;
          default:
            throw new Error(`Unsupported platform: ${platformId}`);
        }

        if (authResult) {
          // Store tokens
          authService.storeTokens(platformId, authResult);

          // Connect to chat service
          switch (platformId) {
            case "youtube":
              await chatService.connectYouTube(authResult.accessToken);
              break;
            case "twitch":
              await chatService.connectTwitch(authResult.accessToken);
              break;
            case "facebook":
              await chatService.connectFacebook(authResult.accessToken);
              break;
          }

          updatePlatform(platformId, {
            connected: true,
            enabled: true,
          });

          return true;
        }

        return false;
      } catch (error) {
        console.error(`Failed to connect to ${platformId}:`, error);
        setError(`Failed to connect to ${platformId}: ${error}`);
        return false;
      }
    },
    [updatePlatform],
  );

  const disconnectPlatform = useCallback(
    (platformId: string) => {
      authService.clearTokens(platformId);
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
    async (localStream: MediaStream): Promise<boolean> => {
      try {
        setError(null);

        // Generate session ID
        streamSessionId.current = uuidv4();

        // Get enabled platforms with RTMP configs
        const enabledPlatforms = streamState.platforms
          .filter((p) => p.enabled && p.connected)
          .map((p) => ({
            url: p.rtmpUrl || rtmpService.getPlatformConfigs()[p.id].rtmpUrl,
            key: p.streamKey || "",
            platform: p.id,
          }));

        if (enabledPlatforms.length === 0) {
          throw new Error("No platforms configured for streaming");
        }

        // Start RTMP streaming
        const streamStarted = await rtmpService.startMultiStream(
          streamSessionId.current,
          localStream,
          enabledPlatforms,
        );

        if (!streamStarted) {
          throw new Error("Failed to start RTMP stream");
        }

        // Start WebRTC room for guests
        await webrtcService.createRoom(streamSessionId.current, localStream);

        // Start chat monitoring
        await chatService.startStreamChat(streamSessionId.current);

        // Update state
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

        return true;
      } catch (error) {
        console.error("Failed to start stream:", error);
        setError(`Failed to start stream: ${error}`);
        return false;
      }
    },
    [streamState.platforms],
  );

  const stopStream = useCallback(async () => {
    try {
      if (!streamSessionId.current) return;

      // Stop RTMP streaming
      rtmpService.stopStream(streamSessionId.current);

      // Stop chat monitoring
      await chatService.stopStreamChat();

      // Leave WebRTC room
      webrtcService.leaveRoom();

      // Clear timers
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
        durationInterval.current = null;
      }

      streamStartTime.current = null;
      streamSessionId.current = null;

      setStreamState((prev) => ({
        ...prev,
        isLive: false,
        isRecording: false,
        duration: 0,
        guests: [],
      }));
    } catch (error) {
      console.error("Failed to stop stream:", error);
      setError(`Failed to stop stream: ${error}`);
    }
  }, []);

  const startRecording = useCallback((stream: MediaStream): boolean => {
    try {
      if (!streamSessionId.current) return false;

      const started = rtmpService.startRecording(
        streamSessionId.current,
        stream,
      );
      if (started) {
        setStreamState((prev) => ({ ...prev, isRecording: true }));
      }
      return started;
    } catch (error) {
      console.error("Failed to start recording:", error);
      setError(`Failed to start recording: ${error}`);
      return false;
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    try {
      if (!streamSessionId.current) return null;

      const recordingBlob = await rtmpService.stopRecording(
        streamSessionId.current,
      );
      setStreamState((prev) => ({ ...prev, isRecording: false }));
      return recordingBlob;
    } catch (error) {
      console.error("Failed to stop recording:", error);
      setError(`Failed to stop recording: ${error}`);
      return null;
    }
  }, []);

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

  const inviteGuest = useCallback(
    async (name: string, email: string): Promise<string> => {
      const guestId = uuidv4();
      const guest: Guest = {
        id: guestId,
        name,
        isConnected: false,
        isMuted: false,
        isVideoOff: false,
      };

      addGuest(guest);

      // Send invitation email (implement this API endpoint)
      try {
        await fetch("/api/guests/invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            guestId,
            name,
            email,
            roomId: streamSessionId.current,
            inviteLink: `${window.location.origin}/join/${streamSessionId.current}?guest=${guestId}`,
          }),
        });
      } catch (error) {
        console.error("Failed to send invitation:", error);
      }

      return guestId;
    },
    [addGuest],
  );

  const sendChatMessage = useCallback(
    async (message: string, platform?: string): Promise<boolean> => {
      return await chatService.sendMessage(message, platform);
    },
    [],
  );

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
    error,
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
    inviteGuest,
    sendChatMessage,
  };
};
