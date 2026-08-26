import type {
    MetadataRoute,
} from "next";

import {
    BlogApprovalStatus,
} from "@prisma/client";

import {
    db,
} from "@/lib/db";

import {
    siteConfig,
} from "@/lib/seo";

import {
    getBlogUrl,
} from "@/lib/slug";


export const dynamic =
    "force-dynamic";


export default async function sitemap():
    Promise<MetadataRoute.Sitemap> {
    const staticUrls:
        MetadataRoute.Sitemap = [
            {
                url:
                    `${siteConfig.url}/blog/feed/1`,

                changeFrequency:
                    "daily",

                priority:
                    1,
            },

            {
                url:
                    `${siteConfig.url}/privacy`,

                changeFrequency:
                    "yearly",

                priority:
                    0.3,
            },

            {
                url:
                    `${siteConfig.url}/terms`,

                changeFrequency:
                    "yearly",

                priority:
                    0.3,
            },
        ];


    try {
        const blogs =
            await db.blog.findMany({
                where: {
                    isPublished:
                        true,

                    approvalStatus:
                        BlogApprovalStatus.APPROVED,
                },

                select: {
                    id:
                        true,

                    title:
                        true,

                    slug:
                        true,

                    createdAt:
                        true,

                    publishedAt:
                        true,
                },

                orderBy: {
                    createdAt:
                        "desc",
                },
            });


        const blogUrls:
            MetadataRoute.Sitemap =
            blogs.map(
                (
                    blog,
                ) => ({
                    url:
                        `${siteConfig.url}${getBlogUrl(blog)}`,

                    lastModified:
                        blog.publishedAt ??
                        blog.createdAt,

                    changeFrequency:
                        "weekly" as const,

                    priority:
                        0.8,
                }),
            );


        return [
            ...staticUrls,
            ...blogUrls,
        ];
    } catch (
    error
    ) {
        console.error(
            "Tech Path sitemap generation failed:",
            error,
        );


        return staticUrls;
    }
}