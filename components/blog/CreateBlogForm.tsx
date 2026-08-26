"use client";

import { Blog } from "@prisma/client";

import { zodResolver } from "@hookform/resolvers/zod";

import { useSession } from "next-auth/react";

import { useEffect, useState, useTransition } from "react";

import { SubmitHandler, useForm } from "react-hook-form";

import {
  Clock3,
  FileCheck2,
  FilePenLine,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { useRouter } from "next/navigation";

import { BlogSchema, BlogSchemaType } from "@/schemas/BlogSchema";

import { createBlog } from "@/actions/blogs/create-blog";

import { editBlog } from "@/actions/blogs/edit-blog";

import { deleteBlog } from "@/actions/blogs/delete-blog";

import { tags } from "@/lib/tags";

import { useEdgeStore } from "@/lib/edgestore";

import FormField from "../common/FormField";

import Button from "../common/Button";

import Alert from "../common/Alert";

import AddCover from "./AddCover";

import CoverImage from "./CoverImage";

import BlockNoteEditor from "./editor/BlockNoteEditorClient";

interface CreateBlogFormProps {
  blog?: Blog;
}

function getEditorialStatus(blog?: Blog) {
  if (!blog) {
    return null;
  }

  if (blog.isPublished && blog.approvalStatus === "APPROVED") {
    return {
      label: "Published",

      description: "This article is live and visible to readers.",

      icon: FileCheck2,

      className:
        "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300",
    };
  }

  if (blog.approvalStatus === "PENDING") {
    return {
      label: "Pending admin review",

      description:
        "This article is not public yet. An administrator must approve it.",

      icon: Clock3,

      className:
        "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300",
    };
  }

  if (blog.approvalStatus === "REJECTED") {
    return {
      label: "Returned for changes",

      description:
        "The article is unpublished. Update it and submit it again when ready.",

      icon: XCircle,

      className:
        "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300",
    };
  }

  return {
    label: "Draft",

    description: "Only you and administrators can access this draft.",

    icon: FilePenLine,

    className:
      "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300",
  };
}

const CreateBlogForm = ({ blog }: CreateBlogFormProps) => {
  const session = useSession();

  const userId = session.data?.user.userId;

  const isAdmin = session.data?.user.role === "ADMIN";

  const router = useRouter();

  const { edgestore } = useEdgeStore();

  const [uploadedCover, setUploadedCover] = useState<string | undefined>();

  const [content, setContent] = useState<string | undefined>();

  const [success, setSuccess] = useState<string | undefined>();

  const [error, setError] = useState<string | undefined>();

  const [isPublishing, startPublishing] = useTransition();

  const [isSavingAsDraft, startSavingAsDraft] = useTransition();

  const [isDeleting, startDeleting] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<BlogSchemaType>({
    resolver: zodResolver(BlogSchema),

    defaultValues: blog
      ? {
          userId: blog.userId,

          isPublished: blog.isPublished,

          title: blog.title,

          content: blog.content,

          coverImage: blog.coverImage || undefined,

          youtubeUrl: blog.youtubeUrl || "",

          tags: blog.tags,
        }
      : {
          userId: userId,

          isPublished: false,

          youtubeUrl: "",
        },
  });

  /*
   * Session loads asynchronously in the client.
   * The server will still ignore this identity
   * value, but the existing schema requires it.
   */
  useEffect(() => {
    if (userId) {
      setValue("userId", userId, {
        shouldValidate: true,
      });
    }
  }, [userId, setValue]);

  useEffect(() => {
    if (uploadedCover) {
      setValue("coverImage", uploadedCover, {
        shouldValidate: true,

        shouldDirty: true,

        shouldTouch: true,
      });
    }
  }, [uploadedCover, setValue]);

  useEffect(() => {
    if (typeof content === "string") {
      setValue("content", content, {
        shouldValidate: true,

        shouldDirty: true,

        shouldTouch: true,
      });
    }
  }, [content, setValue]);

  useEffect(() => {
    if (blog?.coverImage) {
      setUploadedCover(blog.coverImage);
    }
  }, [blog?.coverImage]);

  const editorialStatus = getEditorialStatus(blog);

  const StatusIcon = editorialStatus?.icon;

  const primaryLabel = isAdmin
    ? blog?.isPublished
      ? "Update & Publish"
      : "Publish"
    : blog?.isPublished
      ? "Submit Changes for Review"
      : blog?.approvalStatus === "PENDING"
        ? "Resubmit for Review"
        : "Submit for Review";

  const onChange = (nextContent: string) => {
    setContent(nextContent);
  };

  const onPublish: SubmitHandler<BlogSchemaType> = (data) => {
    setSuccess("");

    setError("");

    if (data.tags.length > 4) {
      setError("Select only 4 tags!");

      return;
    }

    startPublishing(async () => {
      const result = blog
        ? await editBlog(
            {
              ...data,

              isPublished: true,
            },

            blog.id,
          )
        : await createBlog({
            ...data,

            isPublished: true,
          });

      if (result.error) {
        setError(result.error);

        return;
      }

      if (result.success) {
        setSuccess(result.success);

        if (result.blogId) {
          const slugPart = result.slug
            ? `${result.slug}-${result.blogId}`
            : result.blogId;

          router.push(`/blog/details/${slugPart}`);

          router.refresh();
        }
      }
    });
  };

  const onSaveDraft: SubmitHandler<BlogSchemaType> = (data) => {
    setSuccess("");

    setError("");

    startSavingAsDraft(async () => {
      const result = blog
        ? await editBlog(
            {
              ...data,

              isPublished: false,
            },

            blog.id,
          )
        : await createBlog({
            ...data,

            isPublished: false,
          });

      if (result.error) {
        setError(result.error);

        return;
      }

      if (result.success) {
        setSuccess(result.success);

        if (result.blogId) {
          const slugPart = result.slug
            ? `${result.slug}-${result.blogId}`
            : result.blogId;

          router.push(`/blog/details/${slugPart}`);

          router.refresh();
        }
      }
    });
  };

  const onDelete: SubmitHandler<BlogSchemaType> = (data) => {
    setSuccess("");

    setError("");

    if (!blog) {
      return;
    }

    startDeleting(async () => {
      /*
       * Cover cleanup should not prevent
       * the blog itself from being deleted.
       */
      if (data.coverImage) {
        try {
          await edgestore.publicFiles.delete({
            url: data.coverImage,
          });
        } catch (imageError) {
          console.error("Unable to remove cover image:", imageError);
        }
      }

      const result = await deleteBlog(blog.id);

      if (result.error) {
        setError(result.error);

        return;
      }

      router.push("/blog/feed/1");

      router.refresh();
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onPublish)}
      className="
        m-auto
        flex
        min-h-[85vh]
        max-w-[1200px]
        flex-col
        justify-between
      "
    >
      <div>
        {/* EDITORIAL INFORMATION */}

        {!isAdmin && (
          <div
            className="
              mb-6
              flex
              gap-3
              rounded-2xl
              border
              border-[#409FB6]/25
              bg-[#409FB6]/5
              p-4
              text-sm
              text-slate-700
              dark:text-slate-200
            "
          >
            <ShieldCheck
              className="
                mt-0.5
                h-5
                w-5
                shrink-0
                text-[#409FB6]
              "
            />

            <div>
              <p
                className="
                  font-bold
                "
              >
                Community publishing review
              </p>

              <p
                className="
                  mt-1
                  leading-6
                  text-slate-600
                  dark:text-slate-300
                "
              >
                Your article will be submitted to a Tech Path administrator
                before it appears publicly. You can continue saving unfinished
                work as a draft.
              </p>
            </div>
          </div>
        )}

        {editorialStatus && StatusIcon && (
          <div
            className={`
                mb-6
                flex
                gap-3
                rounded-2xl
                border
                p-4
                ${editorialStatus.className}
              `}
          >
            <StatusIcon
              className="
                  mt-0.5
                  h-5
                  w-5
                  shrink-0
                "
            />

            <div>
              <p
                className="
                    font-bold
                  "
              >
                {editorialStatus.label}
              </p>

              <p
                className="
                    mt-1
                    text-sm
                    leading-6
                  "
              >
                {editorialStatus.description}
              </p>
            </div>
          </div>
        )}

        {!isAdmin &&
          blog?.isPublished &&
          blog.approvalStatus === "APPROVED" && (
            <div
              className="
                mb-6
                rounded-2xl
                border
                border-amber-200
                bg-amber-50
                p-4
                text-sm
                text-amber-800
                dark:border-amber-900
                dark:bg-amber-950/30
                dark:text-amber-300
              "
            >
              Submitting changes to this published article will temporarily
              remove it from the public feed until an administrator approves the
              new version.
            </div>
          )}

        {!!uploadedCover && (
          <CoverImage
            url={uploadedCover}
            isEditor={true}
            setUploadedCover={setUploadedCover}
          />
        )}

        {!uploadedCover && <AddCover setUploadedCover={setUploadedCover} />}

        <FormField
          id="title"
          register={register}
          errors={errors}
          placeholder="Blog Title"
          disabled={false}
          inputClassNames="
            border-none
            bg-transparent
            px-0
            text-5xl
            font-bold
          "
        />

        <fieldset
          className="
            mb-4
            flex
            flex-col
            border-y
            py-3
          "
        >
          <legend
            className="
              mb-2
              pr-2
              font-semibold
            "
          >
            Select up to 4 tags
          </legend>

          <div
            className="
              flex
              w-full
              flex-wrap
              gap-4
            "
          >
            {tags
              .filter((tag) => tag !== "All")
              .slice()
              .sort((a, b) =>
                a.localeCompare(b, undefined, {
                  sensitivity: "base",
                }),
              )
              .map((tag) => (
                <label
                  key={tag}
                  className="
                      flex
                      items-center
                      space-x-2
                    "
                >
                  <input type="checkbox" value={tag} {...register("tags")} />

                  <span>{tag}</span>
                </label>
              ))}
          </div>

          {errors.tags?.message && (
            <span
              className="
                mt-2
                text-sm
                text-rose-400
              "
            >
              Select at least one tag, max of 4!
            </span>
          )}
        </fieldset>

        <div
          className="
            mb-6
          "
        >
          <FormField
            id="youtubeUrl"
            type="url"
            register={register}
            errors={errors}
            label="YouTube Video (Optional)"
            placeholder="https://www.youtube.com/watch?v=..."
            disabled={false}
          />

          <p
            className="
              text-sm
              text-slate-500
              dark:text-slate-400
            "
          >
            Optional: paste a YouTube video link. The video will appear at the
            end of this article.
          </p>
        </div>

        <BlockNoteEditor
          onChange={onChange}
          initialContent={blog?.content ?? ""}
        />

        {errors.content?.message && (
          <span
            className="
              text-sm
              text-rose-400
            "
          >
            {errors.content.message}
          </span>
        )}
      </div>

      <div
        className="
          mt-8
          border-t
          pt-4
        "
      >
        {errors.userId?.message && (
          <span
            className="
              text-sm
              text-rose-400
            "
          >
            Missing a userId
          </span>
        )}

        {success && <Alert message={success} success />}

        {error && <Alert message={error} error />}

        <div
          className="
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div>
            {blog && (
              <Button
                onClick={handleSubmit(onDelete)}
                type="button"
                label={isDeleting ? "Deleting..." : "Delete"}
                disabled={isDeleting}
                className="
                  bg-rose-700
                  border-rose-700
                "
              />
            )}
          </div>

          <div
            className="
              flex
              flex-wrap
              gap-3
            "
          >
            <Button
              type="button"
              label={
                isSavingAsDraft
                  ? "Saving..."
                  : blog?.isPublished
                    ? "Unpublish to Draft"
                    : "Save as Draft"
              }
              onClick={handleSubmit(onSaveDraft)}
              disabled={isSavingAsDraft || isPublishing}
            />

            <Button
              type="submit"
              label={
                isPublishing
                  ? isAdmin
                    ? "Publishing..."
                    : "Submitting..."
                  : primaryLabel
              }
              disabled={isPublishing || isSavingAsDraft}
              className="
                border-[#5A1C4B]
                bg-[#5A1C4B]
              "
            />
          </div>
        </div>
      </div>
    </form>
  );
};

export default CreateBlogForm;
