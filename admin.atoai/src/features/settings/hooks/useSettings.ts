"use client";

import { useState } from "react";
import { settingsService } from "../services/settings.service";

export function useSettings(onEmailUpdated?: (newEmail: string) => void) {
  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Email change state
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);

  const updatePassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    setPasswordLoading(true);

    try {
      const res = await settingsService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setPasswordSuccess(res.message || "Password successfully updated!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(err.message || "Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const updateEmail = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setEmailError(null);
    setEmailSuccess(null);
    setEmailLoading(true);

    try {
      const res = await settingsService.changeEmail({ newEmail });
      setEmailSuccess(res.message || "Email address successfully updated!");
      if (res.user?.email && onEmailUpdated) {
        onEmailUpdated(res.user.email);
      }
      setNewEmail("");
    } catch (err: any) {
      setEmailError(err.message || "Failed to update email address");
    } finally {
      setEmailLoading(false);
    }
  };

  return {
    // Password state & handlers
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    passwordLoading,
    passwordError,
    passwordSuccess,
    updatePassword,

    // Email state & handlers
    newEmail,
    setNewEmail,
    emailLoading,
    emailError,
    emailSuccess,
    updateEmail,
  };
}
