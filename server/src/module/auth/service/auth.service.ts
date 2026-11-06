import { auth } from "./auth.config";
import { prisma } from "@/prisma/db";
import { AuthRepoImpl } from "../repo/auth.repo.impl";
import { IAuthRepo } from "../interface/auth.repo.interface";
import { IAuthService } from "../interface/auth.service.interface";
import { AdminAuthCheckResponse, AdminUser, SetupAdminDTO } from "../interface/auth.interface";

export class AuthService implements IAuthService {
  private authRepo: IAuthRepo;

  constructor(authRepo?: IAuthRepo) {
    this.authRepo = authRepo ?? new AuthRepoImpl();
  }

  async checkAdminStatus(headers: Headers): Promise<AdminAuthCheckResponse> {
    try {
      let session = await auth.api.getSession({ headers });
      if (session && session.user) {
        const user = await this.authRepo.findUserById(session.user.id);
        const role = (user?.role || (session.user as any)?.role || "").toLowerCase();
        return {
          authenticated: true,
          user: user ?? (session.user as unknown as AdminUser),
          isAdmin: role === "admin",
        };
      }

      // Fallback: Direct database session lookup by Bearer token
      const authHeader = headers.get("authorization") || "";
      const token = authHeader.replace(/^Bearer\s+/i, "").trim();
      if (token) {
        const dbSession = await prisma.session.findUnique({
          where: { token },
          include: { user: true },
        });

        if (dbSession && dbSession.user && new Date() < new Date(dbSession.expiresAt)) {
          const role = (dbSession.user.role || "").toLowerCase();
          return {
            authenticated: true,
            user: dbSession.user as unknown as AdminUser,
            isAdmin: role === "admin",
          };
        }
      }

      return { authenticated: false, user: null, isAdmin: false };
    } catch (err) {
      console.error("[AuthService.checkAdminStatus] error:", err);
      return { authenticated: false, user: null, isAdmin: false };
    }
  }

  async hasAnyAdmin(): Promise<boolean> {
    const count = await this.authRepo.countAdmins();
    return count > 0;
  }

  async setupInitialAdmin(dto: SetupAdminDTO): Promise<AdminUser> {
    const hasAdmin = await this.hasAnyAdmin();
    if (hasAdmin) {
      throw new Error("Admin already exists. Initial setup is disabled.");
    }

    // Create user via Better Auth
    const created = await auth.api.signUpEmail({
      body: {
        email: dto.email,
        password: dto.password,
        name: dto.name,
      },
    });

    if (!created || !created.user) {
      throw new Error("Failed to register admin account with Better Auth.");
    }

    // Promote to admin
    const adminUser = await this.authRepo.setAdminRole(created.user.id);
    return adminUser;
  }
}

export const authService = new AuthService();
