/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.coldbydefault.com";
  // Named bots skip the "*" group entirely, so each one repeats this list
  const disallow = [
    "/admin/",
    "/api/",
    "/admin/blog",
    "/admin/chatbot",
    "/private/",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/about",
          "/projects",
          "/blog",
          "/about-portfolio",
          "/mcp",
          "/privacy",
          "/impressum",
        ],
        disallow,
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow,
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow,
      },
      {
        userAgent: "facebookexternalhit",
        allow: "/",
        disallow,
      },
      {
        userAgent: "Twitterbot",
        allow: "/",
        disallow,
      },
      {
        userAgent: "LinkedInBot",
        allow: "/",
        disallow,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
