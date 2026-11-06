import { NextResponse } from "next/server";
import { sourceService } from "@/module/sources";

export async function GET() {
  try {
    const stats = await sourceService.getStats();
    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    console.error("[GET /api/sources/stats] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch source stats" },
      { status: 500 }
    );
  }
}
