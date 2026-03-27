import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import AuthSessionProvider from "@/components/providers/session-provider";
import InactivityLogout from "@/components/providers/inactivity-logout";
import PosthogProvider from "@/components/providers/posthog-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_URL = process.env.NEXTAUTH_URL ?? "https://drivehub.ca";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "DriveHub – Book Driving Lessons with Qualified Instructors",
    template: "%s | DriveHub",
  },
  description:
    "Find and book certified driving instructors near you. Flexible scheduling, transparent pricing, and real student reviews.",
  keywords: [
    "driving lessons",
    "driving instructor",
    "book driving lesson",
    "learn to drive",
    "G2 test",
    "G test",
    "DriveTest",
    "Ontario driving school",
  ],
  openGraph: {
    type: "website",
    siteName: "DriveHub",
    title: "DriveHub – Book Driving Lessons with Qualified Instructors",
    description:
      "Find and book certified driving instructors near you. Flexible scheduling, transparent pricing, and real student reviews.",
    url: APP_URL,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "DriveHub" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DriveHub – Book Driving Lessons with Qualified Instructors",
    description:
      "Find and book certified driving instructors near you. Flexible scheduling, transparent pricing, and real student reviews.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <Script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
          />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PosthogProvider>
          <AuthSessionProvider>
            <InactivityLogout />
            {children}
          </AuthSessionProvider>
        </PosthogProvider>
      </body>
    </html>
  );
}
