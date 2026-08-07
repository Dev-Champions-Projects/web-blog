import { db } from "@/lib/db";
import { siteConfig } from "@/lib/seo";

export async function GET() {
    const blogs = await db.blog.findMany({
        where: { isPublished: true },
        select: { id: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 1000,
    });

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
            url: `${siteConfig.url}/blog/details/${blog.id}`,
            lastModified: blog.createdAt.toISOString(),
        })),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
            .map(
                (item) => `  <url>
    <loc>${item.url}</loc>
    <lastmod>${item.lastModified}</lastmod>
  </url>`
            )
            .join("\n")}
</urlset>`;

    return new Response(xml, {
        headers: {
            "Content-Type": "application/xml; charset=utf-8",
        },
    });
}
