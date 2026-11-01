/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/configs/prisma";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

const COOKIE_NAME = "PORTFOLIO_ADMIN_SESSION";
const SESSION_MAX_AGE_MS = 2 * 60 * 60 * 1000;
// Signed into every cookie, so cookies from the older {id}.{expiresAt} format
// stop verifying instead of being read with the new meaning.
const PAYLOAD_VERSION = "v2";

function sign(payload: string): string {
  return createHmac("sha256", ADMIN_TOKEN || "")
    .update(`${PAYLOAD_VERSION}.${payload}`)
    .digest("hex");
}

/**
 * The issue time of a correctly signed, unexpired session cookie, or null.
 * Cookie format: `{sessionId}.{issuedAt}.{hmac}`.
 */
function verifiedIssuedAt(request: NextRequest): number | null {
  if (!ADMIN_TOKEN) return null;

  const value = request.cookies.get(COOKIE_NAME)?.value;
  const [sessionId, issuedAtStr, sig, ...rest] = value?.split(".") ?? [];
  if (!sessionId || !issuedAtStr || !sig || rest.length > 0) return null;
  if (!/^[a-f0-9]{64}$/.test(sessionId) || !/^[a-f0-9]{64}$/.test(sig)) return null;
  if (!/^\d+$/.test(issuedAtStr)) return null;

  const sigBuf = Buffer.from(sig, "hex");
  const expectedBuf = Buffer.from(sign(`${sessionId}.${issuedAtStr}`), "hex");
  if (!timingSafeEqual(sigBuf, expectedBuf)) return null;

  const issuedAt = Number(issuedAtStr);
  const now = Date.now();
  // A minute of slack for clock differences between serverless instances
  if (!Number.isSafeInteger(issuedAt) || issuedAt > now + 60_000) return null;
  if (now >= issuedAt + SESSION_MAX_AGE_MS) return null;
  return issuedAt;
}

/**
 * Whether the request carries a valid admin session: signed, unexpired, and
 * issued after the last logout. Fails closed when the revocation state can't
 * be read, so a database outage never turns a revoked cookie back on.
 */
export async function hasValidAdminSession(
  request: NextRequest,
): Promise<boolean> {
  const issuedAt = verifiedIssuedAt(request);
  if (issuedAt === null) return false;

  try {
    const state = await prisma.adminAuthState.findUnique({
      where: { id: 1 },
      select: { sessionsValidAfter: true },
    });
    return !state || issuedAt > state.sessionsValidAfter.getTime();
  } catch (error) {
    console.error("Admin session revocation check failed:", error);
    return false;
  }
}

export function setAdminSessionCookie(response: NextResponse): void {
  const payload = `${randomBytes(32).toString("hex")}.${Date.now()}`;
  response.cookies.set(COOKIE_NAME, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: SESSION_MAX_AGE_MS / 1000,
    path: "/",
  });
}

export function clearAdminSessionCookie(response: NextResponse): void {
  response.cookies.delete(COOKIE_NAME);
}

/** Ends every admin session issued until now, on every device. */
export async function revokeAdminSessions(): Promise<void> {
  const now = new Date();
  await prisma.adminAuthState.upsert({
    where: { id: 1 },
    create: { id: 1, sessionsValidAfter: now },
    update: { sessionsValidAfter: now },
  });
}
