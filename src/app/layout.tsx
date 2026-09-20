import type { Metadata } from "next";
import { Geist, Pixelify_Sans } from "next/font/google";
import { CaseStudyTransition } from "@/components/v3/case-study-transition";
import { PagePeelProvider } from "@/components/v3/page-peel";
import { DevChrome } from "@/components/dev-chrome";

import "./globals.css";
import "./v3.css";

const pixel = Pixelify_Sans({ subsets: ["latin"], weight: "400", variable: "--font-pixel" });

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Roy Li — Design Engineer",
  description:
    "Roy Li builds interfaces that feel considered. USC Iovine and Young Academy. Full-stack, design, and the details in between.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`no-js ${geist.variable} ${pixel.variable} h-full`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.replace("no-js","js")`,
          }}
        />
      </head>
      {/*
        No overflow-x here: `overflow-x: hidden` forces the other axis to
        `auto`, which makes <body> its own scroll container and breaks
        viewport-rooted IntersectionObservers. The page wrapper clips instead.
      */}
      <body className="flex min-h-full flex-col">
        <CaseStudyTransition><PagePeelProvider>{children}</PagePeelProvider></CaseStudyTransition>
        {process.env.NODE_ENV === "development" && <DevChrome />}
      </body>
    </html>
  );
}
