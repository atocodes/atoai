import { NextResponse } from "next/server";
import { chatService } from "@/module/chat/service/chat.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.question || typeof body.question !== "string") {
      return NextResponse.json(
        { success: false, error: "Question is required" },
        { status: 400 },
      );
    }

    const result = await chatService.ask(body);
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to generate answer" },
      { status: 500 },
    );
  }
}
