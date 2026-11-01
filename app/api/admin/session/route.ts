/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import {
  clearAdminSessionCookie,
  hasValidAdminSession,
  revokeAdminSessions,
  setAdminSessionCookie,
} from "@/lib/admin-session";
import { adminAuthLimiter, getClientIP } from "@/lib/security";

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { authenticated: await hasValidAdminSession(request) },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: NextRequest) {
  if (
    request.headers.get("origin") !==
    `${request.nextUrl.protocol}//${request.headers.get("host")}`
  ) {
    return NextResponse.json({ authenticated: false }, { status: 403 });
  }
  const body: unknown = await request.json().catch(() => null);
  const token =
    body && typeof body === "object" && "token" in body ? body.token : null;
  const expected = process.env.ADMIN_TOKEN;
  if (typeof token !== "string" || !expected) {
    return NextResponse.json(
      { authenticated: false },
      {
        status: adminAuthLimiter.isAllowed(getClientIP(request)) ? 401 : 429,
      },
    );
  }
  const actualBytes = Buffer.from(token);
  const expectedBytes = Buffer.from(expected);
  if (
    actualBytes.length !== expectedBytes.length ||
    !timingSafeEqual(actualBytes, expectedBytes)
  ) {
    return NextResponse.json(
      { authenticated: false },
      {
        status: adminAuthLimiter.isAllowed(getClientIP(request)) ? 401 : 429,
      },
    );
  }

  const response = NextResponse.json({ authenticated: true });
  setAdminSessionCookie(response);
  return response;
}

export async function DELETE(request: NextRequest) {
  if (
    request.headers.get("origin") !==
    `${request.nextUrl.protocol}//${request.headers.get("host")}`
  ) {
    return NextResponse.json({ authenticated: false }, { status: 403 });
  }
  // Only a signed-in admin may end the sessions, or any visitor could keep
  // logging the admin out. Everyone else just has their own cookie cleared.
  if (await hasValidAdminSession(request)) {
    try {
      await revokeAdminSessions();
    } catch (error) {
      console.error("Admin session revocation failed:", error);
      const response = NextResponse.json(
        { authenticated: false, error: "Sessions could not be revoked" },
        { status: 500 },
      );
      clearAdminSessionCookie(response);
      return response;
    }
  }
  const response = NextResponse.json({ authenticated: false });
  clearAdminSessionCookie(response);
  return response;
}
