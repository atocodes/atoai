import { NextResponse } from "next/server";
import { knowledgeSearchService } from "@/module/knowledge/service/knowledge-search.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query, limit, contentType, from, to, hashtags, mentions } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { success: false, error: "Query string is required" },
        { status: 400 }
      );
    }

    const results = await knowledgeSearchService.search(query, {
      limit: limit ? parseInt(limit, 10) : 10,
      contentType,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      hashtags,
      mentions,
    });

    return NextResponse.json({ success: true, count: results.length, results });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to execute semantic search" },
      { status: 500 }
    );
  }
}
