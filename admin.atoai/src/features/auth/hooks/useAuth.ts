"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminUser, LoginInput, SetupAdminInput } from "../types/auth.types";
import { authService } from "../services/auth.service";

export function useAuth() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [hasAdmin, setHasAdmin] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verify = useCallback(async () => {
    try {
      const [status, hasAdminResult] = await Promise.all([
        authService.checkAdminStatus(),
        authService.checkHasAdmin(),
      ]);

      setHasAdmin(hasAdminResult);
      if (status.authenticated && status.isAdmin) {
        setUser(status.user);
      } else {
        setUser(null);
      }
    } catch (err: any) {
      console.error("Auth verification failed:", err);
      const cached = authService.getCachedUser();
      if (!cached) {
        setUser(null);
      }
    } finally {
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    // Client-side hydration: load cached user right after mount
    const cached = authService.getCachedUser();
    if (cached) {
      setUser(cached);
      setAuthChecked(true);
    }
    // Background session verification
    verify();
  }, [verify]);

  const login = async (input: LoginInput) => {
    setLoading(true);
    setError(null);
    try {
      const status = await authService.signIn(input);
      setUser(status.user);
      return status;
    } catch (err: any) {
      setError(err.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const setupAdmin = async (input: SetupAdminInput) => {
    setLoading(true);
    setError(null);
    try {
      await authService.setupInitialAdmin(input);
      // Immediately log in with created credentials
      return await login({ email: input.email, password: input.password });
    } catch (err: any) {
      setError(err.message || "Admin setup failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authService.signOut();
    setUser(null);
  };

  return {
    user,
    hasAdmin,
    authChecked,
    loading,
    error,
    login,
    setupAdmin,
    logout,
    refresh: verify,
  };
}
