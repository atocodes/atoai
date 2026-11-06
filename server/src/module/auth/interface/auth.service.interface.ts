import { AdminAuthCheckResponse, AdminUser, SetupAdminDTO } from "./auth.interface";

export interface IAuthService {
  checkAdminStatus(headers: Headers): Promise<AdminAuthCheckResponse>;
  hasAnyAdmin(): Promise<boolean>;
  setupInitialAdmin(dto: SetupAdminDTO): Promise<AdminUser>;
}
