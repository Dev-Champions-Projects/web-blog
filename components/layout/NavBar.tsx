"use client";

import Container from "./Container";
import ThemeToggle from "./ThemeToggle";
import SearchInput from "./SearchInput";
import Notifications from "./Notifications";
import UserButton from "./UserButton";
import Link from "next/link";
import Image from "next/image";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Tags from "./Tags";

const NavBar = () => {
  const session = useSession();
  const isLoggedIn = session.status === "authenticated";
  const path = usePathname();
  const router = useRouter();

  const isFeedsPage = path.includes("/blog/feed");

  useEffect(() => {
    if (!isLoggedIn && path) {
      const updateSession = async () => {
        await session.update();
      };

      updateSession();
    }
  }, [path, isLoggedIn]);

  return (
    <nav className="sticky top-0 border-b z-50  bg-white dark:bg-slate-950">
      <Container>
        <div className="flex justify-between items-center ">
          <div
            className="flex items-center gap-1 cursor-pointer"
            onClick={() => router.push("/blog/feed/1")}
          >
            <Image
              src="/logo_white.png"
              alt="Tek Core Logo"
              width={40}
              height={40}
              className="h-10 w-10 object-contain block dark:hidden"
              priority
            />
            <Image
              src="/logo_web_white.png"
              alt="Tek Core Logo"
              width={40}
              height={40}
              className="h-10 w-10 object-contain hidden dark:block"
              priority
            />
            <div className="font-bold text-xl">CHAMPS LOG</div>
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
