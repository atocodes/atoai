import { NextRequest, NextResponse } from "next/server";
import { sourceService } from "@/module/sources";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updated = await sourceService.toggleStatus(id);

    return NextResponse.json({
      success: true,
      source: updated,
      message: `Source status changed to ${updated.status}`,
    });
  } catch (error: any) {
    console.error("[POST /api/sources/[id]/toggle] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to toggle source status" },
      { status: 500 }
    );
  }
}
