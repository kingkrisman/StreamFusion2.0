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

  private connectionAttempts = 0;
  private maxConnectionAttempts = 3;
  private isBackendAvailable = false;
  private demoMode = false;

  private initializeSocket() {
    // Skip connection in demo mode or after max attempts
    if (this.connectionAttempts >= this.maxConnectionAttempts) {
      console.log('[Chat] Backend unavailable, running in demo mode');
      this.demoMode = true;
      this.startDemoMode();
      return;
    }

    const socketUrl = import.meta.env.MODE === 'production'
      ? 'https://chat-server.fly.dev'
      : 'http://localhost:3001';

    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: false, // We'll handle reconnection manually
      timeout: 3000
    });

    this.socket.on('connect', () => {
      this.connectionAttempts = 0;
      this.isBackendAvailable = true;
      console.log('[Chat] Connected to chat server');
    });

    this.socket.on('disconnect', () => {
      if (this.isBackendAvailable) {
        console.log('[Chat] Disconnected from chat server');
        this.isBackendAvailable = false;
        // Only attempt to reconnect if we were previously connected
        if (this.connectionAttempts < this.maxConnectionAttempts) {
          setTimeout(() => this.initializeSocket(), 5000);
        }
      }
    });

    this.socket.on('chat:message', (message: ChatMessage) => {
      if (this.onMessageCallback) {
        this.onMessageCallback(message);
      }
    });

    this.socket.on('stream:viewer-update', (update: StreamViewerUpdate) => {
      if (this.onViewerUpdateCallback) {
        this.onViewerUpdateCallback(update);
      }
    });

    this.socket.on('platform:connection-status', (data: { platform: string; connected: boolean }) => {
      const connection = this.platformConnections.get(data.platform);
      if (connection) {
        connection.connected = data.connected;
      }

      if (this.onConnectionStatusCallback) {
        this.onConnectionStatusCallback(data.platform, data.connected);
      }
    });

    this.socket.on('connect_error', (error) => {
      this.connectionAttempts++;
      console.log(`[Chat] Connection attempt ${this.connectionAttempts}/${this.maxConnectionAttempts} failed`);

      if (this.connectionAttempts >= this.maxConnectionAttempts) {
        console.log('[Chat] Backend unavailable, switching to demo mode');
        this.demoMode = true;
        this.startDemoMode();
      }
    });
  }

  private startDemoMode() {
    // Simulate chat messages in demo mode
    const demoMessages = [
      'Great stream! 🔥',
      'Love this content!',
      'Can you show that again?',
      'Amazing quality! 👏',
      'Hello everyone!',
      'This is so helpful, thanks!',
      'Keep up the great work!',
      'Subscribed! 🔔',
      'When is the next stream?',
      'Demo mode is working perfectly!'
    ];

    const platforms = ['YouTube', 'Twitch', 'Facebook', 'X'];
    const usernames = ['StreamFan123', 'TechLover', 'ViewerPro', 'ChatMaster'];

    // Generate demo messages every 3-8 seconds
    setInterval(() => {
      if (this.demoMode && this.onMessageCallback) {
        const message: ChatMessage = {
          id: Date.now().toString(),
          username: usernames[Math.floor(Math.random() * usernames.length)],
          message: demoMessages[Math.floor(Math.random() * demoMessages.length)],
          timestamp: new Date(),
          platform: platforms[Math.floor(Math.random() * platforms.length)],
          streamId: this.currentStreamId || 'demo-stream'
        };

        this.onMessageCallback(message);
      }
    }, Math.random() * 5000 + 3000);

    // Generate demo viewer updates
    setInterval(() => {
      if (this.demoMode && this.onViewerUpdateCallback) {
        platforms.forEach(platform => {
          const update: StreamViewerUpdate = {
            streamId: this.currentStreamId || 'demo-stream',
            viewerCount: Math.floor(Math.random() * 50) + 20,
            platform: platform.toLowerCase()
          };

          this.onViewerUpdateCallback(update);
        });
      }
    }, 5000);
  }

        if (this.onConnectionStatusCallback) {
          this.onConnectionStatusCallback(data.platform, data.connected);
        }
      },
    );

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
  }

  // Platform Integration Methods
  async connectYouTube(accessToken: string): Promise<boolean> {
    try {
      if (!this.socket) return false;

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
      if (!this.socket) return false;

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
      if (!this.socket) return false;

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
      if (!this.socket) return false;

      this.currentStreamId = streamId;

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

      return true;
    } catch (error) {
      console.error("Failed to start stream chat:", error);
      return false;
    }
  }

  async stopStreamChat(): Promise<void> {
    if (!this.socket || !this.currentStreamId) return;

    // Stop chat monitoring
    this.socket.emit("platform:stop-chat-monitoring", {
      streamId: this.currentStreamId,
    });

    // Leave stream room
    this.socket.emit("stream:leave", { streamId: this.currentStreamId });

    this.currentStreamId = null;
  }

  // Send Messages
  async sendMessage(message: string, platform?: string): Promise<boolean> {
    try {
      if (!this.socket || !this.currentStreamId) return false;

      const chatMessage: Partial<ChatMessage> = {
        message,
        streamId: this.currentStreamId,
        platform: platform || "studio",
        timestamp: new Date(),
      };

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

      return true;
    } catch (error) {
      console.error("Failed to send message:", error);
      return false;
    }
  }

  // Real-time Platform APIs
  private async fetchYouTubeLiveChat(videoId: string): Promise<ChatMessage[]> {
    try {
      const connection = this.platformConnections.get("youtube");
      if (!connection || !connection.accessToken) return [];

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${videoId}&part=snippet,authorDetails`,
        {
          headers: {
            Authorization: `Bearer ${connection.accessToken}`,
          },
        },
      );

      const data = await response.json();

      return (
        data.items?.map((item: any) => ({
          id: item.id,
          username: item.authorDetails.displayName,
          message: item.snippet.displayMessage,
          timestamp: new Date(item.snippet.publishedAt),
          platform: "youtube",
          streamId: this.currentStreamId!,
        })) || []
      );
    } catch (error) {
      console.error("Error fetching YouTube chat:", error);
      return [];
    }
  }

  private async fetchTwitchChat(channelName: string): Promise<ChatMessage[]> {
    // Twitch chat would be handled via IRC/WebSocket connection
    // This is a simplified version
    try {
      const connection = this.platformConnections.get("twitch");
      if (!connection) return [];

      // In a real implementation, you'd connect to Twitch IRC
      // For now, return empty array
      return [];
    } catch (error) {
      console.error("Error fetching Twitch chat:", error);
      return [];
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

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
    this.platformConnections.clear();
    this.currentStreamId = null;
  }
}

export const chatService = new ChatService();