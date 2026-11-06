export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminAuthStatus {
  authenticated: boolean;
  user: AdminUser | null;
  isAdmin: boolean;
}

export interface SetupAdminInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
