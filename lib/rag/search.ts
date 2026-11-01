/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import { ragConfig } from "@/data/configs/rag";
import { prisma } from "@/lib/configs/prisma";
import { embedQuery, toVectorLiteral } from "@/lib/rag/embeddings";
import type { KnowledgeSearchResult } from "@/types/configs/rag";

/**
 * Hybrid search over the retrieval index: cosine similarity plus Postgres
 * full-text search, merged by reciprocal rank fusion. Embeddings alone miss
 * one name in a long list ("does he know Drizzle?" scores below the cut-off
 * against his skills), which keyword matching catches.
 *
 * Blog chunks are returned only while their post is published, so drafts
 * (which are embedded too) never reach Reem. No language filter: embeddings
 * match across languages, and each result says which language it is in.
 * The corpus is a few hundred rows, so both rankings are computed in full.
 */
export async function searchKnowledge(
  query: string,
): Promise<KnowledgeSearchResult[]> {
  const vector = toVectorLiteral(await embedQuery(query));
  const { topK, minScore, rrfK } = ragConfig;

  return prisma.$queryRaw<KnowledgeSearchResult[]>`
    WITH q AS (
      SELECT ${vector}::vector AS v,
             -- Any query word may match: AND semantics would need every word in one chunk.
             replace(plainto_tsquery('english', ${query})::text, ' & ', ' | ')::tsquery AS t
    ),
    visible AS (
      SELECT k.title, k.url, k."sourceType", k.language, k.content, k.embedding,
             to_tsvector('english', k.content) AS document
      FROM knowledge_chunks k
      LEFT JOIN blogs b ON b.id = k."blogId"
      WHERE k."blogId" IS NULL OR b."isPublished" = true
    ),
    ranked AS (
      SELECT visible.*,
             1 - (embedding <=> q.v) AS score,
             rank() OVER (ORDER BY embedding <=> q.v) AS semantic_rank,
             CASE WHEN document @@ q.t THEN
               rank() OVER (ORDER BY document @@ q.t DESC, ts_rank_cd(document, q.t) DESC)
             END AS keyword_rank
      FROM visible, q
    )
    SELECT title, url, "sourceType", language, content, score
    FROM ranked
    WHERE score >= ${minScore} OR keyword_rank IS NOT NULL
    ORDER BY 1.0 / (${rrfK} + semantic_rank)
           + COALESCE(1.0 / (${rrfK} + keyword_rank), 0) DESC
    LIMIT ${topK}`;
}
