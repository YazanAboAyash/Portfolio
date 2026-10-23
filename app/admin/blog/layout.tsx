/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog Admin - Portfolio",
  description: "Blog management dashboard",
  robots: "noindex, nofollow",
};

export default function AdminBlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
