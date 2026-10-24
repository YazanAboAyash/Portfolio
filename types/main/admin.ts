/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

export interface AdminStats {
  totalSubmissions: number;
  last24h: number;
  suspicious: number;
  blockedIPs: number;
  blockedEmails: number;
  topIPs: [string, number][];
}

export interface SuspiciousSubmission {
  ip: string;
  email: string;
  name: string;
  subject: string;
  message: string;
  timestamp: number;
  spamScore: number;
  suspicious: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiErrorResponse {
  message?: string;
  error?: string;
  details?: string[] | string;
}

export interface AdminApiResponse extends ApiResponse {
  data?: AdminStats | SuspiciousSubmission[];
}

export interface BlockAction {
  action: "block_ip" | "block_email";
  ip?: string;
  email?: string;
}

export interface AdminError {
  message: string;
  type: "AUTH_ERROR" | "NETWORK_ERROR" | "VALIDATION_ERROR" | "UNKNOWN_ERROR";
  details?: string;
}

export interface AdminState {
  isAuthenticated: boolean;
  token: string;
  stats: AdminStats | null;
  suspicious: SuspiciousSubmission[];
  lastRefresh: Date | null;
  error: AdminError | null;
  loading: boolean;
}

// Blog Admin Types
export interface BlogAdminStats {
  totalBlogs: number;
  publishedBlogs: number;
  draftBlogs: number;
  featuredBlogs: number;
  totalViews: number;
  recentActivity: BlogActivityItem[];
}

export interface BlogActivityItem {
  id: string;
  action: "created" | "updated" | "published" | "unpublished" | "deleted";
  blogTitle: string;
  blogSlug: string;
  timestamp: Date;
}

export interface BlogAdminAction {
  action:
    | "create"
    | "update"
    | "delete"
    | "publish"
    | "unpublish"
    | "feature"
    | "unfeature"
    | "logout";
  blogId?: string;
  data?: unknown;
}

export interface BlogAdminResponse extends ApiResponse {
  data?: unknown;
}
