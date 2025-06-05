export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar?: string;
  createdAt: Date;
  lastLogin: Date;
  streamingPlatforms: ConnectedPlatform[];
  preferences: UserPreferences;
}

export interface ConnectedPlatform {
  platform: "youtube" | "twitch" | "facebook" | "twitter";
  platformUserId: string;
  platformUsername: string;
  connected: boolean;
  accessToken?: string;
  refreshToken?: string;
  connectedAt: Date;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  defaultStreamQuality: "HD" | "FHD";
  emailNotifications: boolean;
  streamNotifications: boolean;
  autoSaveRecordings: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
