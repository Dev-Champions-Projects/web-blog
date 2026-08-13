"use client";

import Container from "./Container";
import ThemeToggle from "./ThemeToggle";
import SearchInput from "./SearchInput";
import Notifications from "./Notifications";
import UserButton from "./UserButton";
import Link from "next/link";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import Tags from "./Tags";
import PWAInstallButton from "@/components/pwa/InstallPWAButton";

const NavBar = () => {
  const session = useSession();
  const isLoggedIn = session.status === "authenticated";
  const path = usePathname();
  const router = useRouter();

  const isFeedsPage = path.includes("/blog/feed");

  return (
    <nav className="sticky top-0 z-50 border-b bg-white dark:bg-slate-950">
      <Container>
        <div className="flex items-center justify-between gap-3 py-2">
          <div
            className="flex cursor-pointer items-center gap-1"
            onClick={() => router.push("/blog/feed/1")}
          >
            <div className="text-xl font-bold tracking-tight text-[#5A1C4B] dark:text-[#7fd2eb]">
              TECH PATH
            </div>
          </div>

          {isFeedsPage && (
            <div className="hidden flex-1 justify-center md:flex">
              <SearchInput />
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-4">
            <PWAInstallButton compact />
            <ThemeToggle />
            {isLoggedIn && <Notifications />}
            {isLoggedIn && <UserButton />}
            {!isLoggedIn && (
              <div className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                <Link
                  href="/login"
                  className="transition hover:text-[#5A1C4B] dark:hover:text-[#7fd2eb]"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="transition hover:text-[#5A1C4B] dark:hover:text-[#7fd2eb]"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </Container>
      <Tags />
    </nav>
  );
};

export default NavBar;
