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

const NavBar = () => {
  const session = useSession();
  const isLoggedIn = session.status === "authenticated";
  const path = usePathname();
  const router = useRouter();

  const isFeedsPage = path.includes("/blog/feed");

  return (
    <nav className="sticky top-0 border-b z-50  bg-white dark:bg-slate-950">
      <Container>
        <div className="flex justify-between items-center ">
          <div
            className="flex items-center gap-1 cursor-pointer"
            onClick={() => router.push("/blog/feed/1")}
          >
            <div className="font-bold text-xl">TECH PATH</div>
          </div>
          {isFeedsPage && <SearchInput />}
          <div className="flex gap-5 sm:gap-8 items-center">
            <ThemeToggle />
            {isLoggedIn && <Notifications />}
            {isLoggedIn && <UserButton />}
            {!isLoggedIn && (
              <>
                <Link href="/login">Login</Link>
                <Link href="/register">Register</Link>
              </>
            )}
          </div>
        </div>
      </Container>
      <Tags />
    </nav>
  );
};

export default NavBar;
