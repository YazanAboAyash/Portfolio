/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

import type { GitHubDeclaredHighlight } from "@/types/configs/github";

/**
 * Profile facts GitHub has no API for. Everything else in the GitHub section is
 * fetched live — add an entry here only when no endpoint exposes the fact.
 */
export const githubDeclaredHighlights: GitHubDeclaredHighlight[] = [
  {
    id: "developer-program",
    label: "GitHub Developer Program member",
    link: "https://docs.github.com/en/integrations/concepts/github-developer-program",
  },
];
