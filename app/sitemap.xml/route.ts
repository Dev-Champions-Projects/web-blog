import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { siteConfig } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const blogs = await db.blog.findMany({
        where: { isPublished: true },
        select: { id: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 1000,
    });

    const posts = blogs.map((blog) => ({
        url: `${siteConfig.url}/blog/details/${blog.id}`,
        lastModified: blog.createdAt,
    }));

    return [
        {
            url: `${siteConfig.url}`,
            lastModified: new Date(),
        },
        {
            url: `${siteConfig.url}/blog/feed/1`,
            lastModified: new Date(),
        },
        ...posts,
    ];
}
