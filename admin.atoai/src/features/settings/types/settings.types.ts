export interface UpdatePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdatePasswordResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface UpdateEmailInput {
  newEmail: string;
}

export interface UpdateEmailResponse {
  success: boolean;
  message?: string;
  error?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role?: string;
  };
}
