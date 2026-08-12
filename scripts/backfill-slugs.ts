/**
 * Run this script after applying the new Prisma migration and running `prisma generate`.
 * It will populate missing `slug` values for existing blogs based on their title.
 * Usage: `node -r ts-node/register scripts/backfill-slugs.ts` or compile first.
 */
import { PrismaClient } from "@prisma/client";
import { slugify } from "../lib/slug";

const db = new PrismaClient();

async function main() {
    const blogs = await db.blog.findMany({ where: { slug: null }, select: { id: true, title: true } });
    console.log(`Found ${blogs.length} blogs without slug`);

    for (const b of blogs) {
        const base = slugify(b.title || "");
        if (!base) continue;
        let candidate = base;
        let i = 1;
        // ensure unique
        // eslint-disable-next-line no-await-in-loop
        while (await db.blog.findUnique({ where: { slug: candidate } })) {
            i += 1;
            candidate = `${base}-${i}`;
        }
        // eslint-disable-next-line no-await-in-loop
        await db.blog.update({ where: { id: b.id }, data: { slug: candidate } });
        console.log(`Updated ${b.id} -> ${candidate}`);
    }

    console.log("Done backfilling slugs");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });
