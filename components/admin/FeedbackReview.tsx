/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useState } from "react";
import {
  Check,
  EyeOff,
  Quote,
  RefreshCw,
  Search,
  Star,
  Trash2,
  UserX,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/components/visuals";
import { useFeedbackAdmin } from "@/hooks/use-feedback-admin";
import {
  FEEDBACK_ADMIN_PAGE_SIZE,
  FEEDBACK_STATUSES,
  FEEDBACK_TOPICS,
} from "@/data/configs/feedback";
import type {
  AdminFeedbackEntry,
  FeedbackAdminFilters,
  FeedbackStatus,
} from "@/types/configs/feedback";
import { cn } from "@/lib/utils";

// Admin pages are English-only by design (see CLAUDE.md), so the copy lives here.

const groupLabelClass =
  "text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground";

const actionClass =
  "inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:cursor-not-allowed disabled:opacity-60";

const chipClass =
  "bg-background px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground";

/** Everything the moderator caught is red; the rest of the page stays monochrome. */
const flaggedChipClass = "bg-destructive/10 text-destructive";

const flaggedTermClass =
  "bg-destructive/15 px-0.5 font-semibold text-destructive";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Renders `text` with the moderator's flagged terms marked in red. Terms are
 * matched literally and case-insensitively; longest first, so a phrase wins
 * over a word inside it. Splitting on a capturing group puts every match at
 * an odd index.
 */
function Highlighted({ text, terms }: { text: string; terms: string[] }) {
  if (terms.length === 0) return <>{text}</>;

  const pattern = new RegExp(
    `(${[...terms]
      .sort((a, b) => b.length - a.length)
      .map(escapeRegExp)
      .join("|")})`,
    "gi",
  );

  return (
    <>
      {text.split(pattern).map((part, index) =>
        index % 2 === 1 ? (
          <mark key={index} className={flaggedTermClass}>
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

const fieldClass =
  "h-12 rounded-none border-transparent bg-surface px-4 text-base shadow-none md:text-base dark:bg-surface";

const STATUS_LABELS: Record<FeedbackStatus | "all", string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  all: "All",
};

const TOPIC_LABELS: Record<AdminFeedbackEntry["topic"], string> = {
  me: "About Yazan",
  website: "About the site",
};

/**
 * The review queue for visitor feedback. Nothing reaches the home page wall
 * without an approval here, and even then only when the sender consented.
 */
export function FeedbackReview() {
  const {
    filters,
    setFilters,
    offset,
    setOffset,
    data,
    loading,
    busyId,
    error,
    refresh,
    review,
    remove,
  } = useFeedbackAdmin();
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState<FeedbackAdminFilters["topic"]>("all");

  const counts = data?.counts;
  const allCount = counts
    ? counts.pending + counts.approved + counts.rejected
    : undefined;
  const busy = loading || busyId !== null;

  const confirmDelete = (id: string): void => {
    if (
      window.confirm(
        "Delete this feedback for good? Use this when a visitor asks for removal. This cannot be undone.",
      )
    ) {
      void remove(id);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <SectionHeading
        as="h1"
        title="Feedback"
        lead="Review what visitors left. Approved entries appear on the home page wall, but only when the visitor agreed to publication."
        aside={
          <button
            type="button"
            onClick={refresh}
            disabled={busy}
            className={cn(actionClass, "bg-surface transition-colors hover:bg-surface-2")}
          >
            <RefreshCw
              className={cn("h-4 w-4", loading && "animate-spin motion-reduce:animate-none")}
              aria-hidden="true"
            />
            Refresh
          </button>
        }
      />

      {/* Status filter */}
      <div className="flex flex-col gap-3">
        <p className={groupLabelClass} id="feedback-status-label">
          Status
        </p>
        <div
          className="grid grid-cols-2 gap-2 sm:grid-cols-4"
          role="group"
          aria-labelledby="feedback-status-label"
        >
          {([...FEEDBACK_STATUSES, "all"] as const).map((status) => {
            const count = status === "all" ? allCount : counts?.[status];
            return (
              <button
                key={status}
                type="button"
                aria-pressed={filters.status === status}
                disabled={busy && filters.status !== status}
                onClick={() => setFilters({ ...filters, status })}
                className={cn(
                  "flex min-h-12 cursor-pointer items-center justify-between gap-3 px-4 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:cursor-not-allowed",
                  filters.status === status
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface hover:bg-surface-2",
                )}
              >
                {STATUS_LABELS[status]}
                <span className="tabular-nums opacity-70">{count ?? "–"}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search and topic */}
      <form
        className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,14rem)_auto] sm:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          setFilters({ ...filters, topic, search: search.trim() });
        }}
      >
        <div className="flex flex-col gap-3">
          <label htmlFor="feedback-search" className={groupLabelClass}>
            Search
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="feedback-search"
              placeholder="Message or name…"
              value={search}
              maxLength={200}
              onChange={(event) => setSearch(event.target.value)}
              className={cn(fieldClass, "pl-11")}
            />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <label htmlFor="feedback-topic" className={groupLabelClass}>
            Topic
          </label>
          <select
            id="feedback-topic"
            value={topic}
            onChange={(event) =>
              setTopic(event.target.value as FeedbackAdminFilters["topic"])
            }
            className="h-12 w-full cursor-pointer bg-surface px-4 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            <option value="all">All topics</option>
            {FEEDBACK_TOPICS.map((value) => (
              <option key={value} value={value}>
                {TOPIC_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={busy}
          className={cn(actionClass, "min-h-12 bg-primary px-6 text-primary-foreground")}
        >
          Apply
        </button>
      </form>

      {error && (
        <p role="alert" className="bg-surface p-5 text-sm text-destructive">
          {error}
        </p>
      )}

      <section aria-label="Feedback entries" aria-busy={loading} className="flex flex-col gap-3">
        <p role="status" className="text-sm text-muted-foreground">
          {data
            ? `${data.total} ${data.total === 1 ? "entry" : "entries"}`
            : ""}
        </p>

        {loading && !data ? (
          [0, 1, 2].map((key) => (
            <div key={key} className="h-48 animate-pulse bg-surface motion-reduce:animate-none" />
          ))
        ) : data && data.entries.length === 0 ? (
          <div className="flex min-h-40 flex-col items-start justify-center gap-2 bg-surface p-6 md:p-8">
            <Quote className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
            <p className="text-lg font-semibold tracking-[-0.01em]">
              Nothing here
            </p>
            <p className="text-sm leading-relaxed text-foreground/80">
              {filters.status === "pending"
                ? "The queue is clear."
                : "Try another status, topic or search."}
            </p>
          </div>
        ) : (
          <ul className={cn("flex flex-col gap-3", loading && "opacity-60")}>
            {data?.entries.map((entry) => (
              <li key={entry.id}>
                <FeedbackReviewCard
                  entry={entry}
                  busy={busy}
                  working={busyId === entry.id}
                  onReview={(status, clearName) =>
                    void review(entry.id, status, clearName)
                  }
                  onDelete={() => confirmDelete(entry.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {data && (offset > 0 || data.hasMore) && (
        <nav
          className="flex items-center justify-between gap-3"
          aria-label="Feedback pages"
        >
          <button
            type="button"
            disabled={busy || offset === 0}
            onClick={() => setOffset(offset - FEEDBACK_ADMIN_PAGE_SIZE)}
            className={cn(actionClass, "bg-surface transition-colors hover:bg-surface-2")}
          >
            Previous
          </button>
          <span className="text-sm tabular-nums text-muted-foreground">
            {`Page ${offset / FEEDBACK_ADMIN_PAGE_SIZE + 1}`}
          </span>
          <button
            type="button"
            disabled={busy || !data.hasMore}
            onClick={() => setOffset(offset + FEEDBACK_ADMIN_PAGE_SIZE)}
            className={cn(actionClass, "bg-surface transition-colors hover:bg-surface-2")}
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}

function FeedbackReviewCard({
  entry,
  busy,
  working,
  onReview,
  onDelete,
}: {
  entry: AdminFeedbackEntry;
  busy: boolean;
  working: boolean;
  onReview: (status: FeedbackStatus, clearName?: boolean) => void;
  onDelete: () => void;
}) {
  const verdict =
    entry.aiVerdict === null ? "AI: unchecked" : `AI: ${entry.aiVerdict}`;
  const flags = entry.aiReasons.join(", ") || "no reason given";
  const caught = entry.aiVerdict === "reject" || entry.status === "rejected";
  const terms = entry.aiFlaggedTerms;
  const nameFlagged =
    entry.name !== null &&
    (entry.aiReasons.includes("offensive_name") ||
      terms.some((term) =>
        entry.name?.toLowerCase().includes(term.toLowerCase()),
      ));

  // Overriding the moderator is a deliberate act: it is easy to read a kind
  // message and miss that the name was what got it rejected.
  const approve = (): void => {
    if (
      entry.aiVerdict === "reject" &&
      !window.confirm(
        `The AI rejected this entry (${flags}). Check the name as well as the message. Approve anyway?`,
      )
    ) {
      return;
    }
    onReview("approved");
  };

  const approveWithoutName = (): void => {
    if (
      window.confirm(
        `Erase the name "${entry.name}" for good and publish this as Anonymous?`,
      )
    ) {
      onReview("approved", true);
    }
  };

  return (
    <article
      className={cn(
        "flex flex-col gap-5 bg-surface px-5 py-5 md:px-6",
        working && "opacity-60",
      )}
      aria-busy={working}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            chipClass,
            entry.status === "pending" && "bg-primary text-primary-foreground",
            entry.status === "approved" && "bg-foreground text-background",
            entry.status === "rejected" && flaggedChipClass,
          )}
        >
          {STATUS_LABELS[entry.status]}
        </span>
        <span className={chipClass}>{TOPIC_LABELS[entry.topic]}</span>
        <span className={chipClass}>
          {entry.consentToPublish ? "Public" : "Private"}
        </span>
        <span className={chipClass}>{entry.locale}</span>
        <span
          className={cn(chipClass, entry.aiVerdict === "reject" && flaggedChipClass)}
        >
          {verdict}
        </span>
        {entry.aiReasons.map((reason) => (
          <span
            key={reason}
            className={cn(chipClass, caught && flaggedChipClass)}
          >
            {reason.replace(/[_/]/g, " ")}
          </span>
        ))}
        {entry.rating !== null && (
          <span
            className="ml-auto flex items-center gap-0.5"
            role="img"
            aria-label={`Rated ${entry.rating} out of 5`}
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <Star
                key={value}
                className={cn(
                  "h-3.5 w-3.5",
                  value <= (entry.rating ?? 0)
                    ? "fill-foreground text-foreground"
                    : "text-muted-foreground/50",
                )}
                aria-hidden="true"
              />
            ))}
          </span>
        )}
      </div>

      <blockquote className="whitespace-pre-line text-base leading-relaxed wrap-anywhere">
        <Highlighted text={entry.message} terms={terms} />
      </blockquote>

      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
        <span className={cn("font-semibold", nameFlagged && "text-destructive")}>
          {entry.name === null ? (
            "Anonymous"
          ) : (
            <Highlighted text={entry.name} terms={terms} />
          )}
        </span>
        <time dateTime={entry.createdAt} className="text-muted-foreground">
          {new Date(entry.createdAt).toLocaleString("en-GB", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </time>
      </div>

      {/* Exactly what the wall would show beside the message, right where
          the decision is made, so a bad name cannot ride on a kind message. */}
      {entry.consentToPublish ? (
        <p className="flex flex-wrap items-baseline gap-x-2 bg-background px-4 py-3 text-sm">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            {entry.status === "approved" ? "On the wall as" : "Would appear as"}
          </span>
          <span
            className={cn("font-bold wrap-anywhere", nameFlagged && "text-destructive")}
          >
            {entry.name ?? "Anonymous"}
          </span>
          {nameFlagged && (
            <span className={cn(chipClass, flaggedChipClass, "ml-auto")}>
              Name flagged
            </span>
          )}
        </p>
      ) : (
        entry.status !== "rejected" && (
          <p className="text-xs leading-relaxed text-muted-foreground">
            The visitor did not agree to publication, so this stays off the wall
            even if approved.
          </p>
        )
      )}

      <div className="flex flex-wrap gap-2">
        {entry.status !== "approved" && (
          <button
            type="button"
            disabled={busy}
            onClick={approve}
            className={cn(actionClass, "bg-primary text-primary-foreground")}
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            Approve
          </button>
        )}
        {entry.name !== null && (
          <button
            type="button"
            disabled={busy}
            onClick={approveWithoutName}
            className={cn(actionClass, "bg-background transition-colors hover:bg-surface-2")}
          >
            <UserX className="h-4 w-4" aria-hidden="true" />
            {entry.status === "approved" ? "Remove name" : "Approve without name"}
          </button>
        )}
        {entry.status === "approved" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onReview("pending")}
            className={cn(actionClass, "bg-background transition-colors hover:bg-surface-2")}
          >
            <EyeOff className="h-4 w-4" aria-hidden="true" />
            Unpublish
          </button>
        )}
        {entry.status !== "rejected" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onReview("rejected")}
            className={cn(actionClass, "bg-background transition-colors hover:bg-surface-2")}
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Reject
          </button>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={onDelete}
          aria-label="Delete entry"
          className={cn(
            actionClass,
            "ml-auto bg-background text-destructive transition-colors hover:bg-surface-2",
          )}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Delete
        </button>
      </div>
    </article>
  );
}
