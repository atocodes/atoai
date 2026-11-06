import { NextResponse } from "next/server";
import { knowledgeService } from "@/module/knowledge/service/knowledge.service";
import { createBlogKnowledge } from "@/lib/knowledge/blog";
import { KnowledgeDocument } from "@/module/knowledge";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const contentType = searchParams.get("contentType") || undefined;
    const author = searchParams.get("author") || undefined;
    const search = searchParams.get("search") || undefined;

    const result = await knowledgeService.list({
      page,
      limit,
      contentType,
      author,
      search,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch knowledge documents" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.type == "blog") {
      // This is the blog sent from portfolio to be parsed and document for the rag system
      const knowledge = await createBlogKnowledge({
        content: body
      })

      if (!knowledge) {
        return NextResponse.json({ status: false, error: "document not created" }, { status: 500 })
      }

      const document = await knowledgeService.create(knowledge)
      return NextResponse.json({ success: true, id: document.id }, { status: 201 });
    }

    if (!body.content || !body.author || !body.contentType) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: content, author, contentType" },
        { status: 400 }
      );
    }

    const document = await knowledgeService.create(body);

    return NextResponse.json({ success: true, document }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to ingest knowledge document" },
      { status: 500 }
    );
  }
}
