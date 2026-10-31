/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/visuals";
import {
  Bot,
  ChevronDown,
  MessageSquareText,
  RefreshCw,
  Search,
  Trash2,
  User,
} from "lucide-react";
import type { ChatLogsResponse, ChatSessionLog } from "@/types/configs/chatbot";

export default function AdminChatLogsPage() {
  const [sessions, setSessions] = useState<ChatSessionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [consentFilter, setConsentFilter] = useState("all");
  const [filters, setFilters] = useState({ search: "", consent: "all" });
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  const fetchLogs = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          limit: "20",
          offset: String(offset),
        });
        if (filters.search) params.set("searchQuery", filters.search);
        if (filters.consent !== "all")
          params.set("hasConsent", String(filters.consent === "yes"));
        const response = await fetch(
          `/api/admin/chatbot/logs?${params}`,
          signal ? { signal } : {},
        );
        if (!response.ok)
          throw new Error(
            response.status === 401
              ? "Your session has expired. Sign in again from the admin workspace."
              : "Unable to load conversations. Please try again.",
          );
        const data = (await response.json()) as ChatLogsResponse;
        if (signal?.aborted) return;
        setSessions(data.sessions);
        setTotal(data.total);
        setHasMore(data.hasMore);
      } catch (err) {
        if (!signal?.aborted)
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load conversations. Please try again.",
          );
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [filters, offset],
  );

  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchLogs(controller.signal);
    return () => controller.abort();
  }, [fetchLogs]);

  async function deleteSession(sessionId: string) {
    if (
      !window.confirm(
        "Delete this chat session and all its messages? This cannot be undone.",
      )
    )
      return;
    setDeleting(sessionId);
    setError(null);
    try {
      const response = await fetch(
        `/api/admin/chatbot/logs?sessionId=${encodeURIComponent(sessionId)}`,
        { method: "DELETE" },
      );
      if (!response.ok)
        throw new Error("Unable to delete this session. Please try again.");
      setSelectedSession(null);
      if (sessions.length === 1 && offset > 0) setOffset(offset - 20);
      else await fetchLogs();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete this session. Please try again.",
      );
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Chatbot logs
          </h1>
          <p className="mt-2 text-muted-foreground">
            Review conversations, check consent, and manage stored chat
            sessions.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => void fetchLogs()}
          disabled={loading || deleting !== null}
        >
          <RefreshCw
            className={`size-4 ${loading ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
          Refresh
        </Button>
      </header>

      <form
        className="grid gap-4 rounded-xl border bg-card p-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          setOffset(0);
          setSelectedSession(null);
          setFilters({ search: searchQuery.trim(), consent: consentFilter });
        }}
      >
        <div className="space-y-2">
          <label htmlFor="chat-search" className="text-sm font-medium">
            Search messages
          </label>
          <div className="relative">
            <Search
              className="absolute left-3 top-3 size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="chat-search"
              placeholder="Find a conversation…"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              maxLength={200}
              className="pl-9"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="chat-consent" className="text-sm font-medium">
            Visitor consent
          </label>
          <select
            id="chat-consent"
            value={consentFilter}
            onChange={(event) => setConsentFilter(event.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">All sessions</option>
            <option value="yes">Consent given</option>
            <option value="no">No consent</option>
          </select>
        </div>
        <Button
          type="submit"
          className="self-end"
          disabled={loading || deleting !== null}
        >
          Apply filters
        </Button>
      </form>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/40 p-5 text-destructive"
        >
          {error}
        </div>
      )}
      <section
        aria-label="Chatbot logs"
        aria-busy={loading}
        className="space-y-4"
      >
        <p role="status" className="text-sm text-muted-foreground">
          {`${total} ${total === 1 ? "session" : "sessions"} found`}
        </p>
        {loading ? (
          <LoadingSkeleton variant="list" count={5} />
        ) : !error && sessions.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center">
            <MessageSquareText
              className="mx-auto mb-4 size-8 text-muted-foreground"
              aria-hidden="true"
            />
            <h2 className="text-lg font-semibold">No conversations found</h2>
            <p className="mt-2 text-muted-foreground">
              Try another search or change the consent filter.
            </p>
          </div>
        ) : (
          !error &&
          sessions.map((session) => (
            <article
              key={session.id}
              className="overflow-hidden rounded-xl border bg-card"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 p-5 sm:p-6">
                <div className="min-w-0 space-y-3">
                  <h2 className="break-all font-mono text-xs text-muted-foreground">
                    {session.id}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={session.consentGiven ? "secondary" : "outline"}
                    >
                      {session.consentGiven ? "Consent given" : "No consent"}
                    </Badge>
                    {session.isActive && (
                      <Badge variant="outline">Active</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                    <time dateTime={new Date(session.startedAt).toISOString()}>
                      {new Date(session.startedAt).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </time>
                    <span>
                      {`${session.totalMessages} ${session.totalMessages === 1 ? "message" : "messages"}`}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    aria-expanded={selectedSession === session.id}
                    aria-controls={`messages-${session.id}`}
                    onClick={() =>
                      setSelectedSession(
                        selectedSession === session.id ? null : session.id,
                      )
                    }
                  >
                    {selectedSession === session.id
                      ? "Hide messages"
                      : "View messages"}
                    <ChevronDown
                      className={`size-4 ${selectedSession === session.id ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Delete session"
                    disabled={deleting !== null || loading}
                    onClick={() => void deleteSession(session.id)}
                  >
                    <Trash2
                      className="size-4 text-destructive"
                      aria-hidden="true"
                    />
                  </Button>
                </div>
              </div>
              {selectedSession === session.id && (
                <div
                  id={`messages-${session.id}`}
                  className="max-h-96 space-y-3 overflow-y-auto border-t bg-muted/20 p-5 sm:p-6"
                >
                  {session.messages?.length ? (
                    session.messages.map((message) => (
                      <div
                        key={message.id}
                        className="flex gap-3 rounded-lg border bg-background p-4"
                      >
                        {message.role === "user" ? (
                          <User
                            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                            aria-hidden="true"
                          />
                        ) : (
                          <Bot
                            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                            aria-hidden="true"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">
                              {message.role === "user"
                                ? "Visitor"
                                : "Assistant"}
                            </span>
                            <time
                              dateTime={new Date(
                                message.timestamp,
                              ).toISOString()}
                            >
                              {new Date(message.timestamp).toLocaleTimeString(
                                "en-US",
                                {
                                  timeStyle: "short",
                                },
                              )}
                            </time>
                          </div>
                          <p className="whitespace-pre-wrap wrap-break-word text-sm leading-relaxed">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No messages in this session.
                    </p>
                  )}
                </div>
              )}
            </article>
          ))
        )}
      </section>
      {!error && (offset > 0 || hasMore) && (
        <nav
          className="flex flex-wrap items-center justify-between gap-3"
          aria-label="Conversation pages"
        >
          <Button
            variant="outline"
            disabled={loading || deleting !== null || offset === 0}
            onClick={() => setOffset(Math.max(0, offset - 20))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            {`Page ${offset / 20 + 1}`}
          </span>
          <Button
            variant="outline"
            disabled={loading || deleting !== null || !hasMore}
            onClick={() => setOffset(offset + 20)}
          >
            Next
          </Button>
        </nav>
      )}
    </div>
  );
}
