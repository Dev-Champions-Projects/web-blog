import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAllowedRequestOrigin } from "@/lib/requestOrigin";

function cleanOptionalString(value: unknown, maxLength = 160) {
  return typeof value === "string" && value.trim()
    ? value.trim().slice(0, maxLength)
    : null;
}

export async function POST(request: NextRequest) {
  try {
    if (!isAllowedRequestOrigin(request)) {
      return NextResponse.json(
        { error: "Invalid request origin." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const endpoint = typeof body.endpoint === "string" ? body.endpoint : "";

    if (!endpoint || endpoint.length > 4096) {
      return NextResponse.json(
        { error: "Push endpoint is required." },
        { status: 400 },
      );
    }

    const now = new Date();
    const notificationClick = body.source === "notification_click";

    const result = await db.webPushSubscription.updateMany({
      where: {
        endpoint,
        enabled: true,
      },
      data: {
        /*
         * A genuine visit starts a fresh inactivity cycle.
         * Keep lastWinBackAt as historical delivery information instead of
         * erasing it, so we can verify the last win-back send in production.
         */
        lastSeenAt: now,
        winBackStage: 0,
        winBackLockUntil: null,
        winBackLockToken: null,
        ...(notificationClick
          ? {
              lastPushClickAt: now,
              lastPushCampaign: cleanOptionalString(body.campaign),
              lastPushId: cleanOptionalString(body.pushId),
            }
          : {}),
      },
    });

    return NextResponse.json({
      success: true,
      updated: result.count > 0,
    });
  } catch (error) {
    console.error("Unable to record Tech Path push activity:", error);

    return NextResponse.json(
      { error: "Unable to record activity." },
      { status: 500 },
    );
  }
}
