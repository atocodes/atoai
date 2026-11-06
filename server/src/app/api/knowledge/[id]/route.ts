import { NextResponse } from "next/server";
import { knowledgeService } from "@/module/knowledge/service/knowledge.service";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const document = await knowledgeService.findById(id);

    if (!document) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, document });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to retrieve document" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const deleted = await knowledgeService.delete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Failed to delete document or document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Document deleted successfully" });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete document" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();


    const document = await knowledgeService.update(id, body);

    return NextResponse.json({
      success: true,
      message: "Document updated successfully",
      document
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update document" },
      { status: 500 }
    );
  }
}
