import { NextResponse } from "next/server";
import { telegramLogService } from "@/module/telegram-log";

export async function GET() {
  try {
    const stats = await telegramLogService.getStats();
    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    console.error("[GET /api/telegram/logs/stats] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
