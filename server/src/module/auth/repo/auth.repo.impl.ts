import { prisma } from "@/prisma/db";
import { AdminUser } from "../interface/auth.interface";
import { IAuthRepo } from "../interface/auth.repo.interface";

export class AuthRepoImpl implements IAuthRepo {
  async findUserByEmail(email: string): Promise<AdminUser | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return user as AdminUser | null;
  }

  async findUserById(id: string): Promise<AdminUser | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return user as AdminUser | null;
  }

  async countAdmins(): Promise<number> {
    return prisma.user.count({
      where: { role: "admin" },
    });
  }

  async countUsers(): Promise<number> {
    return prisma.user.count();
  }

  async setAdminRole(userId: string): Promise<AdminUser> {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role: "admin" },
    });
    return updated as AdminUser;
  }
}
