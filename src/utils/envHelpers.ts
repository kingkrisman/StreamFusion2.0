// Helper functions for environment variables with fallbacks

export const getEnvVar = (
  key: keyof ImportMetaEnv,
  fallback: string = "",
): string => {
  try {
    return import.meta.env[key] || fallback;
  } catch (error) {
    console.warn(
      `Environment variable ${key} not found, using fallback:`,
      fallback,
    );
    return fallback;
  }
};

export const isDevelopment = (): boolean => {
  try {
    return import.meta.env.MODE !== "production";
  } catch (error) {
    return true; // Default to development if can't determine
  }
};

export const isProduction = (): boolean => {
  try {
    return import.meta.env.MODE === "production";
  } catch (error) {
    return false; // Default to development if can't determine
  }
};

// Platform client IDs with fallbacks for demo mode
export const getPlatformClientId = (platform: string): string => {
  const fallbacks: Record<string, string> = {
    youtube: "demo-youtube-client-id",
    twitch: "demo-twitch-client-id",
    facebook: "demo-facebook-client-id",
    x: "demo-x-client-id",
  };

  switch (platform) {
    case "youtube":
      return getEnvVar("VITE_YOUTUBE_CLIENT_ID", fallbacks.youtube);
    case "twitch":
      return getEnvVar("VITE_TWITCH_CLIENT_ID", fallbacks.twitch);
    case "facebook":
      return getEnvVar("VITE_FACEBOOK_CLIENT_ID", fallbacks.facebook);
    case "x":
      return getEnvVar("VITE_X_CLIENT_ID", fallbacks.x);
    default:
      return "";
  }
};

// Service URLs with fallbacks
export const getServiceUrl = (
  service: "api" | "socket" | "signaling" | "streaming",
): string => {
  const defaults = {
    development: {
      api: "http://localhost:3000/api",
      socket: "http://localhost:3001",
      signaling: "ws://localhost:8081",
      streaming: "ws://localhost:8080/ws",
    },
    production: {
      api: "https://streamfusion-api.fly.dev/api",
      socket: "https://streamfusion-socket.fly.dev",
      signaling: "wss://streamfusion-signaling.fly.dev",
      streaming: "wss://streamfusion-streaming.fly.dev/ws",
    },
  };

  const env = isProduction() ? "production" : "development";

  switch (service) {
    case "api":
      return getEnvVar("VITE_API_URL", defaults[env].api);
    case "socket":
      return getEnvVar("VITE_SOCKET_URL", defaults[env].socket);
    case "signaling":
      return getEnvVar("VITE_SIGNALING_URL", defaults[env].signaling);
    case "streaming":
      return getEnvVar("VITE_STREAMING_URL", defaults[env].streaming);
    default:
      return "";
  }
};
