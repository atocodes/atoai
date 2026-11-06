import { NextResponse } from "next/server";
import { knowledgeService } from "@/module/knowledge/service/knowledge.service";

export async function GET() {
  try {
    const stats = await knowledgeService.getStats();
    return NextResponse.json({ success: true, stats });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to retrieve knowledge statistics" },
      { status: 500 }
    );
  }
}
