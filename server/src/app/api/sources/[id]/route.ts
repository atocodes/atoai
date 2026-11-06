import { NextRequest, NextResponse } from "next/server";
import { sourceService } from "@/module/sources";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const source = await sourceService.findById(id);

    if (!source) {
      return NextResponse.json(
        { success: false, error: "Source not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, source });
  } catch (error: any) {
    console.error("[GET /api/sources/[id]] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch source" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await sourceService.update(id, body);
    return NextResponse.json({ success: true, source: updated });
  } catch (error: any) {
    console.error("[PATCH /api/sources/[id]] error:", error);
    const isConflict =
      error.message?.includes("already exists") ||
      error.code === "P2002";
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update source" },
      { status: isConflict ? 409 : 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await sourceService.delete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Source not found or already deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Source deleted successfully",
    });
  } catch (error: any) {
    console.error("[DELETE /api/sources/[id]] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete source" },
      { status: 500 }
    );
  }
}
