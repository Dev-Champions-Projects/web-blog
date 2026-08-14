import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { siteConfig } from "@/lib/seo";
import { getBlogUrl } from "@/lib/slug";

export async function GET(): Promise<Response> {
    const blogs = await db.blog.findMany({
        where: { isPublished: true },
        select: {
            id: true,
            slug: true,
            title: true,
            createdAt: true,
        },
        orderBy: { createdAt: "desc" },
    });

    const urls: MetadataRoute.Sitemap = [
        {
            url: siteConfig.url,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },
        {
            url: `${siteConfig.url}/blog/feed/1`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
        ...blogs.map((blog) => ({
            url: `${siteConfig.url}${getBlogUrl(blog)}`,
            lastModified: blog.createdAt,
            changeFrequency: "weekly" as const,
            priority: 0.8,
        })),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
            .map(
                (item) => `  <url>
    <loc>${item.url}</loc>
    <lastmod>${new Date(item.lastModified ?? new Date()).toISOString()}</lastmod>
    <changefreq>${item.changeFrequency ?? "weekly"}</changefreq>
    <priority>${item.priority ?? 0.7}</priority>
  </url>`,
            )
            .join("\n")}
</urlset>`;

    return new Response(xml, {
        headers: {
            "Content-Type": "application/xml; charset=utf-8",
        },
    });
}
