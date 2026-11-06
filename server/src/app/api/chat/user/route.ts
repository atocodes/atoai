import { chatService } from "@/module/chat";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.question || typeof body.question !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Question is required",
        },
        {
          status: 400,
        },
      );
    }

    const result = await chatService.ask(body, "user");
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate answer" },
      { status: 500 },
    );
  }
}
