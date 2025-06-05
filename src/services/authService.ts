import {
  User,
  LoginCredentials,
  SignupCredentials,
  AuthResponse,
} from "@/types/auth";

// Mock user data for demo purposes
const DEMO_USERS: User[] = [
  {
    id: "1",
    username: "streamfusion_demo",
    email: "demo@streamfusion.com",
    displayName: "StreamFusion Demo User",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=streamfusion",
    createdAt: new Date("2024-01-01"),
    lastLogin: new Date(),
    streamingPlatforms: [
      {
        platform: "youtube",
        platformUserId: "UC123456789",
        platformUsername: "StreamFusionDemo",
        connected: true,
        connectedAt: new Date("2024-01-01"),
      },
      {
        platform: "twitch",
        platformUserId: "streamfusion_demo",
        platformUsername: "streamfusion_demo",
        connected: true,
        connectedAt: new Date("2024-01-01"),
      },
    ],
    preferences: {
      theme: "system",
      defaultStreamQuality: "FHD",
      emailNotifications: true,
      streamNotifications: true,
      autoSaveRecordings: true,
    },
  },
];

class AuthService {
  private apiUrl = import.meta.env.VITE_API_URL || "";
  private isDemo = import.meta.env.VITE_DEMO_MODE === "true" || !this.apiUrl;

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (this.isDemo) {
      return this.mockLogin(credentials);
    }

    try {
      const response = await fetch(`${this.apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      return response.json();
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    if (this.isDemo) {
      return this.mockSignup(credentials);
    }

    try {
      const response = await fetch(`${this.apiUrl}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Signup failed");
      }

      return response.json();
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    if (this.isDemo) {
      this.clearLocalStorage();
      return;
    }

    try {
      const token = this.getStoredToken();
      if (token) {
        await fetch(`${this.apiUrl}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      this.clearLocalStorage();
    }
  }

  async validateToken(): Promise<User | null> {
    const token = this.getStoredToken();
    if (!token) return null;

    if (this.isDemo) {
      const storedUser = localStorage.getItem("streamfusion_demo_user");
      return storedUser ? JSON.parse(storedUser) : null;
    }

    try {
      const response = await fetch(`${this.apiUrl}/auth/validate`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        this.clearLocalStorage();
        return null;
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error("Token validation error:", error);
      this.clearLocalStorage();
      return null;
    }
  }

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    if (this.isDemo) {
      const storedUser = this.getStoredUser();
      if (storedUser) {
        const updatedUser = { ...storedUser, ...updates };
        localStorage.setItem(
          "streamfusion_demo_user",
          JSON.stringify(updatedUser),
        );
        return updatedUser;
      }
      throw new Error("User not found");
    }

    const token = this.getStoredToken();
    const response = await fetch(`${this.apiUrl}/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Profile update failed");
    }

    return response.json();
  }

  // Demo/Mock implementations
  private async mockLogin(
    credentials: LoginCredentials,
  ): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API delay

    // Check if credentials match demo user or create new user
    let user = DEMO_USERS.find((u) => u.email === credentials.email);

    if (!user) {
      // For demo, if user doesn't exist, we'll create one
      if (
        credentials.email === "demo@streamfusion.com" &&
        credentials.password === "demo123"
      ) {
        user = DEMO_USERS[0];
      } else {
        throw new Error(
          "Invalid credentials. Use demo@streamfusion.com / demo123 for demo",
        );
      }
    }

    const authResponse: AuthResponse = {
      user: { ...user, lastLogin: new Date() },
      accessToken: "demo_access_token_" + Date.now(),
      refreshToken: "demo_refresh_token_" + Date.now(),
      expiresIn: 3600,
    };

    // Store in localStorage for demo
    localStorage.setItem("streamfusion_demo_token", authResponse.accessToken);
    localStorage.setItem(
      "streamfusion_demo_user",
      JSON.stringify(authResponse.user),
    );

    return authResponse;
  }

  private async mockSignup(
    credentials: SignupCredentials,
  ): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 1200)); // Simulate API delay

    // Check if user already exists
    const existingUser = DEMO_USERS.find(
      (u) =>
        u.email === credentials.email || u.username === credentials.username,
    );

    if (existingUser) {
      throw new Error("User with this email or username already exists");
    }

    // Create new user
    const newUser: User = {
      id: "demo_" + Date.now(),
      username: credentials.username,
      email: credentials.email,
      displayName: credentials.displayName,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${credentials.username}`,
      createdAt: new Date(),
      lastLogin: new Date(),
      streamingPlatforms: [],
      preferences: {
        theme: "system",
        defaultStreamQuality: "FHD",
        emailNotifications: true,
        streamNotifications: true,
        autoSaveRecordings: true,
      },
    };

    const authResponse: AuthResponse = {
      user: newUser,
      accessToken: "demo_access_token_" + Date.now(),
      refreshToken: "demo_refresh_token_" + Date.now(),
      expiresIn: 3600,
    };

    // Store in localStorage for demo
    localStorage.setItem("streamfusion_demo_token", authResponse.accessToken);
    localStorage.setItem(
      "streamfusion_demo_user",
      JSON.stringify(authResponse.user),
    );

    // Add to demo users for future logins
    DEMO_USERS.push(newUser);

    return authResponse;
  }

  private getStoredToken(): string | null {
    return (
      localStorage.getItem("streamfusion_demo_token") ||
      localStorage.getItem("streamfusion_token")
    );
  }

  private getStoredUser(): User | null {
    const stored =
      localStorage.getItem("streamfusion_demo_user") ||
      localStorage.getItem("streamfusion_user");
    return stored ? JSON.parse(stored) : null;
  }

  private clearLocalStorage(): void {
    localStorage.removeItem("streamfusion_demo_token");
    localStorage.removeItem("streamfusion_demo_user");
    localStorage.removeItem("streamfusion_token");
    localStorage.removeItem("streamfusion_user");
  }

  // Password validation
  validatePassword(password: string): string[] {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    return errors;
  }

  // Username validation
  validateUsername(username: string): string[] {
    const errors: string[] = [];

    if (username.length < 3) {
      errors.push("Username must be at least 3 characters long");
    }

    if (username.length > 20) {
      errors.push("Username must be no more than 20 characters long");
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.push(
        "Username can only contain letters, numbers, and underscores",
      );
    }

    return errors;
  }
}

export const authService = new AuthService();
