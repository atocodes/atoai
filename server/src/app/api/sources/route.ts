import { NextRequest, NextResponse } from "next/server";
import { sourceService } from "@/module/sources";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const status = (searchParams.get("status") || "all") as any;
    const type = (searchParams.get("type") || "all") as any;
    const search = searchParams.get("search") || undefined;

    const result = await sourceService.listSources({
      page,
      limit,
      status,
      type,
      search,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("[GET /api/sources] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch sources" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name && !body.username && !body.channelId && !body.url) {
      return NextResponse.json(
        {
          success: false,
          error: "At least one identifying field (name, channelId, username, or url) is required.",
        },
        { status: 400 }
      );
    }

    const source = await sourceService.create({
      name: body.name,
      type: body.type || "TELEGRAM",
      status: body.status || "ACTIVE",
      channelId: body.channelId,
      username: body.username,
      url: body.url,
      description: body.description,
      metadata: body.metadata || {},
    });

    return NextResponse.json({ success: true, source }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/sources] error:", error);
    const isConflict =
      error.message?.includes("already exists") ||
      error.code === "P2002";
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create source" },
      { status: isConflict ? 409 : 500 }
    );
  }
}
