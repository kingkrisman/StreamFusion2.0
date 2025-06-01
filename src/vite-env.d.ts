/// <reference types="vite/client" />

interface ImportMetaEnv {
  // YouTube
  readonly VITE_YOUTUBE_CLIENT_ID: string;
  readonly VITE_YOUTUBE_API_KEY: string;

  // Twitch
  readonly VITE_TWITCH_CLIENT_ID: string;

  // Facebook
  readonly VITE_FACEBOOK_CLIENT_ID: string;

  // X (Twitter)
  readonly VITE_X_CLIENT_ID: string;

  // TURN Server
  readonly VITE_TURN_USERNAME: string;
  readonly VITE_TURN_CREDENTIAL: string;

  // Backend URLs
  readonly VITE_API_URL: string;
  readonly VITE_SOCKET_URL: string;
  readonly VITE_SIGNALING_URL: string;
  readonly VITE_STREAMING_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
