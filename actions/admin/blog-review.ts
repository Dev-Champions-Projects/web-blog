"use server";

import {
    BlogApprovalStatus,
} from "@prisma/client";

import {
    revalidatePath,
} from "next/cache";

import {
    auth,
} from "@/auth";

import {
    db,
} from "@/lib/db";

import {
    getBlogUrl,
} from "@/lib/slug";

import {
    notifyNewBlogSubscribers,
} from "@/lib/blogPushNotifications";


async function getAdminSession() {
    const session =
        await auth();


    if (
        !session?.user ||
        session.user.role !==
        "ADMIN"
    ) {
        return null;
    }


    return session;
}


export const getPendingBlogReviews =
    async () => {
        const session =
            await getAdminSession();


        if (!session) {
            return {
                error:
                    "Access denied.",
            };
        }


        try {
            const blogs =
                await db.blog.findMany({
                    where: {
                        approvalStatus:
                            BlogApprovalStatus.PENDING,

                        isPublished:
                            false,
                    },

                    orderBy: [
                        {
                            submittedAt:
                                "asc",
                        },
                        {
                            createdAt:
                                "asc",
                        },
                    ],

                    take:
                        30,

                    select: {
                        id:
                            true,

                        title:
                            true,

                        content:
                            true,

                        coverImage:
                            true,

                        slug:
                            true,

                        tags:
                            true,

                        createdAt:
                            true,

                        submittedAt:
                            true,

                        userId:
                            true,

                        user: {
                            select: {
                                id:
                                    true,

                                name:
                                    true,

                                email:
                                    true,

                                image:
                                    true,
                            },
                        },
                    },
                });


            return {
                success: {
                    blogs,
                },
            };
        } catch (
        error
        ) {
            console.error(
                "Unable to load pending blog reviews:",
                error,
            );


            return {
                error:
                    "Unable to load pending reviews.",
            };
        }
    };


export const approveBlog =
    async (
        blogId:
            string,
    ) => {
        const session =
            await getAdminSession();


        if (!session) {
            return {
                error:
                    "Access denied.",
            };
        }


        try {
            const blog =
                await db.blog.findUnique({
                    where: {
                        id:
                            blogId,
                    },
                });


            if (!blog) {
                return {
                    error:
                        "Blog not found.",
                };
            }


            if (
                blog.approvalStatus !==
                BlogApprovalStatus.PENDING
            ) {
                return {
                    error:
                        "This article is no longer pending review.",
                };
            }


            const now =
                new Date();


            const firstPublication =
                blog.publishedAt ===
                null;


            const updated =
                await db.blog.update({
                    where: {
                        id:
                            blogId,
                    },

                    data: {
                        approvalStatus:
                            BlogApprovalStatus.APPROVED,

                        isPublished:
                            true,

                        publishedAt:
                            blog.publishedAt ??
                            now,
                    },
                });


            const articlePath =
                getBlogUrl({
                    id:
                        updated.id,

                    title:
                        updated.title,

                    slug:
                        updated.slug,
                });


            try {
                revalidatePath(
                    "/",
                );

                revalidatePath(
                    "/admin",
                );

                revalidatePath(
                    "/blog/feed/1",
                );

                revalidatePath(
                    articlePath,
                );

                revalidatePath(
                    `/user/${updated.userId}/1`,
                );
            } catch {
                // Ignore.
            }


            /*
             * This is the point at which a normal
             * contributor's article becomes public.
             */

            if (
                firstPublication
            ) {
                try {
                    await notifyNewBlogSubscribers({
                        id:
                            updated.id,

                        title:
                            updated.title,

                        slug:
                            updated.slug,

                        coverImage:
                            updated.coverImage,

                        tags:
                            updated.tags,

                        userId:
                            updated.userId,
                    });
                } catch (
                notificationError
                ) {
                    console.error(
                        "Article approved but push notification failed:",
                        notificationError,
                    );
                }
            }


            return {
                success:
                    "Article approved and published.",
            };
        } catch (
        error
        ) {
            console.error(
                "Unable to approve article:",
                error,
            );


            return {
                error:
                    "Unable to approve article.",
            };
        }
    };


export const rejectBlog =
    async (
        blogId:
            string,
    ) => {
        const session =
            await getAdminSession();


        if (!session) {
            return {
                error:
                    "Access denied.",
            };
        }


        try {
            const blog =
                await db.blog.findUnique({
                    where: {
                        id:
                            blogId,
                    },
                });


            if (!blog) {
                return {
                    error:
                        "Blog not found.",
                };
            }


            if (
                blog.approvalStatus !==
                BlogApprovalStatus.PENDING
            ) {
                return {
                    error:
                        "This article is no longer pending review.",
                };
            }


            await db.blog.update({
                where: {
                    id:
                        blogId,
                },

                data: {
                    approvalStatus:
                        BlogApprovalStatus.REJECTED,

                    isPublished:
                        false,
                },
            });


            try {
                revalidatePath(
                    "/admin",
                );

                revalidatePath(
                    "/blog/feed/1",
                );

                revalidatePath(
                    `/user/${blog.userId}/1`,
                );

                revalidatePath(
                    getBlogUrl(
                        blog,
                    ),
                );
            } catch {
                // Ignore.
            }


            return {
                success:
                    "Article returned to the author.",
            };
        } catch (
        error
        ) {
            console.error(
                "Unable to reject article:",
                error,
            );


            return {
                error:
                    "Unable to reject article.",
            };
        }
    };