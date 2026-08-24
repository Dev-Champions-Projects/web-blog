import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        id: "/",

        name: "Tech Path",

        short_name: "Tech Path",

        description:
            "Developer tutorials, programming guides, career insights and technology stories from Dev Champions.",

        start_url: "/blog/feed/1",

        scope: "/",

        display: "standalone",

        background_color: "#ffffff",

        theme_color: "#5A1C4B",

        orientation: "any",

        categories: [
            "education",
            "technology",
            "developer",
            "productivity",
        ],

        icons: [
            {
                src: "/icons/icon-192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "any",
            },

            {
                src: "/icons/icon-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any",
            },

            {
                src: "/icons/icon-maskable-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
        ],
    };
}