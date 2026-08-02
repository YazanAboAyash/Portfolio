/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Authentication } from "@/components/blog/dashboard";

import {
  MessageSquare,
  Clock,
  User,
  Bot,
  Search,
  Filter,
  Trash2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { ChatSessionLog } from "@/types/configs/chatbot";

export default function AdminChatLogsPage() {
  // Authentication state
  const [token, setToken] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState("");

  const [sessions, setSessions] = useState<ChatSessionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [consentFilter, setConsentFilter] = useState<"all" | "yes" | "no">(
    "all",
  );
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  // Authentication
  const authenticate = useCallback(async (): Promise<void> => {
    if (!token.trim()) {
      setAuthMessage("Please enter a valid token");
      return;
    }

    setAuthLoading(true);
    try {
      const response = await fetch("/api/admin/chatbot/logs?limit=1&offset=0", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setIsAuthenticated(true);
        setAuthMessage("Authenticated successfully!");
      } else {
        setAuthMessage("Authentication failed");
      }
    } catch {
      setAuthMessage("Authentication failed");
    } finally {
      setAuthLoading(false);
    }
  }, [token]);

  const handleKeyPress = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>): void => {
      if (event.key === "Enter" && !authLoading) {
        void authenticate();
      }
    },
    [authenticate, authLoading],
  );

  // Fetch chat logs
  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        limit: "50",
        offset: "0",
      });


      if (consentFilter !== "all") {
        params.append("hasConsent", consentFilter === "yes" ? "true" : "false");
      }

      const response = await fetch(`/api/admin/chatbot/logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch chat logs");
      }

      const data = (await response.json()) as {
        sessions: ChatSessionLog[];
        total: number;
        hasMore: boolean;
      };

      // Apply search filter client-side
      let filtered = data.sessions;
      if (searchQuery) {
        filtered = filtered.filter((session) =>
          session.messages?.some((msg) =>
            msg.content.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
        );
      }

      setSessions(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Delete session
  const deleteSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to delete this chat session?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/chatbot/logs?sessionId=${sessionId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete session");
      }

      // Refresh logs
      await fetchLogs();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete session");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      // Refetch on filter change. The rule flags any call reaching a setState,
      // without distinguishing awaits; fetchLogs' synchronous setLoading(true)
      // and setError(null) both match the initial state on mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void fetchLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consentFilter, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <Authentication
        token={token}
        setToken={setToken}
        onAuthenticate={() => void authenticate()}
        onKeyPress={handleKeyPress}
        loading={authLoading}
        message={authMessage}
      />
    );
  }

  return (
    <div className="min-h-screen p-6 mt-20">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <MessageSquare className="w-8 h-8" />
              ChatBot Logs
            </h1>
            <p className="text-muted-foreground mt-1">
              View and manage chat conversations
            </p>
          </div>
          <Button onClick={() => void fetchLogs()} variant="outline">
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search Messages</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search in messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void fetchLogs();
                    }}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">User Consent</label>
                <select
                  className="w-full h-10 px-3 border rounded-md"
                  value={consentFilter}
                  onChange={(e) =>
                    setConsentFilter(e.target.value as "all" | "yes" | "no")
                  }
                >
                  <option value="all">All</option>
                  <option value="yes">Consented</option>
                  <option value="no">Not Consented</option>
                </select>
              </div>
            </div>

            <Button onClick={() => void fetchLogs()} className="w-full">
              Apply Filters
            </Button>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Loading chat logs...
              </p>
            </CardContent>
          </Card>
        )}

        {/* Sessions List */}
        {!loading && !error && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {sessions.length} Session{sessions.length !== 1 ? "s" : ""}{" "}
                Found
              </h2>
            </div>

            {sessions.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No chat sessions found. Try adjusting your filters.
                </CardContent>
              </Card>
            )}

            {sessions.map((session) => (
              <Card key={session.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="font-mono text-xs">
                          {session.id}
                        </Badge>
                        {session.consentGiven ? (
                          <Badge
                            variant="default"
                            className="bg-green-500 hover:bg-green-600"
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Consented
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="w-3 h-3 mr-1" />
                            No Consent
                          </Badge>
                        )}
                        {session.isActive && (
                          <Badge variant="secondary">Active</Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>
                            {new Date(session.startedAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-muted-foreground" />
                          <span>{session.totalMessages} messages</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setSelectedSession(
                            selectedSession === session.id ? null : session.id,
                          )
                        }
                      >
                        {selectedSession === session.id ? "Hide" : "View"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => void deleteSession(session.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                {selectedSession === session.id && session.messages && (
                  <CardContent className="pt-6">
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {session.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex gap-3 p-3 rounded-lg ${
                            msg.role === "user"
                              ? "bg-blue-50 dark:bg-blue-950/20"
                              : "bg-green-50 dark:bg-green-950/20"
                          }`}
                        >
                          <div className="shrink-0">
                            {msg.role === "user" ? (
                              <User className="w-5 h-5" />
                            ) : (
                              <Bot className="w-5 h-5" />
                            )}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="font-medium">
                                {msg.role === "user" ? "User" : "Assistant"}
                              </span>
                              <span>•</span>
                              <span>
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap wrap-break-word">
                              {msg.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
