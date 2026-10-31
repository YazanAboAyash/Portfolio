/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import { createHmac } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const locales = ["en", "de", "es", "fr", "sv"];

async function mockWorkspace(page: Page) {
  await page.route("**/api/admin/session", (route) =>
    route.fulfill({ json: { authenticated: true } }),
  );
  await page.route("**/api/admin/blog?**", (route) => {
    const action = new URL(route.request().url()).searchParams.get("action");
    const data =
      action === "stats"
        ? {
            totalBlogs: 0,
            publishedBlogs: 0,
            draftBlogs: 0,
            featuredBlogs: 0,
            totalViews: 0,
            recentActivity: [],
          }
        : action === "categories"
          ? []
          : { blogs: [], pagination: null };
    return route.fulfill({ json: { success: true, data } });
  });
  await page.route("**/api/admin/chatbot/logs?**", (route) =>
    route.fulfill({ json: { sessions: [], total: 0, hasMore: false } }),
  );
}

test.beforeEach(async ({ context, baseURL }) => {
  await context.addInitScript(() => {
    localStorage.setItem("locale-detection-done", "true");
    localStorage.setItem("cookie-consent", "declined");
  });
  await context.addCookies([
    {
      name: "PORTFOLIOVERSIONLATEST_LOCALE",
      value: "en",
      url: baseURL ?? "http://localhost:3000",
    },
  ]);
});

test("direct tool visits share the admin sign-in", async ({ page }) => {
  for (const path of ["/admin", "/admin/blog", "/admin/chatbot"]) {
    await page.goto(path);
    await expect(
      page.getByRole("heading", { name: "Welcome back." }),
    ).toBeVisible();
    await expect(page.getByLabel("Admin token")).toHaveAttribute(
      "type",
      "password",
    );
    await expect(
      page.getByRole("button", { name: "Open workspace" }),
    ).toBeDisabled();
  }
});

test("hub cards open both tools and return to the hub", async ({ page }) => {
  await mockWorkspace(page);
  await page.goto("/admin");
  await page.getByRole("link", { name: /Manage blog/ }).click();
  await expect(page).toHaveURL(/\/admin\/blog$/);
  await expect(page.getByRole("button", { name: "New article" })).toBeVisible();
  await page.getByRole("link", { name: "All workspaces" }).click();
  await page.getByRole("link", { name: /Review conversations/ }).click();
  await expect(page).toHaveURL(/\/admin\/chatbot$/);
  await expect(
    page.getByRole("heading", { name: "No conversations found" }),
  ).toBeVisible();
  await page.getByLabel("Search messages", { exact: true }).fill("hello");
  await page.getByLabel("Visitor consent").selectOption("yes");
  const filteredRequest = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return (
      url.pathname === "/api/admin/chatbot/logs" &&
      url.searchParams.get("searchQuery") === "hello" &&
      url.searchParams.get("hasConsent") === "true"
    );
  });
  await page.getByRole("button", { name: "Apply filters" }).click();
  await filteredRequest;
  await page.getByRole("link", { name: "All workspaces" }).click();
  await expect(
    page.getByRole("heading", { name: "Your control room." }),
  ).toBeVisible();
});

test("chat messages expand and pagination requests the next page", async ({
  page,
}) => {
  await mockWorkspace(page);
  await page.route("**/api/admin/chatbot/logs?**", (route) =>
    route.fulfill({
      json: {
        sessions: [
          {
            id: "test-session",
            consentGiven: true,
            isActive: false,
            startedAt: "2026-10-01T12:00:00Z",
            totalMessages: 1,
            messages: [
              {
                id: "test-message",
                role: "user",
                timestamp: "2026-10-01T12:00:00Z",
                content: "Test conversation content",
              },
            ],
          },
        ],
        total: 21,
        hasMore:
          new URL(route.request().url()).searchParams.get("offset") === "0",
      },
    }),
  );
  await page.goto("/admin/chatbot");
  await page.getByRole("button", { name: "View messages" }).click();
  await expect(page.getByText("Test conversation content")).toBeVisible();
  await page.getByRole("button", { name: "Hide messages" }).click();
  await expect(page.getByText("Test conversation content")).toBeHidden();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByText("Page 2", { exact: true })).toBeVisible();
});

for (const locale of locales) {
  test(`admin hub stays English and fits a mobile viewport with ${locale} selected`, async ({
    page,
    context,
    baseURL,
  }, testInfo) => {
    await context.addCookies([
      {
        name: "PORTFOLIOVERSIONLATEST_LOCALE",
        value: locale,
        url: baseURL ?? "http://localhost:3000",
      },
    ]);
    await mockWorkspace(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/admin");
    await expect(
      page.getByRole("heading", { name: "Your control room." }),
    ).toBeVisible();
    await expect(page.locator('a[href="/admin/blog"]')).toBeVisible();
    await expect(page.locator('a[href="/admin/chatbot"]')).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    const accessibility = await new AxeBuilder({ page })
      .include("#main-content")
      .analyze();
    expect(accessibility.violations).toEqual([]);
    if (locale === "en") {
      await page.screenshot({
        path: testInfo.outputPath("hub-mobile.png"),
        fullPage: true,
      });
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.screenshot({
        path: testInfo.outputPath("hub-desktop.png"),
        fullPage: true,
      });
    }
  });
}

test("admin APIs reject unauthenticated access", async ({ request }) => {
  expect([401, 429]).toContain(
    (await request.get("/api/admin/blog?action=unsupported")).status(),
  );
  expect([401, 429]).toContain(
    (await request.delete("/api/admin/chatbot/logs")).status(),
  );
  expect(await (await request.get("/api/admin/session")).json()).toEqual({
    authenticated: false,
  });
});

test("real session persists through reload and is removed on sign-out", async ({
  page,
  context,
}) => {
  test.skip(
    !process.env.ADMIN_E2E_TOKEN,
    "Requires a local server started with an isolated ADMIN_TOKEN matching ADMIN_E2E_TOKEN.",
  );
  await page.goto("/admin");
  await page.getByLabel("Admin token").fill(process.env.ADMIN_E2E_TOKEN!);
  await page.getByRole("button", { name: "Open workspace" }).click();
  await expect(
    page.getByRole("heading", { name: "Your control room." }),
  ).toBeVisible();
  const cookie = (await context.cookies()).find(
    (item) => item.name === "PORTFOLIO_ADMIN_SESSION",
  );
  expect(cookie?.httpOnly).toBe(true);
  expect(cookie?.sameSite).toBe("Strict");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Your control room." }),
  ).toBeVisible();
  // API discovery and input validation prove session acceptance without querying data.
  const blog = await context.request.get("/api/admin/blog?action=unsupported");
  expect(blog.status()).toBe(200);
  expect(await blog.json()).toHaveProperty("message", "Blog Admin API");
  expect(
    (await context.request.delete("/api/admin/chatbot/logs")).status(),
  ).toBe(400);
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(
    page.getByRole("heading", { name: "Welcome back." }),
  ).toBeVisible();
  expect(
    await (await context.request.get("/api/admin/session")).json(),
  ).toEqual({ authenticated: false });
});

test("expired and malformed cookies and cross-origin sign-in are rejected", async ({
  request,
  baseURL,
}) => {
  test.skip(
    !process.env.ADMIN_E2E_TOKEN,
    "Requires an isolated local admin token.",
  );
  const payload = `${"a".repeat(64)}.${Date.now() - 1_000}`;
  const signature = createHmac("sha256", process.env.ADMIN_E2E_TOKEN!)
    .update(payload)
    .digest("hex");
  for (const value of [
    `${payload}.${signature}`,
    `${payload}.${signature}xx`,
    "invalid",
  ]) {
    const response = await request.get("/api/admin/session", {
      headers: { Cookie: `PORTFOLIO_ADMIN_SESSION=${value}` },
    });
    expect(await response.json()).toEqual({ authenticated: false });
  }
  const foreign = await request.post("/api/admin/session", {
    headers: { Origin: "https://other.example" },
    data: { token: process.env.ADMIN_E2E_TOKEN },
  });
  expect(foreign.status()).toBe(403);
  const invalid = await request.post("/api/admin/session", {
    headers: { Origin: new URL(baseURL ?? "http://localhost:3000").origin },
    data: { token: "invalid-token" },
  });
  expect([401, 429]).toContain(invalid.status());
  for (let attempt = 0; attempt < 5; attempt++) {
    await request.post("/api/admin/session", {
      headers: { Origin: new URL(baseURL ?? "http://localhost:3000").origin },
      data: { token: "invalid-token" },
    });
  }
  const limited = await request.post("/api/admin/session", {
    headers: { Origin: new URL(baseURL ?? "http://localhost:3000").origin },
    data: { token: "invalid-token" },
  });
  expect(limited.status()).toBe(429);
  // Failed guesses must never lock out the owner with the valid token.
  const valid = await request.post("/api/admin/session", {
    headers: { Origin: new URL(baseURL ?? "http://localhost:3000").origin },
    data: { token: process.env.ADMIN_E2E_TOKEN },
  });
  expect(valid.status()).toBe(200);
  await request.delete("/api/admin/session", {
    headers: { Origin: new URL(baseURL ?? "http://localhost:3000").origin },
  });
});
