import { NextRequest, NextResponse } from "next/server";
import redirects from "./data/blog-redirects.json";

// Middleware must run in the Edge runtime. Avoid importing server-only modules (NextAuth/Prisma).

export default function middleware(req: NextRequest) {
    try {
        const url = req.nextUrl;
        const pathname = url.pathname;

        // Redirect id-only blog detail URLs to slugged canonical URLs (301)
        if (pathname.startsWith("/blog/details/")) {
            const slugOrId = pathname.replace("/blog/details/", "").replace(/\/$/, "");
            if (slugOrId && !slugOrId.includes("-")) {
                const id = slugOrId;
                const slug = (redirects as Record<string, string | null>)[id];
                if (slug) {
                    return NextResponse.redirect(new URL(`/blog/details/${slug}-${id}`, url));
                }
            }
        }
    } catch (e) {
        // ignore and continue
    }

    // Do not enforce auth in Edge middleware to avoid server-only imports.
    return NextResponse.next();
}

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};
