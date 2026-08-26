"use server";

import {
    BlogApprovalStatus,
} from "@prisma/client";

import {
    auth,
} from "@/auth";

import {
    db,
} from "@/lib/db";


export const getRelatedBlogs =
    async ({
        blogId,
        tags,
        limit = 4,
    }: {
        blogId:
        string;

        tags:
        string[];

        limit?:
        number;
    }) => {
        const session =
            await auth();


        const userId =
            session?.user
                ?.userId;


        try {
            const safeLimit =
                Math.min(
                    Math.max(
                        limit,
                        1,
                    ),
                    4,
                );


            const blogs =
                await db.blog.findMany({
                    take:
                        safeLimit,

                    orderBy: [
                        {
                            publishedAt:
                                "desc",
                        },

                        {
                            createdAt:
                                "desc",
                        },
                    ],

                    where: {
                        isPublished:
                            true,

                        approvalStatus:
                            BlogApprovalStatus.APPROVED,

                        id: {
                            not:
                                blogId,
                        },

                        ...(tags.length
                            ? {
                                tags: {
                                    hasSome:
                                        tags,
                                },
                            }
                            : {}),
                    },

                    include: {
                        user: {
                            select: {
                                id:
                                    true,

                                name:
                                    true,

                                image:
                                    true,
                            },
                        },

                        _count: {
                            select: {
                                claps:
                                    true,

                                comments:
                                    true,
                            },
                        },

                        claps: {
                            where:
                                userId
                                    ? {
                                        userId,
                                    }
                                    : undefined,

                            select: {
                                id:
                                    true,
                            },
                        },

                        bookmarks: {
                            where:
                                userId
                                    ? {
                                        userId,
                                    }
                                    : undefined,

                            select: {
                                id:
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
                "Error fetching related blogs:",
                error,
            );


            return {
                error:
                    "Error fetching related blogs!",
            };
        }
    };