import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { isAllowedRequestOrigin } from "@/lib/requestOrigin";
import { tags as availableTags } from "@/lib/tags";

const validTags = availableTags.filter((tag) => tag !== "All");

type SubscriptionBody = {
  endpoint?: unknown;
  keys?: {
    p256dh?: unknown;
    auth?: unknown;
  };
  preferences?: {
    newPosts?: unknown;
    specialAnnouncements?: unknown;
    learningReminders?: unknown;
    tags?: unknown;
  };
};

function cleanTags(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  const canonical = new Map(
    validTags.map((tag) => [tag.toLowerCase(), tag]),
  );

  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => canonical.get(item.trim().toLowerCase()))
        .filter((item): item is string => Boolean(item)),
    ),
  ).slice(0, 20);
}

function validateSubscription(body: SubscriptionBody) {
  if (
    typeof body.endpoint !== "string" ||
    body.endpoint.length === 0 ||
    body.endpoint.length > 4096
  ) {
    return null;
  }

  try {
    const endpointUrl = new URL(body.endpoint);

    if (endpointUrl.protocol !== "https:") {
      return null;
    }
  } catch {
    return null;
  }

  const p256dh = body.keys?.p256dh;
  const authKey = body.keys?.auth;

  if (
    typeof p256dh !== "string" ||
    typeof authKey !== "string" ||
    !p256dh ||
    !authKey ||
    p256dh.length > 2048 ||
    authKey.length > 2048
  ) {
    return null;
  }

  return {
    endpoint: body.endpoint,
    p256dh,
    auth: authKey,
  };
}

function getPreferenceData(preferences: SubscriptionBody["preferences"]) {
  if (!preferences) {
    return {};
  }

  return {
    newPosts: preferences.newPosts !== false,
    specialAnnouncements: preferences.specialAnnouncements !== false,
    learningReminders: preferences.learningReminders !== false,
    tags: cleanTags(preferences.tags),
  };
}

export async function POST(request: NextRequest) {
  try {
    if (!isAllowedRequestOrigin(request)) {
      return NextResponse.json(
        { error: "Invalid request origin." },
        { status: 403 },
      );
    }

    const body = (await request.json()) as SubscriptionBody;
    const subscription = validateSubscription(body);

    if (!subscription) {
      return NextResponse.json(
        { error: "Invalid push subscription." },
        { status: 400 },
      );
    }

    let userId: string | null = null;

    try {
      const session = await auth();
      userId = session?.user?.userId || null;
    } catch {
      userId = null;
    }

    const now = new Date();
    const preferenceData = getPreferenceData(body.preferences);

    await db.webPushSubscription.upsert({
      where: {
        endpoint: subscription.endpoint,
      },
      update: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
        ...(userId ? { userId } : {}),
        enabled: true,
        ...preferenceData,

        /*
         * IMPORTANT:
         * Do not reset lastSeenAt / winBackStage / lastWinBackAt here.
         * This route synchronizes the browser subscription and is called
         * during normal page initialization. Actual reader activity is
         * recorded only by /api/push/activity.
         */
      },
      create: {
        endpoint: subscription.endpoint,
        p256dh: subscription.p256dh,
        auth: subscription.auth,
        userId,
        enabled: true,
        lastSeenAt: now,
        winBackStage: 0,
        lastWinBackAt: null,
        winBackLockUntil: null,
        winBackLockToken: null,
        ...preferenceData,
      },
    });

    return NextResponse.json({
      subscribed: true,
    });
  } catch (error) {
    console.error("Unable to save Tech Path push subscription:", error);

    return NextResponse.json(
      { error: "Unable to enable notifications." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!isAllowedRequestOrigin(request)) {
      return NextResponse.json(
        { error: "Invalid request origin." },
        { status: 403 },
      );
    }

    const body = (await request.json()) as {
      endpoint?: unknown;
    };

    const endpoint = typeof body.endpoint === "string" ? body.endpoint : "";

    if (!endpoint || endpoint.length > 4096) {
      return NextResponse.json(
        { error: "Invalid push subscription." },
        { status: 400 },
      );
    }

    await db.webPushSubscription.deleteMany({
      where: {
        endpoint,
      },
    });

    return NextResponse.json({
      subscribed: false,
    });
  } catch (error) {
    console.error("Unable to remove Tech Path push subscription:", error);

    return NextResponse.json(
      { error: "Unable to disable notifications." },
      { status: 500 },
    );
  }
}
