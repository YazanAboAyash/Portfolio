/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  LayoutGrid,
  Loader2,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  AdminSessionResponse,
  AdminWorkspaceProps,
} from "@/types/main/admin";

export function AdminWorkspace({ children }: AdminWorkspaceProps) {
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/admin/session", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = (await response.json()) as AdminSessionResponse;
        setAuthenticated(response.ok && data.authenticated);
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setError("Unable to connect. Please try again.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setChecking(false);
      });
    return () => controller.abort();
  }, []);

  // Recheck expiry before mounting another tool or returning to a stale tab.
  useEffect(() => {
    if (!authenticated) return;
    const checkSession = () => {
      void fetch("/api/admin/session", { cache: "no-store" })
        .then(async (response) => {
          const data = (await response.json()) as AdminSessionResponse;
          if (!response.ok || !data.authenticated) setAuthenticated(false);
        })
        .catch(() => {});
    };
    checkSession();
    window.addEventListener("focus", checkSession);
    const interval = window.setInterval(checkSession, 60_000);
    return () => {
      window.removeEventListener("focus", checkSession);
      window.clearInterval(interval);
    };
  }, [authenticated, pathname]);

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!response.ok) {
        setError(
          response.status === 429
            ? "Too many attempts. Please try again in 15 minutes."
            : response.status === 401
              ? "The token is invalid. Please try again."
              : "Unable to connect. Please try again.",
        );
        return;
      }
      setToken("");
      setAuthenticated(true);
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/session", { method: "DELETE" });
      if (!response.ok) throw new Error();
      setAuthenticated(false);
      setToken("");
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (checking) {
    return (
      <div
        role="status"
        className="flex min-h-[60vh] items-center justify-center gap-3 text-muted-foreground"
      >
        <Loader2 className="size-5 animate-spin" aria-hidden="true" />
        Checking your session…
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="mx-auto flex min-h-[75vh] max-w-lg items-center px-5 py-16">
        <section
          className="w-full rounded-2xl border bg-card p-6 shadow-sm sm:p-10"
          aria-labelledby="admin-sign-in"
        >
          <div className="mb-8 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ShieldCheck className="size-6" aria-hidden="true" />
          </div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Portfolio administration
          </p>
          <h1
            id="admin-sign-in"
            className="text-3xl font-semibold tracking-tight"
          >
            Welcome back.
          </h1>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Sign in once to access all your admin tools.
          </p>
          <form
            onSubmit={(event) => void signIn(event)}
            className="mt-8 space-y-4"
          >
            <label htmlFor="admin-token" className="block text-sm font-medium">
              Admin token
            </label>
            <Input
              id="admin-token"
              type="password"
              autoComplete="current-password"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="Enter your admin token"
              disabled={busy}
              required
            />
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button
              type="submit"
              disabled={busy || !token.trim()}
              className="w-full"
            >
              {busy ? "Signing in…" : "Open workspace"}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Button>
          </form>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            View website
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-[75vh] bg-muted/20">
      <div className="border-y bg-background">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-3 font-semibold"
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <LayoutGrid className="size-4" aria-hidden="true" />
            </span>
            Admin workspace
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/">
                View website
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void signOut()}
              disabled={busy}
            >
              <LogOut className="size-4" aria-hidden="true" />
              Sign out
            </Button>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        {pathname !== "/admin" && (
          <Link
            href="/admin"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            All workspaces
          </Link>
        )}
        {error && (
          <p role="alert" className="mb-6 text-sm text-destructive">
            {error}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
