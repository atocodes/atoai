import { authClient } from "@/lib/auth-client";
import { AdminAuthStatus, AdminUser, LoginInput, SetupAdminInput } from "../types/auth.types";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

const STORAGE_KEYS = {
  TOKEN: "atoai_admin_token",
  USER: "atoai_admin_user",
};

export const authService = {
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  getCachedUser(): AdminUser | null {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  saveSession(token?: string | null, user?: AdminUser | null) {
    if (typeof window === "undefined") return;
    if (token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    }
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
  },

  clearSession() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  },

  async checkAdminStatus(): Promise<AdminAuthStatus> {
    const token = this.getToken();
    const cachedUser = this.getCachedUser();

    try {
      const headers = this.getAuthHeaders();
      const res = await fetch(`${SERVER_URL}/api/auth/me`, {
        headers,
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          this.clearSession();
          return { authenticated: false, user: null, isAdmin: false };
        }
        // If server temporarily unreachable but we have cached admin session
        if (cachedUser && cachedUser.role?.toLowerCase() === "admin") {
          return { authenticated: true, user: cachedUser, isAdmin: true };
        }
        return { authenticated: false, user: null, isAdmin: false };
      }

      const data: AdminAuthStatus = await res.json();
      if (data.authenticated && data.isAdmin && data.user) {
        this.saveSession(token, data.user);
        return data;
      } else {
        this.clearSession();
        return { authenticated: false, user: null, isAdmin: false };
      }
    } catch {
      // If network glitch on refresh, retain cached session if admin
      if (cachedUser && cachedUser.role?.toLowerCase() === "admin") {
        return { authenticated: true, user: cachedUser, isAdmin: true };
      }
      return { authenticated: false, user: null, isAdmin: false };
    }
  },

  async checkHasAdmin(): Promise<boolean> {
    try {
      const res = await fetch(`${SERVER_URL}/api/auth/setup-admin`, {
        credentials: "include",
      });
      if (!res.ok) return true;
      const data = await res.json();
      return !!data.hasAdmin;
    } catch {
      return true;
    }
  },

  async setupInitialAdmin(input: SetupAdminInput) {
    const res = await fetch(`${SERVER_URL}/api/auth/setup-admin`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to initialize admin account");
    }
    return data;
  },

  async signIn(input: LoginInput) {
    const res = await authClient.signIn.email({
      email: input.email,
      password: input.password,
    });

    if (res.error) {
      throw new Error(res.error.message || "Invalid credentials");
    }

    // Better Auth response returns data containing user and session/token
    const returnedUser = (res.data as any)?.user;
    const token = (res.data as any)?.token || (res.data as any)?.session?.token || "";
    const isDirectAdmin = returnedUser?.role?.toLowerCase() === "admin";

    if (token) {
      this.saveSession(token, returnedUser);
    }

    // Also check via server session endpoint
    const status = await this.checkAdminStatus().catch(() => ({
      authenticated: true,
      user: returnedUser,
      isAdmin: isDirectAdmin,
    }));

    const isAdmin = isDirectAdmin || status.isAdmin || status.user?.role?.toLowerCase() === "admin";

    if (!isAdmin) {
      await authClient.signOut().catch(() => {});
      this.clearSession();
      throw new Error("Access denied: You do not have administrator permissions.");
    }

    const finalUser = status.user ?? returnedUser;
    this.saveSession(token, finalUser);

    return {
      authenticated: true,
      user: finalUser,
      isAdmin: true,
    };
  },

  async signOut() {
    this.clearSession();
    await authClient.signOut().catch(() => {});
  },
};
