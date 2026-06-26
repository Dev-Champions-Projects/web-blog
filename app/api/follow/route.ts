import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const session = await auth();
    const userId = session?.user.userId; //follows the other
    const followId = body.followId; //being followed

    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!followId) {
      return NextResponse.json(
        { error: "No user to follow ID" },
        { status: 400 }
      );
    }

    if (userId === followId) {
      return NextResponse.json(
        { error: "You cannot follow yourself!" },
        { status: 400 }
      );
    }

    const existingFollow = await db.follow.findUnique({
      where: {
        followerId_followingId: { followerId: userId, followingId: followId },
      },
    });

    if (existingFollow) {
      //unfollow
      await db.follow.delete({
        where: {
          followerId_followingId: { followerId: userId, followingId: followId },
        },
      });

      return NextResponse.json({ success: "unfollowed" });
    } else {
      //follow
      await db.follow.create({
        data: {
          followerId: userId,
          followingId: followId,
        },
      });

      return NextResponse.json({ success: "followed" });
    }
  } catch (error) {
    console.log("Error at /api/follow POST", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
