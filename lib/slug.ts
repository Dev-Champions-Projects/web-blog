export const slugify = (value: string) => {
    if (!value) return "";
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
};

export const getBlogUrl = (blog: { id: string; title?: string; slug?: string | null }) => {
    if (blog.slug) return `/blog/details/${blog.slug}-${blog.id}`;
    const title = blog.title || "";
    const s = slugify(title);
    if (s) return `/blog/details/${s}-${blog.id}`;
    return `/blog/details/${blog.id}`;
};

export const parseIdFromSlugOrId = (slugOrId: string) => {
    if (!slugOrId) return null;
    // if it contains a hyphen and the last segment looks like an id, return it
    if (slugOrId.includes("-")) {
        const parts = slugOrId.split("-");
        const candidate = parts[parts.length - 1];
        if (candidate) return candidate;
    }
    return slugOrId;
};

export default slugify;
