export const siteConfig = {
    name: "Dev Champions",
    title: "Dev Champions — Lagos developer blog for Nigeria and Africa",
    description:
        "Dev Champions is the Lagos-based developer blog empowering Nigerian and African coders with tutorials, career insight, tech stories, and community growth.",
    url: "https://path.dev-champions.tech",
    author: "Dev Champions",
    locale: "en-NG",
    keywords: [
        "Lagos developer blog",
        "Nigeria tech",
        "African developers",
        "web development tutorials",
        "programming guides",
        "software engineering",
        "Next.js blog",
        "Dev Champions",
    ],
};

export const metadataBase = new URL(siteConfig.url);

export function getSeoTitle(title: string) {
    const trimmed = title.trim();
    return trimmed.endsWith(`| ${siteConfig.name}`)
        ? trimmed
        : `${trimmed} | ${siteConfig.name}`;
}

export function getSeoDescription(description: string) {
    const normalized = description.trim().replace(/\s+/g, " ");
    if (normalized.length <= 160) return normalized;
    return `${normalized.slice(0, 157).trim()}...`;
}

export function getSocialImageUrl(coverImage?: string | null) {
    if (coverImage) {
        return coverImage.startsWith("http")
            ? coverImage
            : `${siteConfig.url}${coverImage.startsWith("/") ? "" : "/"}${coverImage}`;
    }
    return `${siteConfig.url}/favicon.jpg`;
}
