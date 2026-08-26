import { auth } from "@/auth";

import { getBlogById } from "@/actions/blogs/getblogbyid";

import CreateBlogForm from "@/components/blog/CreateBlogForm";

import Alert from "@/components/common/Alert";

import Container from "@/components/layout/Container";

interface BlogEditProps {
  params: Promise<{
    id: string;
  }>;
}

const BlogEdit = async ({ params }: BlogEditProps) => {
  const session = await auth();

  if (!session?.user) {
    return (
      <Container>
        <Alert error message="Please sign in to edit an article." />
      </Container>
    );
  }

  const { id } = await params;

  const res = await getBlogById({
    blogId: id,
  });

  if (!res.success) {
    return (
      <Container>
        <Alert error message={res.error ?? "Error getting blog"} />
      </Container>
    );
  }

  const blog = res.success.blog;

  if (!blog) {
    return (
      <Container>
        <Alert error message="No blog" />
      </Container>
    );
  }

  const isAdmin = session.user.role === "ADMIN";

  const ownsBlog = session.user.userId === blog.userId;

  if (!isAdmin && !ownsBlog) {
    return (
      <Container>
        <Alert error message="You are not authorized to edit this article." />
      </Container>
    );
  }

  return (
    <Container>
      <CreateBlogForm blog={blog} />
    </Container>
  );
};

export default BlogEdit;
