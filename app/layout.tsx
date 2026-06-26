import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import NavBar from "@/components/layout/NavBar";
import { ThemeProvider } from "next-themes";
import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";
import { EdgeStoreProvider } from "@/lib/edgestore";
import { Toaster } from 'react-hot-toast'
import { SocketContextProvider } from "@/context/SocketContext";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ['400', '700']
});

export const metadata: Metadata = {
  title: "WebDevBlog",
  description: "Your favourite web dev blogs!",
  icons: { icon: '/logo.svg' }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const session = await auth()

  return (
    <EdgeStoreProvider>
      <SessionProvider session={session}>
        <SocketContextProvider>
          <html lang="en" suppressHydrationWarning>
            <body
              className={cn('antialiased flex flex-col min-h-screen px-2', poppins.variable)}
            >
              <Toaster
                position="bottom-center"
                toastOptions={{
                  style: {
                    background: "rgb(51 65 85)",
                    color: "#fff"
                  }
                }}
              />
              <ThemeProvider attribute='class' defaultTheme="system" enableSystem disableTransitionOnChange>
                <NavBar />
                <main className="flex-grow">
                  {children}
                </main>
                <footer>...</footer>
              </ThemeProvider>
            </body>
          </html>
        </SocketContextProvider>
      </SessionProvider>
    </EdgeStoreProvider>
  );
}
