/**
 * Generates a static JSON file mapping blog IDs to slugs for middleware redirects.
 * Usage: run after migration/backfill and `prisma generate`:
 *   node -r ts-node/register scripts/generate-redirects.ts
 */
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const db = new PrismaClient();

async function main() {
    const blogs = await db.blog.findMany({ select: { id: true, slug: true } });
    const map: Record<string, string | null> = {};
    for (const b of blogs) {
        map[b.id] = b.slug || null;
    }

    const out = path.resolve(process.cwd(), "data", "blog-redirects.json");
    await fs.promises.mkdir(path.dirname(out), { recursive: true });
    await fs.promises.writeFile(out, JSON.stringify(map, null, 2), "utf8");
    console.log("Wrote", out);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });
