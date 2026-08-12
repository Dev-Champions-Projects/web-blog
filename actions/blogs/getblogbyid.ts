"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { parseIdFromSlugOrId } from "@/lib/slug";

export const incrementBlogViews = async ({ blogId }: { blogId: string }) => {
  if (!blogId) return;

  try {
    const id = parseIdFromSlugOrId(blogId) || blogId;
    await db.blog.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
    });
  } catch (error) {
    console.error("Unable to increment blog views", error);
  }
};

export const getBlogById = async ({ blogId }: { blogId: string }) => {
  if (!blogId) return { error: "No Blog ID" };

  const session = await auth();
  const userId = session?.user.userId;

  try {
    // try id first
    let blog = await db.blog.findUnique({
      where: { id: blogId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            claps: true,
            comments: true,
          },
        },
        claps: {
          where: {
            userId,
          },
          select: {
            id: true,
          },
        },
        bookmarks: {
          where: {
            userId,
          },
          select: {
            id: true,
          },
        },
      },
    });

    // if not found, maybe the param is a slugged string like `my-title-<id>` or the slug itself
    if (!blog) {
      const idCandidate = parseIdFromSlugOrId(blogId);
      if (idCandidate && idCandidate !== blogId) {
        blog = await db.blog.findUnique({
          where: { id: idCandidate },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            _count: {
              select: {
                claps: true,
                comments: true,
              },
            },
            claps: {
              where: {
                userId,
              },
              select: {
                id: true,
              },
            },
            bookmarks: {
              where: {
                userId,
              },
              select: {
                id: true,
              },
            },
          },
        });
      }
    }

    // final fallback: try to find by slug field
    if (!blog) {
      blog = await db.blog.findUnique({
        where: { slug: blogId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              claps: true,
              comments: true,
            },
          },
          claps: {
            where: {
              userId,
            },
            select: {
              id: true,
            },
          },
          bookmarks: {
            where: {
              userId,
            },
            select: {
              id: true,
            },
          },
        },
      });
    }

    return { success: { blog } };
  } catch (error) {
    return { error: "Error fetching blog content!" };
  }
};
