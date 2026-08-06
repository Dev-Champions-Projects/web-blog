import { auth } from "@/auth";
import Alert from "@/components/common/Alert";
import Container from "@/components/layout/Container";
import UserDashboard from "@/components/dashboard/UserDashboard";
import { getUserDashboard } from "@/actions/blogs/get-user-dashboard";

const DashboardPage = async () => {
  const session = await auth();
  const currentUserId = session?.user.userId;

  if (!currentUserId) {
    return (
      <Container>
        <Alert error message="Please login to view your dashboard." />
      </Container>
    );
  }

  const res = await getUserDashboard(currentUserId);

  if (res.error || !res.success) {
    return (
      <Container>
        <Alert error message={res.error ?? "Error fetching dashboard."} />
      </Container>
    );
  }

  return (
    <Container>
      <UserDashboard {...res.success} />
    </Container>
  );
};

export default DashboardPage;
