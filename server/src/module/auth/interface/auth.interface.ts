export interface AdminUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminSession {
  user: AdminUser;
  session: {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
}

export interface SetupAdminDTO {
  name: string;
  email: string;
  password: string;
}

export interface AdminAuthCheckResponse {
  authenticated: boolean;
  user?: AdminUser | null;
  isAdmin: boolean;
}
