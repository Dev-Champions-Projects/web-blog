import Image from "next/image";
import Link from "next/link";
import { getRelatedBlogs } from "@/actions/blogs/get-related-blogs";
import { BlogWithUser } from "./ListBlogs";
import Heading from "../common/Heading";

interface RelatedPostsProps {
  blog: BlogWithUser;
}

const getPlainTextExcerpt = (content: string, maxLength = 110) => {
  if (!content) return "Explore this story and read more.";

  try {
    const blocks = JSON.parse(content);
    const texts: string[] = [];

    const extractText = (node: unknown) => {
      if (!node) return;

      if (typeof node === "string") {
        texts.push(node);
        return;
      }

      if (Array.isArray(node)) {
        node.forEach(extractText);
        return;
      }

      if (typeof node === "object" && node !== null) {
        const obj = node as Record<string, unknown>;
        if (typeof obj.text === "string") {
          texts.push(obj.text);
        }
        if (Array.isArray(obj.content)) {
          extractText(obj.content);
        }
        if (Array.isArray(obj.children)) {
          extractText(obj.children);
        }
        if (Array.isArray(obj.items)) {
          extractText(obj.items);
        }
      }
    };

    extractText(blocks);

    const joined = texts.join(" ").replace(/\s+/g, " ").trim();
    if (joined) {
      return joined.length > maxLength
        ? `${joined.slice(0, maxLength).trim()}…`
        : joined;
    }
  } catch {
    // fallback to raw text
  }

  const fallback = content.replace(/\s+/g, " ").trim();
  if (!fallback) return "Explore this story and read more.";
  return fallback.length > maxLength
    ? `${fallback.slice(0, maxLength).trim()}…`
    : fallback;
};

const RelatedPosts = async ({ blog }: RelatedPostsProps) => {
  const { success, error } = await getRelatedBlogs({
    blogId: blog.id,
    tags: blog.tags,
    limit: 4,
  });

  if (error || !success || !success.blogs.length) {
    return null;
  }

  const relatedBlogs = success.blogs;

  return (
    <section className="mt-12">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <Heading title="Related posts" md />
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
          Discover more stories with similar ideas, tags, or inspiration.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {relatedBlogs.map((related) => (
          <Link
            key={related.id}
            href={`/blog/details/${related.id}`}
            className="group block overflow-hidden rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/80"
          >
            <div className="relative h-40 overflow-hidden rounded-3xl bg-slate-100 dark:bg-slate-800">
              {related.coverImage ? (
                <Image
                  src={related.coverImage}
                  fill
                  alt={related.title}
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                  No image available
                </div>
              )}
            </div>
            <div className="mt-4 flex flex-col gap-3">
              <div className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                {related.tags.slice(0, 1).join(" ") || "Blog"}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 transition-colors duration-200 group-hover:text-[#5A1C4B] dark:text-slate-100 dark:group-hover:text-[#7fd2eb]">
                {related.title}
              </h3>
              <p className="line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {getPlainTextExcerpt(related.content)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RelatedPosts;
