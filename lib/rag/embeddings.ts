/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import { openai } from "@ai-sdk/openai";
import { embed, embedMany } from "ai";

/** Unset means RAG is off: no search tool for Reem, and indexing is skipped. */
export function getEmbeddingModelId(): string | undefined {
  return process.env.EMBEDDING_MODEL?.trim() || undefined;
}

function embeddingModel() {
  const modelId = getEmbeddingModelId();
  if (!modelId) throw new Error("EMBEDDING_MODEL is not set");
  return openai.embeddingModel(modelId);
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const { embeddings } = await embedMany({
    model: embeddingModel(),
    values: texts,
    maxParallelCalls: 2,
  });
  return embeddings;
}

export async function embedQuery(text: string): Promise<number[]> {
  const { embedding } = await embed({ model: embeddingModel(), value: text });
  return embedding;
}

/** pgvector's text form, `[0.1,0.2,…]`, passed as a query parameter and cast with `::vector`. */
export function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}
