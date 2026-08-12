import type { Metadata } from "next";
// import { Poppins } from "next/font/google";
import { Caladea } from "next/font/google";

import "./globals.css";
import { cn } from "@/lib/utils";
import NavBar from "@/components/layout/NavBar";
import { ThemeProvider } from "next-themes";
import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";
import { EdgeStoreProvider } from "@/lib/edgestore";
import { Toaster } from "react-hot-toast";
import { SocketContextProvider } from "@/context/SocketContext";
import Footer from "@/components/layout/Footer";
import { metadataBase, siteConfig, getSocialImageUrl } from "@/lib/seo";
import Script from "next/script";
import ConsentBanner from "@/components/common/ConsentBanner";
import AnalyticsConsentLoader from "@/components/common/AnalyticsConsentLoader";

// const poppins = Poppins({
//   variable: "--font-poppins",
//   subsets: ["latin"],
//   weight: ["400", "700"],
// });

const caladea = Caladea({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase,
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.jpg",
  },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
    images: [
      {
        url: getSocialImageUrl(),
        alt: siteConfig.description,
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [getSocialImageUrl()],
  },
  keywords: [
    "Lagos",
    "Nigeria",
    "Africa",
    "developer blog",
    "software services Lagos",
    "AI services Lagos",
    "web development Lagos",
    "hire developers in Lagos",
    "Nigerian tech blog",
    "African developers",
    "programming tutorials",
    "software engineering",
    "technology services",
    "career growth",
    "web development",
    "ai",
    "artificial intelligence",
    "machine learning",
    "data science",
    "deep learning",
    "neural networks",
    "computer vision",
    "natural language processing",
    "cybersecurity",
    "cloud computing",
    "devops",
  ],
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: siteConfig.url,
  },
  verification: {
    google: "UzZS0hHIxrUShTyrrxc42V15wyHI1mKcnzJaDIGzRFM",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "antialiased flex flex-col min-h-screen px-2",
          caladea.className,
        )}
      >
        <Script id="google-consent-default" strategy="beforeInteractive">
          {`
        window.dataLayer = window.dataLayer || [];

        window.gtag =
          window.gtag ||
          function () {
            window.dataLayer.push(arguments);
          };

        var analyticsConsent = 'denied';

        try {
          if (
            window.localStorage.getItem(
              'devChampionsConsent'
            ) === 'accepted'
          ) {
            analyticsConsent = 'granted';
          }
        } catch (error) {
          analyticsConsent = 'denied';
        }

        window.gtag('consent', 'default', {
          analytics_storage: analyticsConsent,
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied'
        });
      `}
        </Script>

        <AnalyticsConsentLoader />

        <ConsentBanner />
        <Script id="organization-schema" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: siteConfig.name,
            url: siteConfig.url,
            logo: `${siteConfig.url}/favicon.jpg`,
            description: siteConfig.description,
            sameAs: [],
          })}
        </Script>
        <Script id="local-business-schema" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: siteConfig.name,
            url: siteConfig.url,
            logo: `${siteConfig.url}/favicon.jpg`,
            description: siteConfig.description,
            address: {
              "@type": "PostalAddress",
              addressLocality: "Lagos",
              addressRegion: "Lagos",
              addressCountry: "NG",
            },
            areaServed: [
              {
                "@type": "Country",
                name: "Nigeria",
              },
            ],
            sameAs: [],
          })}
        </Script>
        <Script id="service-schema" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: `${siteConfig.name} Developer and AI Services`,
            description:
              "Web development, AI solutions, software engineering, and developer consulting services for Lagos and Nigeria.",
            provider: {
              "@type": "Organization",
              name: siteConfig.name,
              url: siteConfig.url,
            },
            areaServed: {
              "@type": "Country",
              name: "Nigeria",
            },
            serviceType: "Web Development, AI, and Software Consulting",
            audience: {
              "@type": "Audience",
              audienceType:
                "Developers, startups, and technology teams in Lagos",
            },
          })}
        </Script>
        <Script id="website-schema" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: siteConfig.name,
            url: siteConfig.url,
            potentialAction: {
              "@type": "SearchAction",
              target: `${siteConfig.url}/search?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          })}
        </Script>
        <EdgeStoreProvider>
          <SessionProvider
            session={session}
            refetchInterval={0}
            refetchOnWindowFocus={false}
          >
            <SocketContextProvider>
              <Toaster
                position="bottom-center"
                toastOptions={{
                  style: {
                    background: "rgb(51 65 85)",
                    color: "#fff",
                  },
                }}
              />
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <NavBar />
                <main className="flex-grow">{children}</main>
                <Footer />
              </ThemeProvider>
            </SocketContextProvider>
          </SessionProvider>
        </EdgeStoreProvider>
      </body>
    </html>
  );
}
