import { NextResponse } from "next/server";
import { auth } from "@/module/auth/service/auth.config";
import { prisma } from "@/prisma/db";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Active session required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const newEmail = body.newEmail?.trim().toLowerCase();

    if (!newEmail || !newEmail.includes("@") || !newEmail.includes(".")) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required" },
        { status: 400 }
      );
    }

    // Check if email already in use
    const existing = await prisma.user.findUnique({
      where: { email: newEmail },
    });

    if (existing && existing.id !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "This email address is already in use by another account" },
        { status: 400 }
      );
    }

    // Update user email
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { email: newEmail },
    });

    return NextResponse.json({
      success: true,
      message: "Admin email updated successfully",
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update email address" },
      { status: 500 }
    );
  }
}
