"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export const getCounts = async () => {
  const session = await auth();

  const isAdmin = session?.user.role === "ADMIN";

  if (!isAdmin) return { error: "Error fetching counts" };

  try {
    const userCount = await db.user.count();
    const blogCount = await db.blog.count();

    return {
      success: {
        userCount,
        blogCount,
      },
    };
  } catch (error) {
    return { error: "Error fetching counts" };
  }
};
