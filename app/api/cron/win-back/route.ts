import { NextRequest, NextResponse } from "next/server";
import { runTechPathWinBackNotifications } from "@/lib/winBackNotifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();

  if (!secret) {
    return false;
  }

  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET?.trim()) {
    return NextResponse.json(
      { success: false, error: "CRON_SECRET is not configured." },
      { status: 503 },
    );
  }

  if (!isAuthorized(request)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 401 },
    );
  }

  try {
    const dryRun = request.nextUrl.searchParams.get("dryRun") === "1";
    const summary = await runTechPathWinBackNotifications({
      dryRun,
      limit: 20,
    });

    return NextResponse.json(
      {
        success: true,
        executedAt: new Date().toISOString(),
        summary,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("Tech Path win-back cron execution failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to run Tech Path win-back notifications.",
      },
      { status: 500 },
    );
  }
}
