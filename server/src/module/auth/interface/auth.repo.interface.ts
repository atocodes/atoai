import { AdminUser } from "./auth.interface";

export interface IAuthRepo {
  findUserByEmail(email: string): Promise<AdminUser | null>;
  findUserById(id: string): Promise<AdminUser | null>;
  countAdmins(): Promise<number>;
  countUsers(): Promise<number>;
  setAdminRole(userId: string): Promise<AdminUser>;
}
