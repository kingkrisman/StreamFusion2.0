import { io, Socket } from "socket.io-client";

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
  platform: string;
  userId?: string;
  streamId: string;
}

interface StreamViewerUpdate {
  streamId: string;
  viewerCount: number;
  platform: string;
}

interface PlatformConnection {
  platform: string;
  connected: boolean;
  accessToken?: string;
  channelId?: string;
}

class ChatService {
  private socket: Socket | null = null;
  private platformConnections: Map<string, PlatformConnection> = new Map();
  private currentStreamId: string | null = null;
  private connectionAttempts = 0;
  private maxConnectionAttempts = 3;
  private isBackendAvailable = false;
  private demoMode = false;
  private demoInterval: NodeJS.Timeout | null = null;

  // Callbacks
  private onMessageCallback?: (message: ChatMessage) => void;
  private onViewerUpdateCallback?: (update: StreamViewerUpdate) => void;
  private onConnectionStatusCallback?: (
    platform: string,
    connected: boolean,
  ) => void;

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    // Skip connection in demo mode or after max attempts
    if (this.connectionAttempts >= this.maxConnectionAttempts) {
      console.log("[Chat] Backend unavailable, running in demo mode");
      this.demoMode = true;
      this.startDemoMode();
      return;
    }

    const socketUrl =
      import.meta.env.MODE === "production"
        ? "https://chat-server.fly.dev"
        : "http://localhost:3001";

    this.socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: false, // We'll handle reconnection manually
      timeout: 3000,
    });

    this.socket.on("connect", () => {
      this.connectionAttempts = 0;
      this.isBackendAvailable = true;
      console.log("[Chat] Connected to chat server");
    });

    this.socket.on("disconnect", () => {
      if (this.isBackendAvailable) {
        console.log("[Chat] Disconnected from chat server");
        this.isBackendAvailable = false;
        // Only attempt to reconnect if we were previously connected
        if (this.connectionAttempts < this.maxConnectionAttempts) {
          setTimeout(() => this.initializeSocket(), 5000);
        }
      }
    });

    this.socket.on("chat:message", (message: ChatMessage) => {
      if (this.onMessageCallback) {
        this.onMessageCallback(message);
      }
    });

    this.socket.on("stream:viewer-update", (update: StreamViewerUpdate) => {
      if (this.onViewerUpdateCallback) {
        this.onViewerUpdateCallback(update);
      }
    });

    this.socket.on(
      "platform:connection-status",
      (data: { platform: string; connected: boolean }) => {
        const connection = this.platformConnections.get(data.platform);
        if (connection) {
          connection.connected = data.connected;
        }

        if (this.onConnectionStatusCallback) {
          this.onConnectionStatusCallback(data.platform, data.connected);
        }
      },
    );

    this.socket.on("connect_error", (error) => {
      this.connectionAttempts++;
      console.log(
        `[Chat] Connection attempt ${this.connectionAttempts}/${this.maxConnectionAttempts} failed`,
      );

      if (this.connectionAttempts >= this.maxConnectionAttempts) {
        console.log("[Chat] Backend unavailable, switching to demo mode");
        this.demoMode = true;
        this.startDemoMode();
      }
    });
  }

  private startDemoMode() {
    console.log("[Chat] Starting demo mode");

    // Simulate chat messages in demo mode
    const demoMessages = [
      "Great stream! 🔥",
      "Love this content!",
      "Can you show that again?",
      "Amazing quality! 👏",
      "Hello everyone!",
      "This is so helpful, thanks!",
      "Keep up the great work!",
      "Subscribed! 🔔",
      "When is the next stream?",
      "Demo mode is working perfectly!",
      "Looking forward to more streams!",
      "This feature is awesome! 😍",
    ];

    const platforms = ["YouTube", "Twitch", "Facebook", "X"];
    const usernames = [
      "StreamFan123",
      "TechLover",
      "ViewerPro",
      "ChatMaster",
      "LiveWatcher",
      "StreamKing",
      "DigitalNomad",
      "CodeGuru",
    ];

    // Generate demo messages every 3-8 seconds
    this.demoInterval = setInterval(
      () => {
        if (this.demoMode && this.onMessageCallback) {
          const message: ChatMessage = {
            id: Date.now().toString(),
            username: usernames[Math.floor(Math.random() * usernames.length)],
            message:
              demoMessages[Math.floor(Math.random() * demoMessages.length)],
            timestamp: new Date(),
            platform: platforms[Math.floor(Math.random() * platforms.length)],
            streamId: this.currentStreamId || "demo-stream",
          };

          this.onMessageCallback(message);
        }
      },
      Math.random() * 5000 + 3000,
    );

    // Generate demo viewer updates every 5 seconds
    setTimeout(() => {
      if (this.demoMode && this.onViewerUpdateCallback) {
        const updateInterval = setInterval(() => {
          if (this.demoMode) {
            platforms.forEach((platform) => {
              const update: StreamViewerUpdate = {
                streamId: this.currentStreamId || "demo-stream",
                viewerCount: Math.floor(Math.random() * 50) + 20,
                platform: platform.toLowerCase(),
              };

              this.onViewerUpdateCallback!(update);
            });
          } else {
            clearInterval(updateInterval);
          }
        }, 5000);
      }
    }, 1000);
  }

  // Platform Integration Methods
  async connectYouTube(accessToken: string): Promise<boolean> {
    try {
      if (this.socket && this.socket.connected) {
        const response = await this.socket.emitWithAck("platform:connect", {
          platform: "youtube",
          accessToken,
        });

        if (response.success) {
          this.platformConnections.set("youtube", {
            platform: "youtube",
            connected: true,
            accessToken,
            channelId: response.channelId,
          });
          console.log("[Chat] YouTube connected");
          return true;
        }
      } else {
        console.log("[Chat] Demo mode: YouTube connection simulated");
        this.platformConnections.set("youtube", {
          platform: "youtube",
          connected: true,
          accessToken,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to connect YouTube:", error);
      return false;
    }
  }

  async connectTwitch(accessToken: string): Promise<boolean> {
    try {
      if (this.socket && this.socket.connected) {
        const response = await this.socket.emitWithAck("platform:connect", {
          platform: "twitch",
          accessToken,
        });

        if (response.success) {
          this.platformConnections.set("twitch", {
            platform: "twitch",
            connected: true,
            accessToken,
            channelId: response.channelId,
          });
          console.log("[Chat] Twitch connected");
          return true;
        }
      } else {
        console.log("[Chat] Demo mode: Twitch connection simulated");
        this.platformConnections.set("twitch", {
          platform: "twitch",
          connected: true,
          accessToken,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to connect Twitch:", error);
      return false;
    }
  }

  async connectFacebook(accessToken: string): Promise<boolean> {
    try {
      if (this.socket && this.socket.connected) {
        const response = await this.socket.emitWithAck("platform:connect", {
          platform: "facebook",
          accessToken,
        });

        if (response.success) {
          this.platformConnections.set("facebook", {
            platform: "facebook",
            connected: true,
            accessToken,
            channelId: response.channelId,
          });
          console.log("[Chat] Facebook connected");
          return true;
        }
      } else {
        console.log("[Chat] Demo mode: Facebook connection simulated");
        this.platformConnections.set("facebook", {
          platform: "facebook",
          connected: true,
          accessToken,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to connect Facebook:", error);
      return false;
    }
  }

  // Stream Management
  async startStreamChat(streamId: string): Promise<boolean> {
    try {
      this.currentStreamId = streamId;

      if (this.socket && this.socket.connected) {
        // Join stream room
        this.socket.emit("stream:join", { streamId });

        // Start chat monitoring for connected platforms
        const connectedPlatforms = Array.from(
          this.platformConnections.values(),
        ).filter((conn) => conn.connected);

        for (const platform of connectedPlatforms) {
          this.socket.emit("platform:start-chat-monitoring", {
            streamId,
            platform: platform.platform,
            channelId: platform.channelId,
          });
        }
        console.log("[Chat] Started stream chat monitoring");
      } else {
        console.log("[Chat] Demo mode: Stream chat monitoring simulated");
      }

      return true;
    } catch (error) {
      console.error("Failed to start stream chat:", error);
      return false;
    }
  }

  async stopStreamChat(): Promise<void> {
    if (this.socket && this.socket.connected && this.currentStreamId) {
      // Stop chat monitoring
      this.socket.emit("platform:stop-chat-monitoring", {
        streamId: this.currentStreamId,
      });

      // Leave stream room
      this.socket.emit("stream:leave", { streamId: this.currentStreamId });
      console.log("[Chat] Stopped stream chat monitoring");
    } else {
      console.log("[Chat] Demo mode: Stream chat monitoring stopped");
    }

    this.currentStreamId = null;
  }

  // Send Messages
  async sendMessage(message: string, platform?: string): Promise<boolean> {
    try {
      if (!this.currentStreamId) return false;

      const chatMessage: Partial<ChatMessage> = {
        message,
        streamId: this.currentStreamId,
        platform: platform || "studio",
        timestamp: new Date(),
      };

      if (this.socket && this.socket.connected) {
        if (platform && this.platformConnections.has(platform)) {
          // Send to specific platform
          this.socket.emit("platform:send-message", {
            ...chatMessage,
            platform,
          });
        } else {
          // Send to studio chat
          this.socket.emit("chat:send-message", chatMessage);
        }
        console.log("[Chat] Message sent to backend");
      } else {
        // Demo mode: Add message locally
        if (this.onMessageCallback) {
          const demoMessage: ChatMessage = {
            id: Date.now().toString(),
            username: "You (Host)",
            message,
            timestamp: new Date(),
            platform: platform || "studio",
            streamId: this.currentStreamId,
          };
          this.onMessageCallback(demoMessage);
        }
        console.log("[Chat] Demo mode: Message added locally");
      }

      return true;
    } catch (error) {
      console.error("Failed to send message:", error);
      return false;
    }
  }

  // Event Handlers
  onMessage(callback: (message: ChatMessage) => void) {
    this.onMessageCallback = callback;
  }

  onViewerUpdate(callback: (update: StreamViewerUpdate) => void) {
    this.onViewerUpdateCallback = callback;
  }

  onConnectionStatus(callback: (platform: string, connected: boolean) => void) {
    this.onConnectionStatusCallback = callback;
  }

  // Utility Methods
  getPlatformConnections(): PlatformConnection[] {
    return Array.from(this.platformConnections.values());
  }

  isPlatformConnected(platform: string): boolean {
    const connection = this.platformConnections.get(platform);
    return connection?.connected || false;
  }

  isBackendConnected(): boolean {
    return this.isBackendAvailable;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }

    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }

    this.platformConnections.clear();
    this.currentStreamId = null;
    this.demoMode = false;

    console.log("[Chat] Disconnected and cleaned up");
  }
}

export const chatService = new ChatService();
