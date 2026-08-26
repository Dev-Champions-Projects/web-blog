import { auth } from "@/auth";

import CreateBlogForm from "@/components/blog/CreateBlogForm";

import Alert from "@/components/common/Alert";

import Container from "@/components/layout/Container";

const Create = async () => {
  const session = await auth();

  if (!session?.user?.userId) {
    return (
      <Container>
        <Alert error message="Please sign in before creating an article." />
      </Container>
    );
  }

  return (
    <Container>
      <CreateBlogForm />
    </Container>
  );
};

export default Create;
