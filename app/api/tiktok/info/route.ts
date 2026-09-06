import { NextRequest, NextResponse } from "next/server";
import { VibeTikScraper } from "@/lib/vibetik";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get("url");
    if (!url) return NextResponse.json({ success: false, error: "URL TikTok wajib diisi." }, { status: 400 });

    const scraper = new VibeTikScraper();
    const data = await scraper.getVideoInfo(url);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
