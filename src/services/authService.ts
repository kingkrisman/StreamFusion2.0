interface AuthConfig {
  clientId: string;
  redirectUri: string;
  scopes: string[];
}

interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  platform: string;
}

class AuthService {
  private authConfigs: Map<string, AuthConfig> = new Map();

  constructor() {
    this.initializeConfigs();
  }

  private initializeConfigs() {
    // YouTube OAuth2 Configuration
    this.authConfigs.set("youtube", {
      clientId:
        process.env.REACT_APP_YOUTUBE_CLIENT_ID || "your-youtube-client-id",
      redirectUri: `${window.location.origin}/auth/youtube/callback`,
      scopes: [
        "https://www.googleapis.com/auth/youtube.readonly",
        "https://www.googleapis.com/auth/youtube.force-ssl",
      ],
    });

    // Twitch OAuth2 Configuration
    this.authConfigs.set("twitch", {
      clientId:
        process.env.REACT_APP_TWITCH_CLIENT_ID || "your-twitch-client-id",
      redirectUri: `${window.location.origin}/auth/twitch/callback`,
      scopes: ["chat:read", "chat:edit", "channel:read:stream_key"],
    });

    // Facebook OAuth2 Configuration
    this.authConfigs.set("facebook", {
      clientId:
        process.env.REACT_APP_FACEBOOK_CLIENT_ID || "your-facebook-client-id",
      redirectUri: `${window.location.origin}/auth/facebook/callback`,
      scopes: ["pages_read_engagement", "pages_manage_posts", "publish_video"],
    });

    // X (Twitter) OAuth2 Configuration
    this.authConfigs.set("x", {
      clientId: process.env.REACT_APP_X_CLIENT_ID || "your-x-client-id",
      redirectUri: `${window.location.origin}/auth/x/callback`,
      scopes: ["tweet.read", "tweet.write", "users.read"],
    });
  }

  // YouTube Authentication
  async authenticateYouTube(): Promise<AuthResponse | null> {
    const config = this.authConfigs.get("youtube");
    if (!config) throw new Error("YouTube config not found");

    try {
      // Open OAuth popup
      const authUrl =
        `https://accounts.google.com/oauth2/auth?` +
        `client_id=${config.clientId}&` +
        `redirect_uri=${encodeURIComponent(config.redirectUri)}&` +
        `scope=${encodeURIComponent(config.scopes.join(" "))}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `prompt=consent`;

      const authResult = await this.openAuthPopup(authUrl, "youtube");

      if (authResult) {
        // Exchange code for token
        const tokenResponse = await fetch("/api/auth/youtube/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: authResult.code }),
        });

        const tokenData = await tokenResponse.json();

        return {
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          expiresIn: tokenData.expires_in,
          platform: "youtube",
        };
      }

      return null;
    } catch (error) {
      console.error("YouTube authentication failed:", error);
      return null;
    }
  }

  // Twitch Authentication
  async authenticateTwitch(): Promise<AuthResponse | null> {
    const config = this.authConfigs.get("twitch");
    if (!config) throw new Error("Twitch config not found");

    try {
      const authUrl =
        `https://id.twitch.tv/oauth2/authorize?` +
        `client_id=${config.clientId}&` +
        `redirect_uri=${encodeURIComponent(config.redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(config.scopes.join(" "))}`;

      const authResult = await this.openAuthPopup(authUrl, "twitch");

      if (authResult) {
        const tokenResponse = await fetch("/api/auth/twitch/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: authResult.code }),
        });

        const tokenData = await tokenResponse.json();

        return {
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          expiresIn: tokenData.expires_in,
          platform: "twitch",
        };
      }

      return null;
    } catch (error) {
      console.error("Twitch authentication failed:", error);
      return null;
    }
  }

  // Facebook Authentication
  async authenticateFacebook(): Promise<AuthResponse | null> {
    const config = this.authConfigs.get("facebook");
    if (!config) throw new Error("Facebook config not found");

    try {
      const authUrl =
        `https://www.facebook.com/v18.0/dialog/oauth?` +
        `client_id=${config.clientId}&` +
        `redirect_uri=${encodeURIComponent(config.redirectUri)}&` +
        `scope=${encodeURIComponent(config.scopes.join(","))}&` +
        `response_type=code`;

      const authResult = await this.openAuthPopup(authUrl, "facebook");

      if (authResult) {
        const tokenResponse = await fetch("/api/auth/facebook/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: authResult.code }),
        });

        const tokenData = await tokenResponse.json();

        return {
          accessToken: tokenData.access_token,
          expiresIn: tokenData.expires_in,
          platform: "facebook",
        };
      }

      return null;
    } catch (error) {
      console.error("Facebook authentication failed:", error);
      return null;
    }
  }

  // X (Twitter) Authentication
  async authenticateX(): Promise<AuthResponse | null> {
    const config = this.authConfigs.get("x");
    if (!config) throw new Error("X config not found");

    try {
      // X uses OAuth 2.0 PKCE flow
      const codeVerifier = this.generateCodeVerifier();
      const codeChallenge = await this.generateCodeChallenge(codeVerifier);

      // Store code verifier for later use
      sessionStorage.setItem("x_code_verifier", codeVerifier);

      const authUrl =
        `https://twitter.com/i/oauth2/authorize?` +
        `response_type=code&` +
        `client_id=${config.clientId}&` +
        `redirect_uri=${encodeURIComponent(config.redirectUri)}&` +
        `scope=${encodeURIComponent(config.scopes.join(" "))}&` +
        `state=state&` +
        `code_challenge=${codeChallenge}&` +
        `code_challenge_method=S256`;

      const authResult = await this.openAuthPopup(authUrl, "x");

      if (authResult) {
        const tokenResponse = await fetch("/api/auth/x/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: authResult.code,
            codeVerifier,
          }),
        });

        const tokenData = await tokenResponse.json();

        return {
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          expiresIn: tokenData.expires_in,
          platform: "x",
        };
      }

      return null;
    } catch (error) {
      console.error("X authentication failed:", error);
      return null;
    }
  }

  private openAuthPopup(
    url: string,
    platform: string,
  ): Promise<{ code: string } | null> {
    return new Promise((resolve) => {
      const popup = window.open(
        url,
        `${platform}_auth`,
        "width=500,height=600,scrollbars=yes,resizable=yes",
      );

      if (!popup) {
        resolve(null);
        return;
      }

      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          resolve(null);
        }
      }, 1000);

      // Listen for auth success message
      const messageHandler = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (
          event.data.type === "auth_success" &&
          event.data.platform === platform
        ) {
          clearInterval(checkClosed);
          popup.close();
          window.removeEventListener("message", messageHandler);
          resolve({ code: event.data.code });
        }
      };

      window.addEventListener("message", messageHandler);
    });
  }

  private generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, Array.from(array)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return btoa(
      String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))),
    )
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  }

  // Token Management
  async refreshToken(
    platform: string,
    refreshToken: string,
  ): Promise<AuthResponse | null> {
    try {
      const response = await fetch(`/api/auth/${platform}/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const tokenData = await response.json();
        return {
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          expiresIn: tokenData.expires_in,
          platform,
        };
      }

      return null;
    } catch (error) {
      console.error(`Failed to refresh ${platform} token:`, error);
      return null;
    }
  }

  // Store tokens securely
  storeTokens(platform: string, tokens: AuthResponse) {
    localStorage.setItem(`${platform}_tokens`, JSON.stringify(tokens));
  }

  // Retrieve stored tokens
  getStoredTokens(platform: string): AuthResponse | null {
    const stored = localStorage.getItem(`${platform}_tokens`);
    return stored ? JSON.parse(stored) : null;
  }

  // Clear stored tokens
  clearTokens(platform: string) {
    localStorage.removeItem(`${platform}_tokens`);
  }
}

export const authService = new AuthService();
