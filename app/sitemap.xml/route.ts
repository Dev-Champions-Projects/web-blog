import { db } from "@/lib/db";
import { siteConfig } from "@/lib/seo";
import { getBlogUrl } from "@/lib/slug";

export async function GET() {
    let blogs = [] as Array<{ id: string; createdAt: Date; slug: string | null }>;

    try {
        blogs = await db.blog.findMany({
            where: { isPublished: true },
            select: { id: true, createdAt: true, slug: true },
            orderBy: { createdAt: "desc" },
            take: 1000,
        });
    } catch (error) {
        console.error("Failed to build sitemap posts:", error);
    }

    const urls = [
        {
            url: `${siteConfig.url}`,
            lastModified: new Date().toISOString(),
        },
        {
            url: `${siteConfig.url}/blog/feed/1`,
            lastModified: new Date().toISOString(),
        },
        ...blogs.map((blog) => ({
            url: `${siteConfig.url}${getBlogUrl(blog)}`,
            lastModified: blog.createdAt.toISOString(),
        })),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
        .map(
            (item) => `  <url>\n    <loc>${item.url}</loc>\n    <lastmod>${item.lastModified}</lastmod>\n  </url>`,
        )
        .join("\n")}\n</urlset>`;

    return new Response(xml, {
        headers: {
            "Content-Type": "application/xml; charset=utf-8",
        },
    });
}
