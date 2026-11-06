import { NextResponse } from "next/server";
import { authService } from "@/module/auth/service/auth.service";

export async function GET(req: Request) {
  const status = await authService.checkAdminStatus(req.headers);
  return NextResponse.json(status);
}
