/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import type { Metadata } from "next";
import { GitHubAskConsole } from "@/components/github";
import { githubCopy } from "@/components/github/GitHub.constants";

const { title, description } = githubCopy.page;

/** Like the home page's MCP section, this playground is English-only. */
export const metadata: Metadata = {
  title: { absolute: `${title} | ColdByDefault` },
  description,
  alternates: {
    canonical: "/mcp",
  },
  openGraph: {
    title,
    description,
    url: "/mcp",
    type: "website",
  },
};

export default function McpPlayground() {
  return (
    <main lang="en" className="frame py-16 md:py-24">
      <GitHubAskConsole variant="page" />
    </main>
  );
}
