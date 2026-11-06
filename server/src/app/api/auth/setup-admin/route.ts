import { NextResponse } from "next/server";
import { authService } from "@/module/auth/service/auth.service";

export async function GET() {
  const hasAdmin = await authService.hasAnyAdmin();
  return NextResponse.json({ hasAdmin });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const admin = await authService.setupInitialAdmin(body);
    return NextResponse.json({ success: true, user: admin }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to setup initial admin" },
      { status: 400 }
    );
  }
}
