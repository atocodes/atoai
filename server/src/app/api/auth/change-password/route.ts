import { NextResponse } from "next/server";
import { auth } from "@/module/auth/service/auth.config";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.currentPassword || !body.newPassword) {
      return NextResponse.json(
        { success: false, error: "Both current password and new password are required" },
        { status: 400 }
      );
    }

    if (body.newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: "New password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    const result = await auth.api.changePassword({
      headers: req.headers,
      body: {
        currentPassword: body.currentPassword,
        newPassword: body.newPassword,
        revokeOtherSessions: body.revokeOtherSessions ?? true,
      },
    });

    return NextResponse.json({ success: true, message: "Password updated successfully", result });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update password" },
      { status: 400 }
    );
  }
}
