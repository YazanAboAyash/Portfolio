/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import { ThinkingOrb } from "thinking-orbs";

// thinking-orbs ships no "use client" directive and uses hooks, so the server-rendered
// loading.tsx boundaries reach it through this wrapper. The orb's built-in role="img" label
// is untranslated English, so it is hidden — the surrounding title carries the meaning.
export default function LoadingOrb() {
  return <ThinkingOrb state="breathing" size={20} aria-hidden="true" />;
}
