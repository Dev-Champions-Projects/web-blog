import { auth } from "@/auth";
import Alert from "@/components/common/Alert";
import Container from "@/components/layout/Container";
import UserDashboardCards from "@/components/dashboard/UserDashboardCards";
import UserDashboardRecent from "@/components/dashboard/UserDashboardRecent";
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

  const {
    totalPosts,
    totalClaps,
    totalBookmarks,
    totalComments,
    totalViews,
    streak,
    recentPosts,
  } = res.success;

  return (
    <Container>
      <div className="flex flex-col gap-6 py-10">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold">Your dashboard</h1>
          <p className="max-w-2xl text-slate-600 dark:text-slate-300">
            A quick snapshot of your blog activity, engagement, and streaks.
          </p>
        </div>
        <UserDashboardCards
          totalPosts={totalPosts}
          totalClaps={totalClaps}
          totalBookmarks={totalBookmarks}
          totalComments={totalComments}
          totalViews={totalViews}
          totalReaders={0}
          streak={streak}
          readerStreak={0}
        />
        <UserDashboardRecent posts={recentPosts} />
      </div>
    </Container>
  );
};

export default DashboardPage;
