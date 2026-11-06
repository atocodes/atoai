import { authClient } from "@/lib/auth-client";
import { authService } from "@/features/auth/services/auth.service";
import {
  UpdateEmailInput,
  UpdateEmailResponse,
  UpdatePasswordInput,
  UpdatePasswordResponse,
} from "../types/settings.types";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

export const settingsService = {
  async changePassword(input: UpdatePasswordInput): Promise<UpdatePasswordResponse> {
    if (input.newPassword !== input.confirmPassword) {
      throw new Error("New password and confirm password do not match");
    }

    if (input.newPassword.length < 8) {
      throw new Error("New password must be at least 8 characters long");
    }

    try {
      const res = await fetch(`${SERVER_URL}/api/auth/change-password`, {
        method: "POST",
        credentials: "include",
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({
          currentPassword: input.currentPassword,
          newPassword: input.newPassword,
          revokeOtherSessions: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update password");
      }
      return data;
    } catch (err: any) {
      const clientRes = await authClient.changePassword({
        currentPassword: input.currentPassword,
        newPassword: input.newPassword,
        revokeOtherSessions: true,
      });

      if (clientRes.error) {
        throw new Error(clientRes.error.message || err.message || "Failed to update password");
      }

      return { success: true, message: "Password updated successfully" };
    }
  },

  async changeEmail(input: UpdateEmailInput): Promise<UpdateEmailResponse> {
    const res = await fetch(`${SERVER_URL}/api/auth/change-email`, {
      method: "POST",
      credentials: "include",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(input),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to update email address");
    }

    return data;
  },
};
