import bot from "@/lib/telegram/bot";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: Request) {
    return NextResponse.json({ success: true }, { status: 200 })
}

export async function POST(req: NextRequest) {
    const data = await req.json()
    await bot.handleUpdate(data);

    return NextResponse.json({ success: true }, { status: 200 })
}