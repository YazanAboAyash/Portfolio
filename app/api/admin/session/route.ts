/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminSession, hasValidAdminSession } from "@/proxy";
import { adminAuthLimiter, getClientIP } from "@/lib/security";

export function GET(request: NextRequest) {
  return NextResponse.json(
    { authenticated: hasValidAdminSession(request) },
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
  response.cookies.set("PORTFOLIO_ADMIN_SESSION", createAdminSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 8,
    path: "/",
  });
  return response;
}

export function DELETE(request: NextRequest) {
  if (
    request.headers.get("origin") !==
    `${request.nextUrl.protocol}//${request.headers.get("host")}`
  ) {
    return NextResponse.json({ authenticated: false }, { status: 403 });
  }
  const response = NextResponse.json({ authenticated: false });
  response.cookies.delete("PORTFOLIO_ADMIN_SESSION");
  return response;
}
