import { NextRequest, NextResponse } from "next/server";
import { isAllowedRequestOrigin } from "@/lib/requestOrigin";
import { db } from "@/lib/db";
import { tags as availableTags } from "@/lib/tags";

const validTags = availableTags.filter((tag) => tag !== "All");

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

    if (!endpoint) {
      return NextResponse.json(
        { error: "Push endpoint is required." },
        { status: 400 },
      );
    }

    const subscription = await db.webPushSubscription.findUnique({
      where: {
        endpoint,
      },
      select: {
        newPosts: true,
        specialAnnouncements: true,
        learningReminders: true,
        tags: true,
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Push subscription not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      preferences: subscription,
    });
  } catch (error) {
    console.error("Unable to load Tech Path push preferences:", error);

    return NextResponse.json(
      { error: "Unable to load alert preferences." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!isAllowedRequestOrigin(request)) {
      return NextResponse.json(
        { error: "Invalid request origin." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const endpoint = typeof body.endpoint === "string" ? body.endpoint : "";

    if (!endpoint) {
      return NextResponse.json(
        { error: "Push endpoint is required." },
        { status: 400 },
      );
    }

    const existing = await db.webPushSubscription.findUnique({
      where: {
        endpoint,
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Push subscription not found." },
        { status: 404 },
      );
    }

    const updated = await db.webPushSubscription.update({
      where: {
        endpoint,
      },
      data: {
        newPosts: body.newPosts !== false,
        specialAnnouncements: body.specialAnnouncements !== false,
        learningReminders: body.learningReminders !== false,
        tags: cleanTags(body.tags),
      },
      select: {
        newPosts: true,
        specialAnnouncements: true,
        learningReminders: true,
        tags: true,
      },
    });

    return NextResponse.json({
      success: true,
      preferences: updated,
    });
  } catch (error) {
    console.error("Unable to save Tech Path alert preferences:", error);

    return NextResponse.json(
      { error: "Unable to save alert preferences." },
      { status: 500 },
    );
  }
}
