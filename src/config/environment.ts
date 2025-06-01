interface EnvironmentConfig {
  production: boolean;
  apiUrl: string;
  socketUrl: string;
  signalingUrl: string;
  streamingServerUrl: string;
  youtube: {
    clientId: string;
    apiKey: string;
  };
  twitch: {
    clientId: string;
  };
  facebook: {
    appId: string;
  };
  x: {
    clientId: string;
  };
  turnServers: Array<{
    urls: string;
    username?: string;
    credential?: string;
  }>;
}

const development: EnvironmentConfig = {
  production: false,
  apiUrl: "http://localhost:3000/api",
  socketUrl: "http://localhost:3001",
  signalingUrl: "ws://localhost:8081",
  streamingServerUrl: "ws://localhost:8080/ws",
  youtube: {
    clientId:
      import.meta.env.VITE_YOUTUBE_CLIENT_ID || "your-youtube-client-id",
    apiKey: import.meta.env.VITE_YOUTUBE_API_KEY || "your-youtube-api-key",
  },
  twitch: {
    clientId: import.meta.env.VITE_TWITCH_CLIENT_ID || "your-twitch-client-id",
  },
  facebook: {
    appId: import.meta.env.VITE_FACEBOOK_APP_ID || "your-facebook-app-id",
  },
  x: {
    clientId: import.meta.env.VITE_X_CLIENT_ID || "your-x-client-id",
  },
  turnServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const production: EnvironmentConfig = {
  production: true,
  apiUrl: "https://streamfusion-api.fly.dev/api",
  socketUrl: "https://streamfusion-socket.fly.dev",
  signalingUrl: "wss://streamfusion-signaling.fly.dev",
  streamingServerUrl: "wss://streamfusion-streaming.fly.dev/ws",
  youtube: {
    clientId: import.meta.env.VITE_YOUTUBE_CLIENT_ID || "",
    apiKey: import.meta.env.VITE_YOUTUBE_API_KEY || "",
  },
  twitch: {
    clientId: import.meta.env.VITE_TWITCH_CLIENT_ID || "",
  },
  facebook: {
    appId: import.meta.env.VITE_FACEBOOK_APP_ID || "",
  },
  x: {
    clientId: import.meta.env.VITE_X_CLIENT_ID || "",
  },
  turnServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    {
      urls: "turn:streamfusion-turn.fly.dev:3478",
      username: import.meta.env.VITE_TURN_USERNAME || "",
      credential: import.meta.env.VITE_TURN_CREDENTIAL || "",
    },
  ],
};

export const config =
  process.env.NODE_ENV === "production" ? production : development;

export default config;
