/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 *
 * `npm run rag:index`: syncs Reem's retrieval index with data/, the notes in
 * data/knowledge and every blog post. Unchanged sources are skipped, so it is
 * cheap to run on every deploy. A failure is logged but never fails the
 * deploy: a stale index is better than no site.
 */

import { config } from "dotenv";

// Env before any other import: lib/configs/prisma reads DATABASE_URL on load.
// Earlier files win, as in Next.
config({ path: [".env.local", ".env"], quiet: true });

async function main(): Promise<void> {
  const { getEmbeddingModelId } = await import("@/lib/rag/embeddings");
  if (!getEmbeddingModelId()) {
    console.log("[rag] EMBEDDING_MODEL is not set — skipping indexing.");
    return;
  }

  const { reindexAll } = await import("@/lib/rag/indexer");
  const { prisma } = await import("@/lib/configs/prisma");
  try {
    const { sources, blogs } = await reindexAll();
    console.log(
      `[rag] index up to date: ${sources} static source(s) and ${blogs} blog(s) re-embedded.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error("[rag] indexing failed:", error);
});
