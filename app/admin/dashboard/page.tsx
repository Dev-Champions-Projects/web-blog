import { redirect } from "next/navigation";

const AdminDashboardPage = () => {
  /*
   * /admin is the single canonical administration dashboard.
   * Keeping a second implementation here caused the admin route
   * to render user-dashboard metrics and made the two pages drift.
   */
  redirect("/admin");
};

export default AdminDashboardPage;
