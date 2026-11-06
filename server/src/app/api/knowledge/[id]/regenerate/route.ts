import { NextResponse } from "next/server";
import { knowledgeService } from "@/module/knowledge/service/knowledge.service";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const document = await knowledgeService.regenerateChunks(id);

    return NextResponse.json({
      success: true,
      message: "Chunks regenerated and embedded successfully",
      document,
    });
  } catch (err: any) {
    console.error("[POST /api/knowledge/[id]/regenerate] error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to regenerate chunks" },
      { status: 500 }
    );
  }
}
