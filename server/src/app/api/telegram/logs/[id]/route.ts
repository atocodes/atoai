import { NextRequest, NextResponse } from "next/server";
import { telegramLogService } from "@/module/telegram-log";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const log = await telegramLogService.getLogById(id);

    if (!log) {
      return NextResponse.json(
        { success: false, error: "Log entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      log,
    });
  } catch (error: any) {
    console.error("[GET /api/telegram/logs/:id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch log details" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await telegramLogService.deleteLog(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Log entry not found or failed to delete" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Log entry deleted successfully",
    });
  } catch (error: any) {
    console.error("[DELETE /api/telegram/logs/:id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete log entry" },
      { status: 500 }
    );
  }
}
