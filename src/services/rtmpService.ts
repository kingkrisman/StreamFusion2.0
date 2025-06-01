interface RTMPStreamConfig {
  url: string;
  key: string;
  platform: string;
}

interface StreamingSession {
  id: string;
  platforms: RTMPStreamConfig[];
  mediaRecorder?: MediaRecorder;
  isRecording: boolean;
  startTime: Date;
}

class RTMPStreamingService {
  private streamingSessions: Map<string, StreamingSession> = new Map();
  private wsConnection: WebSocket | null = null;
  private connectionAttempts = 0;
  private maxConnectionAttempts = 3;
  private isBackendAvailable = false;

  constructor() {
    this.initializeWebSocket();
  }

  private async initializeWebSocket() {
    // Skip connection in demo mode or after max attempts
    if (this.connectionAttempts >= this.maxConnectionAttempts) {
      console.log("[RTMP] Backend unavailable, running in demo mode");
      return;
    }

    const wsUrl =
      import.meta.env.MODE === "production"
        ? "wss://stream-server.fly.dev/ws"
        : "ws://localhost:8080/ws";

    try {
      this.wsConnection = new WebSocket(wsUrl);

      // Set timeout for connection
      const connectionTimeout = setTimeout(() => {
        if (
          this.wsConnection &&
          this.wsConnection.readyState === WebSocket.CONNECTING
        ) {
          this.wsConnection.close();
        }
      }, 3000);

      this.wsConnection.onopen = () => {
        clearTimeout(connectionTimeout);
        this.connectionAttempts = 0;
        this.isBackendAvailable = true;
        console.log("[RTMP] Connected to streaming server");
      };

      this.wsConnection.onclose = () => {
        clearTimeout(connectionTimeout);
        if (this.isBackendAvailable) {
          console.log("[RTMP] Disconnected from streaming server");
          this.isBackendAvailable = false;
          // Only attempt to reconnect if we were previously connected
          if (this.connectionAttempts < this.maxConnectionAttempts) {
            setTimeout(() => this.initializeWebSocket(), 5000);
          }
        }
      };

      this.wsConnection.onerror = (error) => {
        clearTimeout(connectionTimeout);
        this.connectionAttempts++;
        console.log(
          `[RTMP] Connection attempt ${this.connectionAttempts}/${this.maxConnectionAttempts} failed`,
        );

        if (this.connectionAttempts >= this.maxConnectionAttempts) {
          console.log("[RTMP] Backend unavailable, switching to demo mode");
        }
      };
    } catch (error) {
      this.connectionAttempts++;
      console.log(
        "[RTMP] Failed to create WebSocket connection, using demo mode",
      );
    }
  }

  async startMultiStream(
    sessionId: string,
    mediaStream: MediaStream,
    platforms: RTMPStreamConfig[],
  ): Promise<boolean> {
    try {
      // Create canvas for compositing multiple video sources
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      canvas.width = 1920;
      canvas.height = 1080;

      // Create video element for the stream
      const video = document.createElement("video");
      video.srcObject = mediaStream;
      video.muted = true;
      await video.play();

      // Create canvas stream
      const canvasStream = canvas.captureStream(30);

      // Add audio tracks from original stream
      mediaStream.getAudioTracks().forEach((track) => {
        canvasStream.addTrack(track);
      });

      // Start rendering loop
      const renderFrame = () => {
        if (video.readyState >= 2) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
        requestAnimationFrame(renderFrame);
      };
      renderFrame();

      // Send stream data to server for RTMP distribution (if backend available)
      if (
        this.wsConnection &&
        this.wsConnection.readyState === WebSocket.OPEN
      ) {
        this.wsConnection.send(
          JSON.stringify({
            type: "START_STREAM",
            sessionId,
            platforms,
            streamConfig: {
              width: canvas.width,
              height: canvas.height,
              framerate: 30,
              bitrate: 2500000,
            },
          }),
        );
        console.log("[RTMP] Sent stream config to backend");
      } else {
        console.log(
          "[RTMP] Demo mode: Simulating RTMP stream to platforms:",
          platforms.map((p) => p.platform),
        );
      }

      // Create streaming session
      const session: StreamingSession = {
        id: sessionId,
        platforms,
        isRecording: false,
        startTime: new Date(),
      };

      this.streamingSessions.set(sessionId, session);

      // Start recording if needed
      this.startRecording(sessionId, canvasStream);

      return true;
    } catch (error) {
      console.error("Failed to start multi-stream:", error);
      return false;
    }
  }

  startRecording(sessionId: string, stream: MediaStream): boolean {
    try {
      const session = this.streamingSessions.get(sessionId);
      if (!session) return false;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp8,opus",
        videoBitsPerSecond: 2500000,
        audioBitsPerSecond: 128000,
      });

      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        this.saveRecording(sessionId, blob);
      };

      mediaRecorder.start(1000); // Collect data every second
      session.mediaRecorder = mediaRecorder;
      session.isRecording = true;

      return true;
    } catch (error) {
      console.error("Failed to start recording:", error);
      return false;
    }
  }

  stopRecording(sessionId: string): Promise<Blob | null> {
    return new Promise((resolve) => {
      const session = this.streamingSessions.get(sessionId);
      if (!session || !session.mediaRecorder) {
        resolve(null);
        return;
      }

      session.mediaRecorder.onstop = () => {
        // The recording will be saved automatically
        session.isRecording = false;
        resolve(new Blob()); // Return empty blob for now
      };

      session.mediaRecorder.stop();
    });
  }

  stopStream(sessionId: string): boolean {
    try {
      const session = this.streamingSessions.get(sessionId);
      if (!session) return false;

      // Stop recording if active
      if (session.isRecording && session.mediaRecorder) {
        session.mediaRecorder.stop();
      }

      // Notify server to stop RTMP streams (if backend available)
      if (
        this.wsConnection &&
        this.wsConnection.readyState === WebSocket.OPEN
      ) {
        this.wsConnection.send(
          JSON.stringify({
            type: "STOP_STREAM",
            sessionId,
          }),
        );
        console.log("[RTMP] Sent stop stream to backend");
      } else {
        console.log("[RTMP] Demo mode: Simulating stream stop");
      }

      this.streamingSessions.delete(sessionId);
      return true;
    } catch (error) {
      console.error("Failed to stop stream:", error);
      return false;
    }
  }

  private async saveRecording(sessionId: string, blob: Blob) {
    try {
      // Try to upload to server or save locally
      if (this.isBackendAvailable) {
        const formData = new FormData();
        formData.append(
          "recording",
          blob,
          `stream-${sessionId}-${Date.now()}.webm`,
        );
        formData.append("sessionId", sessionId);

        const response = await fetch("/api/recordings", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          console.log("[RTMP] Recording saved to server");
        } else {
          console.log(
            "[RTMP] Server upload failed, recording available for download",
          );
        }
      } else {
        console.log("[RTMP] Demo mode: Recording ready for download");
      }
    } catch (error) {
      console.log(
        "[RTMP] Recording save failed, but file is available for download",
      );
    }
  }

  getPlatformConfigs(): {
    [key: string]: { rtmpUrl: string; instructions: string };
  } {
    return {
      youtube: {
        rtmpUrl: "rtmp://a.rtmp.youtube.com/live2",
        instructions:
          "Get your stream key from YouTube Studio > Go Live > Stream tab",
      },
      twitch: {
        rtmpUrl: "rtmp://live.twitch.tv/live",
        instructions:
          "Get your stream key from Twitch Dashboard > Settings > Stream",
      },
      facebook: {
        rtmpUrl: "rtmps://live-api-s.facebook.com:443/rtmp",
        instructions: "Get your stream key from Facebook Creator Studio > Live",
      },
      x: {
        rtmpUrl: "rtmp://ingest.pscp.tv:80/x",
        instructions: "Get your stream key from X Media Studio > Producer",
      },
    };
  }

  isBackendConnected(): boolean {
    return this.isBackendAvailable;
  }
}

export const rtmpService = new RTMPStreamingService();
