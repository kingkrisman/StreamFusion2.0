// Demo service for testing functionality without real API keys

interface DemoStreamData {
  platform: string;
  viewerCount: number;
  isLive: boolean;
  duration: number;
}

class DemoService {
  private isDemo: boolean;
  private demoInterval: NodeJS.Timeout | null = null;
  private demoData: Map<string, DemoStreamData> = new Map();

  constructor() {
    this.isDemo = this.isDemoMode();
    this.initializeDemoData();
  }

  private isDemoMode(): boolean {
    // Check if we're in demo mode (no real API keys configured)
    const hasYouTubeKey =
      import.meta.env.VITE_YOUTUBE_CLIENT_ID &&
      import.meta.env.VITE_YOUTUBE_CLIENT_ID !== "your-youtube-client-id";
    const hasTwitchKey =
      import.meta.env.VITE_TWITCH_CLIENT_ID &&
      import.meta.env.VITE_TWITCH_CLIENT_ID !== "your-twitch-client-id";

    return !hasYouTubeKey && !hasTwitchKey;
  }

  private initializeDemoData() {
    this.demoData.set("youtube", {
      platform: "YouTube",
      viewerCount: Math.floor(Math.random() * 100) + 50,
      isLive: false,
      duration: 0,
    });

    this.demoData.set("twitch", {
      platform: "Twitch",
      viewerCount: Math.floor(Math.random() * 50) + 20,
      isLive: false,
      duration: 0,
    });

    this.demoData.set("facebook", {
      platform: "Facebook",
      viewerCount: Math.floor(Math.random() * 30) + 10,
      isLive: false,
      duration: 0,
    });

    this.demoData.set("x", {
      platform: "X",
      viewerCount: Math.floor(Math.random() * 25) + 5,
      isLive: false,
      duration: 0,
    });
  }

  isDemoModeActive(): boolean {
    return this.isDemo;
  }

  // Simulate platform connection
  async connectPlatform(platformId: string): Promise<boolean> {
    if (!this.isDemo) return false;

    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const data = this.demoData.get(platformId);
    if (data) {
      console.log(`[DEMO] Connected to ${data.platform}`);
      return true;
    }
    return false;
  }

  // Simulate starting a stream
  startDemoStream(
    callback: (data: {
      platform: string;
      viewers: number;
      messages: number;
    }) => void,
  ): void {
    if (!this.isDemo) return;

    console.log("[DEMO] Starting demo stream simulation...");

    // Mark all platforms as live
    this.demoData.forEach((data) => {
      data.isLive = true;
      data.duration = 0;
    });

    // Start demo data updates
    this.demoInterval = setInterval(() => {
      this.demoData.forEach((data, platformId) => {
        if (data.isLive) {
          // Simulate viewer count fluctuations
          const change = Math.floor(Math.random() * 10) - 5;
          data.viewerCount = Math.max(5, data.viewerCount + change);
          data.duration += 1;

          // Simulate messages
          const messageCount = Math.floor(Math.random() * 3);

          callback({
            platform: platformId,
            viewers: data.viewerCount,
            messages: messageCount,
          });
        }
      });
    }, 2000);
  }

  // Simulate stopping a stream
  stopDemoStream(): void {
    if (!this.isDemo) return;

    console.log("[DEMO] Stopping demo stream simulation...");

    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }

    this.demoData.forEach((data) => {
      data.isLive = false;
      data.duration = 0;
    });
  }

  // Get demo viewer counts
  getDemoViewerCounts(): { [platform: string]: number } {
    const counts: { [platform: string]: number } = {};
    this.demoData.forEach((data, platformId) => {
      counts[platformId] = data.viewerCount;
    });
    return counts;
  }

  // Generate demo chat messages
  generateDemoMessage(): {
    platform: string;
    username: string;
    message: string;
  } {
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
    const messages = [
      "Great stream! 🔥",
      "Love this content!",
      "Can you show that again?",
      "Amazing quality! 👏",
      "Hello from [PLATFORM]!",
      "This is so helpful, thanks!",
      "Keep up the great work!",
      "Subscribed! 🔔",
      "When is the next stream?",
      "Can you do a tutorial on this?",
    ];

    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const username = usernames[Math.floor(Math.random() * usernames.length)];
    const message = messages[
      Math.floor(Math.random() * messages.length)
    ].replace("[PLATFORM]", platform);

    return { platform, username, message };
  }

  // Get demo notifications
  getDemoNotifications(): string[] {
    if (!this.isDemo) return [];

    return [
      "🎉 Demo Mode Active - All features are simulated",
      "📺 Connect real platform APIs for live streaming",
      "🔧 Configure environment variables for production use",
      "💡 This demo shows full functionality without API keys",
    ];
  }

  cleanup(): void {
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }
}

export const demoService = new DemoService();
