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

export async function generateMetadata({
  params,
}: BlogContentProps): Promise<Metadata> {
  const { slugOrId } = await params;

  let blog = await db.blog.findUnique({
    where: {
      id: slugOrId,
    },

    select: {
      id: true,

      slug: true,

      title: true,

      content: true,

      coverImage: true,

      createdAt: true,

      user: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!blog) {
    const idCandidate = parseIdFromSlugOrId(slugOrId);

    if (idCandidate && idCandidate !== slugOrId) {
      blog = await db.blog.findUnique({
        where: {
          id: idCandidate,
        },

        select: {
          id: true,

          slug: true,

          title: true,

          content: true,

          coverImage: true,

          createdAt: true,

          user: {
            select: {
              name: true,
            },
          },
        },
      });
    }
  }

  if (!blog) {
    blog = await db.blog.findUnique({
      where: {
        slug: slugOrId,
      },

      select: {
        id: true,

        slug: true,

        title: true,

        content: true,

        coverImage: true,

        createdAt: true,

        user: {
          select: {
            name: true,
          },
        },
      },
    });
  }

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

  return {
    title,

    description: getSeoDescription(excerpt),

    openGraph: {
      title,

      description: excerpt,

      url,

      siteName: siteConfig.name,

      type: "article",

      publishedTime: blog.createdAt.toISOString(),

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

const BlogContent = async ({ params }: BlogContentProps) => {
  const session = await auth();

  const { slugOrId } = await params;

  await incrementBlogViews({
    blogId: slugOrId,
  });

  const res = await getBlogById({
    blogId: slugOrId,
  });

  if (!res.success) {
    return <Alert error message="Error fetching blog content" />;
  }

  const blog = res.success.blog;

  if (!blog) {
    return <Alert error message="No blog found!" />;
  }

  try {
    const canonicalPath = getBlogUrl({
      id: blog.id,

      title: blog.title,

      slug: blog.slug,
    });

    const incoming = slugOrId;

    const canonicalSegment = canonicalPath.replace("/blog/details/", "");

    if (canonicalSegment && incoming !== canonicalSegment) {
      redirect(canonicalPath);
    }
  } catch {
    /*
     * Preserve the existing article
     * rendering behaviour.
     */
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
      {blog.coverImage && (
        <div
          className="
              relative
              mt-2
              h-[35vh]
              w-full
            "
        >
          <Image
            src={blog.coverImage}
            fill
            alt={blog.title}
            className="
                rounded
                object-cover
              "
          />
        </div>
      )}

      <div
        className="
            flex
            items-center
            justify-between
            pt-4
          "
      >
        {blog.user && (
          <UserSummary user={blog.user} createdDate={blog.createdAt} />
        )}

        {session?.user.userId === blog.userId && (
          <Link
            className="
                text-orange-400
              "
            href={`/blog/edit/${blog.id}`}
          >
            Edit
          </Link>
        )}
      </div>

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

      <h1
        className="
            text-2xl
            font-semibold
            md:text-5xl
          "
      >
        {blog.title}
      </h1>

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

      <ArticleBodyWithPlaygrounds content={blog.content} />

      {blog.youtubeUrl && (
        <YouTubeEmbed url={blog.youtubeUrl} title={`${blog.title} video`} />
      )}

      <Separator />

      <Comments blog={blog} />

      <RelatedPosts blog={blog} />
    </div>
  );
};

export default BlogContent;
