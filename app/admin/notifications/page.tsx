import type { Metadata } from "next";

import { auth } from "@/auth";

import Alert from "@/components/common/Alert";

import Container from "@/components/layout/Container";

import NotificationCenter from "@/components/admin/NotificationCenter";

export const metadata: Metadata = {
  title: "Notification Center | Tech Path",

  robots: {
    index: false,

    follow: false,
  },
};

export default async function AdminNotificationsPage() {
  const session = await auth();

  if (session?.user.role !== "ADMIN") {
    return (
      <Container>
        <Alert error message="Access Denied" />
      </Container>
    );
  }

  return (
    <Container>
      <NotificationCenter />
    </Container>
  );
}
