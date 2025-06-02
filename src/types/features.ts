// Layouts & Theming
export interface StreamLayout {
  id: string;
  name: string;
  type:
    | "single"
    | "dual"
    | "grid"
    | "picture-in-picture"
    | "screen-share"
    | "custom";
  zones: LayoutZone[];
  preview: string;
  isCustom: boolean;
}

export interface LayoutZone {
  id: string;
  type: "video" | "screen" | "image" | "text" | "widget";
  position: { x: number; y: number; width: number; height: number };
  source?: string;
  settings: Record<string, any>;
}

export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    primary: string;
    secondary: string;
  };
  overlays: ThemeOverlay[];
}

export interface ThemeOverlay {
  id: string;
  type: "frame" | "border" | "shadow" | "gradient";
  settings: Record<string, any>;
}

// AR & Widgets
export interface AROverlay {
  id: string;
  name: string;
  type: "face-filter" | "background" | "3d-object" | "effects";
  model?: string;
  settings: {
    tracking: "face" | "hand" | "body" | "environment";
    position: { x: number; y: number; z: number };
    scale: number;
    rotation: { x: number; y: number; z: number };
  };
  isActive: boolean;
}

export interface StreamWidget {
  id: string;
  name: string;
  type:
    | "chat"
    | "donations"
    | "followers"
    | "alerts"
    | "polls"
    | "timer"
    | "stats";
  position: { x: number; y: number };
  size: { width: number; height: number };
  settings: WidgetSettings;
  isVisible: boolean;
}

export interface WidgetSettings {
  theme?: string;
  animation?: "slide" | "fade" | "bounce" | "none";
  duration?: number;
  sound?: boolean;
  [key: string]: any;
}

// Gamification
export interface GamificationSettings {
  enabled: boolean;
  points: {
    viewing: number;
    chatting: number;
    sharing: number;
    subscribing: number;
  };
  badges: Badge[];
  leaderboard: boolean;
  achievements: Achievement[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirements: {
    type: "watch_time" | "chat_messages" | "follows" | "donations";
    value: number;
  };
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  reward: number;
  unlocked: boolean;
}

// AI Features
export interface AISettings {
  moderation: {
    enabled: boolean;
    toxicity: number;
    spam: number;
    language: boolean;
    customRules: string[];
  };
  director: {
    enabled: boolean;
    autoSwitch: boolean;
    focusDetection: boolean;
    sceneRecommendations: boolean;
  };
  captions: {
    enabled: boolean;
    language: string;
    realTime: boolean;
    translation: boolean;
  };
}

// Streaming Quality
export interface StreamQuality {
  resolution: "720p" | "1080p" | "1440p" | "4K";
  fps: 30 | 60 | 120;
  bitrate: number;
  audioQuality: "standard" | "high" | "lossless";
  lowLatency: boolean;
}

export interface AudioEnhancement {
  noiseReduction: boolean;
  echoCancellation: boolean;
  autoGain: boolean;
  compression: boolean;
  equalizer: EqualizerBand[];
}

export interface EqualizerBand {
  frequency: number;
  gain: number;
}

// Analytics & Insights
export interface StreamAnalytics {
  realTime: {
    viewers: number;
    chatMessages: number;
    engagement: number;
    quality: StreamQualityMetrics;
  };
  historical: {
    totalStreams: number;
    totalHours: number;
    averageViewers: number;
    peakViewers: number;
    revenue: number;
    growth: GrowthMetrics;
  };
  audience: {
    demographics: AudienceDemographics;
    retention: RetentionMetrics;
    sources: TrafficSources;
  };
}

export interface StreamQualityMetrics {
  bitrate: number;
  fps: number;
  droppedFrames: number;
  latency: number;
  stability: number;
}

export interface GrowthMetrics {
  viewersChange: number;
  followersChange: number;
  subscriptionsChange: number;
  revenueChange: number;
}

export interface AudienceDemographics {
  age: { [range: string]: number };
  location: { [country: string]: number };
  devices: { [device: string]: number };
}

// Mobile & Team Features
export interface MobileGuestSettings {
  enabled: boolean;
  qualityLimit: "480p" | "720p" | "1080p";
  permissions: {
    video: boolean;
    audio: boolean;
    chat: boolean;
  };
}

export interface TeamAccount {
  id: string;
  name: string;
  role: "owner" | "admin" | "producer" | "moderator" | "viewer";
  permissions: TeamPermissions;
  lastActive: Date;
}

export interface TeamPermissions {
  canStream: boolean;
  canModerate: boolean;
  canInviteGuests: boolean;
  canAccessAnalytics: boolean;
  canManageSettings: boolean;
}

// Business Features
export interface PaymentSettings {
  enabled: boolean;
  providers: ("stripe" | "paypal" | "crypto")[];
  donations: {
    enabled: boolean;
    minimumAmount: number;
    goals: DonationGoal[];
  };
  subscriptions: {
    enabled: boolean;
    tiers: SubscriptionTier[];
  };
}

export interface DonationGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  deadline?: Date;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  benefits: string[];
  color: string;
}

// Cloud & Recording
export interface CloudSettings {
  recording: {
    enabled: boolean;
    quality: "standard" | "high" | "premium";
    storage: "aws" | "gcp" | "azure";
    retention: number; // days
  };
  editing: {
    enabled: boolean;
    autoHighlights: boolean;
    aiEditing: boolean;
  };
}
