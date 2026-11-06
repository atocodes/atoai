import { NextResponse } from "next/server";
import { knowledgeService } from "@/module/knowledge/service/knowledge.service";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string; chunkId: string }> }
) {
  try {
    const { id, chunkId } = await context.params;
    const body = await req.json();

    const { content, reembed = true } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { success: false, error: "Chunk content is required and must be a string" },
        { status: 400 }
      );
    }

    const document = await knowledgeService.updateChunk(
      id,
      chunkId,
      content,
      reembed
    );

    return NextResponse.json({
      success: true,
      message: "Chunk updated and re-embedded successfully",
      document,
    });
  } catch (err: any) {
    console.error("[PATCH /api/knowledge/[id]/chunks/[chunkId]] error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update chunk" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string; chunkId: string }> }
) {
  try {
    const { id, chunkId } = await context.params;
    const deleted = await knowledgeService.deleteChunk(id, chunkId);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Failed to delete chunk or chunk not found" },
        { status: 404 }
      );
    }

    const document = await knowledgeService.findById(id);

    return NextResponse.json({
      success: true,
      message: "Chunk deleted successfully",
      document,
    });
  } catch (err: any) {
    console.error("[DELETE /api/knowledge/[id]/chunks/[chunkId]] error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete chunk" },
      { status: 500 }
    );
  }
}
