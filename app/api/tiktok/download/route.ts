import { NextRequest, NextResponse } from "next/server";
import { VibeTikScraper } from "@/lib/vibetik";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get("url");
    const qualityParam = req.nextUrl.searchParams.get("quality");

    if (!url) {
      return NextResponse.json(
        {
          success: false,
          error: "URL TikTok wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (
      !url.includes("tiktok.com") &&
      !url.includes("vt.tiktok.com")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "URL harus berasal dari TikTok.",
        },
        { status: 400 }
      );
    }

    const quality =
      qualityParam === "normal"
        ? "normal"
        : "hd";

    const scraper = new VibeTikScraper();

    const result =
      await scraper.getSignedDownloadUrl(
        url,
        quality
      );

    if (!result?.signedUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "URL download tidak tersedia.",
        },
        { status: 502 }
      );
    }

    return NextResponse.redirect(
      result.signedUrl,
      302
    );
  } catch (error) {
    console.error(
      "[TikTok Download]",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Download TikTok gagal.";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
