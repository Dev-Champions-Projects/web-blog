"use server";

import { db } from "@/lib/db";
import { getUserById } from "@/lib/user";
import { BlogSchema, BlogSchemaType } from "@/schemas/BlogSchema";
import { slugify } from "@/lib/slug";
import { revalidatePath } from "next/cache";

export const createBlog = async (values: BlogSchemaType) => {
  const vFields = BlogSchema.safeParse(values);

  if (!vFields.success) return { error: "Invalid fields!" };

  const { userId, isPublished } = vFields.data;

  const user = await getUserById(userId);

  if (!user) return { error: "User does not exist!" };

  if (isPublished && !user.emailVerified) {
    return { error: "Not authorized! Verify your email!" };
  }

  // generate a unique slug based on title
  const base = slugify(vFields.data.title || "");
  let finalSlug: string | undefined = base || undefined;

  if (finalSlug) {
    // ensure uniqueness by appending a counter when needed
    let candidate = finalSlug;
    let i = 1;
    // loop until a free slug is found
    // NOTE: this is a simple approach; for high-concurrency setups consider a DB constraint retry
    while (await db.blog.findUnique({ where: { slug: candidate } })) {
      i += 1;
      candidate = `${finalSlug}-${i}`;
    }
    finalSlug = candidate;
  }

  // server-side duplicate guard: if the same user created an identical title+content recently, skip
  try {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recent = await db.blog.findFirst({
      where: {
        userId,
        title: vFields.data.title,
        content: vFields.data.content,
        createdAt: { gte: fiveMinAgo },
      },
    });

    if (recent) {
      return { error: "Duplicate blog detected. Did you submit twice?" };
    }
  } catch (e) {
    // ignore duplicate guard errors
  }

  const created = await db.blog.create({
    data: {
      ...vFields.data,

      youtubeUrl:
        vFields.data.youtubeUrl ||
        null,

      slug: finalSlug,
    },
  });

  // revalidate the blog detail, feed and user pages so UI reflects new content
  try {
    const path = finalSlug
      ? `/blog/details/${finalSlug}-${created.id}`
      : `/blog/details/${created.id}`;
    revalidatePath(path);
    revalidatePath(`/blog/feed/1`);
    revalidatePath(`/user/${created.userId}/1`);
  } catch (e) {
    // ignore revalidation errors
  }

  if (isPublished) {
    return { success: "Blog published", blogId: created.id, slug: finalSlug };
  }

  return { success: "Blog saved", blogId: created.id, slug: finalSlug };
};
