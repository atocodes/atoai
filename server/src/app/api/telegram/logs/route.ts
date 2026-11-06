import { NextRequest, NextResponse } from "next/server";
import { telegramLogService } from "@/module/telegram-log";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const status = (searchParams.get("status") || "all") as any;
    const search = searchParams.get("search") || undefined;

    const result = await telegramLogService.listLogs({
      page,
      limit,
      status,
      search,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("[GET /api/telegram/logs] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch logs" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const count = await telegramLogService.clearLogs();
    return NextResponse.json({
      success: true,
      message: `Cleared ${count} telegram ingestion logs.`,
      deletedCount: count,
    });
  } catch (error: any) {
    console.error("[DELETE /api/telegram/logs] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to clear logs" },
      { status: 500 }
    );
  }
}
