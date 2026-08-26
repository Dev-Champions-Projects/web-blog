import type { Metadata } from "next";

import { getBlogById, incrementBlogViews } from "@/actions/blogs/getblogbyid";

import { auth } from "@/auth";
import { db } from "@/lib/db";

import { getBlogUrl, parseIdFromSlugOrId } from "@/lib/slug";

import { redirect } from "next/navigation";

import {
  getSeoDescription,
  getSeoTitle,
  getSocialImageUrl,
  siteConfig,
} from "@/lib/seo";

import ArticleBodyWithPlaygrounds from "@/components/playground/ArticleBodyWithPlaygrounds";

import Reactions from "@/components/blog/Reactions";
import UserSummary from "@/components/blog/UserSummary";
import RelatedPosts from "@/components/blog/RelatedPosts";

import Alert from "@/components/common/Alert";
import Tag from "@/components/common/Tag";

import { Separator } from "@/components/ui/separator";

import Image from "next/image";
import Link from "next/link";

import YouTubeEmbed from "@/components/blog/YouTubeEmbed";

import Comments from "@/components/comments/Comments";

import "./editor.css";

interface BlogContentProps {
  params: Promise<{
    slugOrId: string;
  }>;
}

/*
 * ============================================================
 * SEO METADATA
 * ============================================================
 *
 * Important:
 *
 * Public + approved article
 *      -> normal article metadata
 *
 * Draft / pending / rejected article
 *      -> private preview metadata
 *      -> noindex / nofollow
 *
 * This keeps articles that have not been approved
 * out of search engines.
 */
export async function generateMetadata({
  params,
}: BlogContentProps): Promise<Metadata> {
  const { slugOrId } = await params;

  const idCandidate = parseIdFromSlugOrId(slugOrId);

  /*
   * One query is enough.
   *
   * We check:
   * - exact ID
   * - ID extracted from slug-title-id
   * - exact stored slug
   */
  const lookupConditions = [
    {
      id: slugOrId,
    },
    {
      slug: slugOrId,
    },
  ];

  if (idCandidate && idCandidate !== slugOrId) {
    lookupConditions.push({
      id: idCandidate,
    });
  }

  const blog = await db.blog.findFirst({
    where: {
      OR: lookupConditions,
    },

    select: {
      /*
       * BLOG fields
       */
      id: true,
      slug: true,
      title: true,
      content: true,
      coverImage: true,

      createdAt: true,
      publishedAt: true,

      isPublished: true,
      approvalStatus: true,

      /*
       * USER fields
       *
       * Notice that approvalStatus,
       * isPublished and publishedAt
       * DO NOT belong here.
       */
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  /*
   * Article doesn't exist.
   */
  if (!blog) {
    return {
      title: siteConfig.title,

      description: siteConfig.description,

      openGraph: {
        title: siteConfig.title,

        description: siteConfig.description,

        url: `${siteConfig.url}/blog/details/${slugOrId}`,

        siteName: siteConfig.name,

        type: "website",

        images: [
          {
            url: getSocialImageUrl(),

            alt: siteConfig.name,

            width: 1200,

            height: 630,
          },
        ],
      },

      twitter: {
        card: "summary_large_image",

        title: siteConfig.title,

        description: siteConfig.description,

        images: [getSocialImageUrl()],
      },

      alternates: {
        canonical: `${siteConfig.url}/blog/details/${slugOrId}`,
      },
    };
  }

  /*
   * ============================================================
   * PRIVATE / UNAPPROVED ARTICLE
   * ============================================================
   *
   * This is where the block you couldn't place belongs.
   *
   * It MUST come:
   *
   * after:
   *   if (!blog) ...
   *
   * but before:
   *   excerpt
   *   canonical
   *   OpenGraph article metadata
   */
  const isPublic = blog.isPublished && blog.approvalStatus === "APPROVED";

  if (!isPublic) {
    return {
      title: `Article Preview | ${siteConfig.name}`,

      description: "Private article preview.",

      robots: {
        index: false,
        follow: false,

        googleBot: {
          index: false,
          follow: false,
        },
      },
    };
  }

  /*
   * ============================================================
   * PUBLIC ARTICLE METADATA
   * ============================================================
   */

  const excerpt =
    blog.content
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 160)
      .replace(/\s+$/, "") || `Read ${blog.title} on ${siteConfig.name}.`;

  const title = getSeoTitle(blog.title);

  const canonicalPath = getBlogUrl({
    id: blog.id,

    title: blog.title,

    slug: blog.slug,
  });

  const url = `${siteConfig.url}${canonicalPath}`;

  const publicationDate = blog.publishedAt ?? blog.createdAt;

  return {
    title,

    description: getSeoDescription(excerpt),

    openGraph: {
      title,

      description: excerpt,

      url,

      siteName: siteConfig.name,

      type: "article",

      publishedTime: publicationDate.toISOString(),

      authors: [blog.user?.name ?? siteConfig.name],

      images: [
        {
          url: getSocialImageUrl(blog.coverImage),

          alt: blog.title,

          width: 1200,

          height: 630,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",

      title,

      description: excerpt,

      images: [getSocialImageUrl(blog.coverImage)],
    },

    alternates: {
      canonical: url,
    },
  };
}

/*
 * ============================================================
 * ARTICLE DETAIL PAGE
 * ============================================================
 */
const BlogContent = async ({ params }: BlogContentProps) => {
  const session = await auth();

  const { slugOrId } = await params;

  /*
   * incrementBlogViews has already been
   * protected so private/unapproved posts
   * aren't counted as normal public views.
   */
  await incrementBlogViews({
    blogId: slugOrId,
  });

  const res = await getBlogById({
    blogId: slugOrId,
  });

  /*
   * This also covers someone trying to access
   * another author's private/pending article.
   */
  if (!res.success) {
    return (
      <Alert error message={res.error ?? "This article is not available."} />
    );
  }

  const blog = res.success.blog;

  if (!blog) {
    return <Alert error message="No blog found!" />;
  }

  /*
   * ============================================================
   * ACCESS / DISPLAY STATE
   * ============================================================
   */

  const isPublic = blog.isPublished && blog.approvalStatus === "APPROVED";

  const isOwner = session?.user?.userId === blog.userId;

  const isAdmin = session?.user?.role === "ADMIN";

  const canManage = isOwner || isAdmin;

  /*
   * ============================================================
   * CANONICAL URL
   * ============================================================
   */

  const canonicalPath = getBlogUrl({
    id: blog.id,

    title: blog.title,

    slug: blog.slug,
  });

  const incoming = slugOrId;

  const canonicalSegment = canonicalPath.replace("/blog/details/", "");

  /*
   * Important:
   *
   * Do NOT put redirect() inside try/catch.
   *
   * Next.js redirect() internally throws a
   * special control-flow exception.
   * Catching it prevents the redirect from
   * working correctly.
   */
  if (canonicalSegment && incoming !== canonicalSegment) {
    redirect(canonicalPath);
  }

  return (
    <div
      className="
        m-auto
        flex
        max-w-[900px]
        flex-col
        gap-6
      "
    >
      {/*
       * ========================================================
       * PRIVATE PREVIEW STATUS
       * ========================================================
       *
       * Keep this OUTSIDE the cover-image container.
       *
       * Otherwise:
       * - it disappears when no cover exists
       * - the absolute Image can overlap it
       */}

      {!isPublic && canManage && (
        <div
          className={`
              mt-3
              rounded-2xl
              border
              p-4
              text-sm

              ${
                blog.approvalStatus === "PENDING"
                  ? `
                    border-amber-200
                    bg-amber-50
                    text-amber-800
                    dark:border-amber-900
                    dark:bg-amber-950/30
                    dark:text-amber-300
                  `
                  : blog.approvalStatus === "REJECTED"
                    ? `
                      border-rose-200
                      bg-rose-50
                      text-rose-800
                      dark:border-rose-900
                      dark:bg-rose-950/30
                      dark:text-rose-300
                    `
                    : `
                      border-slate-200
                      bg-slate-50
                      text-slate-700
                      dark:border-slate-800
                      dark:bg-slate-900
                      dark:text-slate-300
                    `
              }
            `}
        >
          <strong
            className="
                block
                text-base
              "
          >
            {blog.approvalStatus === "PENDING"
              ? "Pending admin review"
              : blog.approvalStatus === "REJECTED"
                ? "Returned for changes"
                : "Draft preview"}
          </strong>

          <p
            className="
                mt-1
                leading-6
              "
          >
            {blog.approvalStatus === "PENDING"
              ? "This article has been submitted for review and is not visible to the public yet."
              : blog.approvalStatus === "REJECTED"
                ? "This article is not public. Update it and submit it again when it is ready for another review."
                : "This is a private draft preview and is not visible in the public blog feed."}
          </p>

          {isAdmin && blog.approvalStatus === "PENDING" && (
            <p
              className="
                    mt-2
                    font-semibold
                  "
            >
              You are viewing this article as an administrator.
            </p>
          )}
        </div>
      )}

      {/*
       * ========================================================
       * COVER IMAGE
       * ========================================================
       */}

      {blog.coverImage && (
        <div
          className="
            relative
            mt-2
            h-[35vh]
            w-full
            overflow-hidden
            rounded
          "
        >
          <Image
            src={blog.coverImage}
            fill
            alt={blog.title}
            className="
              object-cover
            "
          />
        </div>
      )}

      {/*
       * ========================================================
       * AUTHOR / EDIT
       * ========================================================
       */}

      <div
        className="
          flex
          items-center
          justify-between
          gap-4
          pt-4
        "
      >
        {blog.user && (
          <UserSummary
            user={blog.user}
            createdDate={blog.publishedAt ?? blog.createdAt}
          />
        )}

        {canManage && (
          <Link
            className="
              shrink-0
              font-medium
              text-orange-500
              transition
              hover:text-orange-600
            "
            href={`/blog/edit/${blog.id}`}
          >
            Edit
          </Link>
        )}
      </div>

      {/*
       * ========================================================
       * PUBLIC REACTIONS ONLY
       * ========================================================
       */}

      {isPublic && (
        <div
          className="
            flex
            flex-col
            gap-2
          "
        >
          <Separator />

          <Reactions blog={blog} />

          <Separator />
        </div>
      )}

      {/*
       * ========================================================
       * TITLE
       * ========================================================
       */}

      <h1
        className="
          text-2xl
          font-semibold
          md:text-5xl
        "
      >
        {blog.title}
      </h1>

      {/*
       * ========================================================
       * TAGS
       * ========================================================
       */}

      {!!blog.tags.length && (
        <div
          className="
            flex
            flex-wrap
            items-center
            gap-4
          "
        >
          {[...blog.tags]
            .sort((a, b) =>
              a.localeCompare(b, undefined, {
                sensitivity: "base",
              }),
            )
            .map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
        </div>
      )}

      {/*
       * ========================================================
       * ARTICLE BODY + TRY IT PLAYGROUNDS
       * ========================================================
       */}

      <ArticleBodyWithPlaygrounds content={blog.content} />

      {/*
       * ========================================================
       * OPTIONAL YOUTUBE VIDEO
       * ========================================================
       */}

      {blog.youtubeUrl && (
        <YouTubeEmbed url={blog.youtubeUrl} title={`${blog.title} video`} />
      )}

      {/*
       * ========================================================
       * PUBLIC ENGAGEMENT ONLY
       * ========================================================
       *
       * Drafts / pending / rejected posts do not
       * receive comments or related-post sections.
       */}

      {isPublic && (
        <>
          <Separator />

          <Comments blog={blog} />

          <RelatedPosts blog={blog} />
        </>
      )}
    </div>
  );
};

export default BlogContent;
