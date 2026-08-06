/** All Rights Reserved - No part of this website or any of its contents may be reproduced, copied, modified or adapted,
 * without the prior written consent of the author, unless otherwise indicated for stand-alone materials.
 * @Leva_Palestina
 * @Free_Palestine
 */
/**
 * @file /app/layout.tsx
 * @created 2024-12-31 23:00:00
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 *
 * @see @link https://www.coldbydefault.com for the live website.
 */

import "./globals.css";
import "@/styles/company-banner.css";
import React from "react";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Navbar } from "@/components/nav";
import { Footer } from "@/components/footer";
import { CookiesBanner, ConsentedAnalytics } from "@/components/cookies";
import { LocaleAutoDetect } from "@/components/languages";
import { ChatBot } from "@/components/chatbot";
import { NoSSR } from "@/components/NoSSR";
import { seoConfigEN, generateStructuredData } from "@/lib/configs/seo";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Urbanist } from "next/font/google";
import { ThemeConfigInitializer } from "@/components/theme/theme-config-initializer";
import { ViewportRenderer } from "@/components/theme/viewport-renderer";
import Link from "next/link";
import { MotionProvider } from "@/components/visuals/MotionProvider";

const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
  display: "swap",
  fallback: ["system-ui", "arial"],
  adjustFontFallback: false,
});

export const metadata = {
  metadataBase: new URL("https://www.coldbydefault.com"),
  title: {
    default: "Yazan Abo-Ayash | Full Stack Developer",
    template: `%s | ${seoConfigEN.siteName}`,
  },
  description: seoConfigEN.description,
  keywords: seoConfigEN.keywords,
  authors: [{ name: seoConfigEN.author }],
  creator: seoConfigEN.author,
  publisher: seoConfigEN.author,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "",
  },
};

const structuredData = generateStructuredData(seoConfigEN);

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const messages = await getMessages();
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="author" content={seoConfigEN.author} />
        <meta name="keywords" content={seoConfigEN.keywords.join(", ")} />

        {/* Disable browser auto-translation */}
        <meta name="google" content="notranslate" />

        {/* Security Headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta
          httpEquiv="Referrer-Policy"
          content="strict-origin-when-cross-origin"
        />
        <meta
          httpEquiv="Permissions-Policy"
          content="camera=(), microphone=(), geolocation=()"
        />

        {/* Favicon and App Icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon.ico" />

        {/* Critical Performance Optimizations - Only preconnect to immediately needed resources */}

        {/* Essential: Vercel Analytics - Needed early for performance tracking */}
        <link rel="preconnect" href="https://vitals.vercel-analytics.com" />

        {/* Non-critical: DNS prefetch for dynamically loaded resources */}
        <link rel="dns-prefetch" href="https://api.github.com" />
        <link rel="dns-prefetch" href="https://avatars.githubusercontent.com" />
        <link rel="dns-prefetch" href="https://www.googleapis.com" />
        <link
          rel="dns-prefetch"
          href="https://generativelanguage.googleapis.com"
        />

        {/* Structured Data - JSON-LD for SEO rich snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={`${urbanist.variable} flex flex-col min-h-screen`}>
        {/* Skip to main content for accessibility */}
        <Link
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-9999 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Skip to main content
        </Link>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
            scriptProps={{ type: "application/json" }}
          >
            <MotionProvider>
              <Navbar />
              <main className="flex-1" id="main-content">
                {children}
              </main>
              <Footer />
              <CookiesBanner />
              <LocaleAutoDetect />
              <NoSSR>
                <ChatBot position="bottom-left" />
              </NoSSR>
              <ThemeConfigInitializer />
              <ViewportRenderer />
            </MotionProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
        <ConsentedAnalytics />
      </body>
    </html>
  );
}
