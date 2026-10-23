/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

export interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiEndpoints {
  stats: string;
  suspicious: string;
}

export interface ContactApiResponse {
  message?: string;
  endpoints?: ApiEndpoints;
  success?: boolean;
  data?: unknown;
}

export interface BlockActionRequest {
  action: "block_ip" | "block_email";
  ip?: string;
  email?: string;
}

export interface BlockActionResponse {
  message: string;
}

export interface ApiErrorResponse {
  error: string;
}

export interface ContactAdminRequest {
  action: string;
  ip?: string;
  email?: string;
}