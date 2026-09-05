export const BLOG_ACTION = {
  SAVE_DRAFT: "SAVE_DRAFT",
  SUBMIT_FOR_REVIEW: "SUBMIT_FOR_REVIEW",
  PUBLISH: "PUBLISH",
  UNPUBLISH: "UNPUBLISH",
} as const;

export type BlogAction =
  (typeof BLOG_ACTION)[keyof typeof BLOG_ACTION];

export const isBlogAction = (
  value: unknown,
): value is BlogAction => {
  return (
    typeof value === "string" &&
    Object.values(BLOG_ACTION).includes(
      value as BlogAction,
    )
  );
};