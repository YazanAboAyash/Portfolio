/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import { createHash, randomUUID } from "node:crypto";
import { RAG_SOURCE_URLS } from "@/data/configs/rag";
import { prisma } from "@/lib/configs/prisma";
import { chunkMarkdown } from "@/lib/rag/chunking";
import {
  embedTexts,
  getEmbeddingModelId,
  toVectorLiteral,
} from "@/lib/rag/embeddings";
import { buildStaticDocuments } from "@/lib/rag/sources";
import type { KnowledgeDocument } from "@/types/configs/rag";

/**
 * Writes Reem's retrieval index. Each source is stored as its chunks plus one
 * hash of the whole source, so an unchanged source is never re-embedded.
 * Prisma cannot write the `vector` column, so inserts are parameterised raw SQL.
 */

function hashDocument(document: KnowledgeDocument): string {
  return createHash("sha256")
    .update(
      JSON.stringify([
        document.title,
        document.url,
        document.language,
        document.text,
      ]),
    )
    .digest("hex");
}

/** Replaces every chunk of one source in a single transaction. */
async function writeDocument(
  document: KnowledgeDocument,
  contentHash: string,
): Promise<void> {
  const chunks = chunkMarkdown(document.title, document.text);
  const embeddings = await embedTexts(chunks);

  await prisma.$transaction([
    prisma.knowledgeChunk.deleteMany({
      where: { sourceId: document.sourceId },
    }),
    ...chunks.map(
      (content, index) => prisma.$executeRaw`
        INSERT INTO knowledge_chunks
          (id, "sourceType", "sourceId", "blogId", title, url, language,
           "chunkIndex", content, "contentHash", embedding, "createdAt", "updatedAt")
        VALUES
          (${randomUUID()}, ${document.sourceType}, ${document.sourceId},
           ${document.blogId ?? null}, ${document.title}, ${document.url},
           ${document.language}, ${index}, ${content}, ${contentHash},
           ${toVectorLiteral(embeddings[index] ?? [])}::vector, NOW(), NOW())`,
    ),
  ]);
}

async function storedHash(sourceId: string): Promise<string | undefined> {
  const chunk = await prisma.knowledgeChunk.findFirst({
    where: { sourceId },
    select: { contentHash: true },
  });
  return chunk?.contentHash;
}

/**
 * Embeds one blog post, draft or not; search filters on `isPublished`, so
 * publishing needs no re-embed. Returns whether anything was (re)written.
 */
export async function indexBlog(blogId: string): Promise<boolean> {
  if (!getEmbeddingModelId()) return false;

  const blog = await prisma.blog.findUnique({
    where: { id: blogId },
    select: {
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      language: true,
    },
  });
  if (!blog) return false;

  const document: KnowledgeDocument = {
    sourceType: "blog",
    sourceId: blogId,
    blogId,
    title: `Blog post: ${blog.title}`,
    url: `${RAG_SOURCE_URLS.blog}/${blog.slug}`,
    language: blog.language,
    text: [blog.excerpt, blog.content].filter(Boolean).join("\n\n"),
  };
  const contentHash = hashDocument(document);
  if ((await storedHash(blogId)) === contentHash) return false;

  await writeDocument(document, contentHash);
  return true;
}

/**
 * Re-embeds every changed static source, then deletes chunks of sources that
 * no longer exist. Returns how many sources were (re)written.
 */
export async function indexStaticSources(): Promise<number> {
  const documents = await buildStaticDocuments();
  let written = 0;

  for (const document of documents) {
    const contentHash = hashDocument(document);
    if ((await storedHash(document.sourceId)) === contentHash) continue;
    await writeDocument(document, contentHash);
    written += 1;
  }

  await prisma.knowledgeChunk.deleteMany({
    where: {
      sourceType: { not: "blog" },
      sourceId: { notIn: documents.map((document) => document.sourceId) },
    },
  });

  return written;
}

/** The `rag:index` run: all static sources and every blog that is new or changed. */
export async function reindexAll(): Promise<{ sources: number; blogs: number }> {
  const sources = await indexStaticSources();

  const blogs = await prisma.blog.findMany({ select: { id: true } });
  let blogsWritten = 0;
  for (const { id } of blogs) {
    if (await indexBlog(id)) blogsWritten += 1;
  }

  return { sources, blogs: blogsWritten };
}
