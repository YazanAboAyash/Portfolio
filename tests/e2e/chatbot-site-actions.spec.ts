import { expect, test, type Page } from "@playwright/test";

/**
 * Reem's site actions, against a faked /api/chatbot stream: no model call, so
 * these run without CHATBOT_ENABLED or an OpenAI key and always see the same
 * tool calls. What is under test is the browser side — the route's own
 * validation is covered by its zod schemas.
 */

const localeCookieName = "PORTFOLIOVERSIONLATEST_LOCALE";
const defaultBaseURL = "http://localhost:3000";

interface FakeToolCall {
  toolName: string;
  input: Record<string, string>;
}

/** A UI message stream for one turn: the tool calls, then a short reply. */
function uiMessageStream(calls: FakeToolCall[], reply: string): string {
  const chunks: unknown[] = [
    { type: "start", messageId: `msg_${Date.now()}` },
    { type: "start-step" },
  ];
  calls.forEach((call, index) => {
    const toolCallId = `call_${index}`;
    chunks.push(
      { type: "tool-input-available", toolCallId, ...call },
      { type: "tool-output-available", toolCallId, output: { ok: true } },
    );
  });
  chunks.push(
    { type: "finish-step" },
    { type: "start-step" },
    { type: "text-start", id: "text_0" },
    { type: "text-delta", id: "text_0", delta: reply },
    { type: "text-end", id: "text_0" },
    { type: "finish-step" },
    { type: "finish" },
  );

  return (
    chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join("") +
    "data: [DONE]\n\n"
  );
}

/** Answers every chat request with the given turn; returns a request counter. */
async function fakeChat(page: Page, calls: FakeToolCall[], reply = "Done.") {
  const requests = { count: 0 };
  await page.route("**/api/chatbot", async (route) => {
    if (route.request().method() !== "POST") return route.fallback();
    requests.count++;
    await route.fulfill({
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "x-vercel-ai-ui-message-stream": "v1",
      },
      body: uiMessageStream(calls, reply),
    });
  });
  return requests;
}

async function ask(page: Page, text: string) {
  await page.getByTitle("Open Reem AI assistant").click();
  await page.getByPlaceholder("Ask Reem anything…").fill(text);
  await page.keyboard.press("Enter");
}

const actionChips = (page: Page) =>
  page.getByRole("list", { name: "Done on the site" }).getByRole("listitem");

test.beforeEach(async ({ context }, testInfo) => {
  const baseURL = testInfo.project.use.baseURL ?? defaultBaseURL;
  await context.addCookies([
    { name: localeCookieName, value: "en", url: baseURL },
  ]);
  // Skip the cookie banner and the chat's logging prompt
  await context.addInitScript(() => {
    localStorage.setItem("cookie-consent", "declined");
    localStorage.setItem("chatbot_consent", "false");
  });
});

test.describe("Reem site actions", () => {
  test("switches the theme and labels the chip", async ({ page }) => {
    await fakeChat(page, [{ toolName: "set_theme", input: { theme: "dark" } }]);
    await page.goto("/about");

    await ask(page, "dark mode please");

    await expect(page.locator("html")).toHaveClass(/\bdark\b/);
    await expect(actionChips(page)).toHaveText(["Switched to dark mode"]);
    // Theme changes keep the panel open
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("highlights the right card when project ids collide", async ({
    page,
  }) => {
    // beRich.Hub v5 shares id 2 with the LogiX product
    await fakeChat(page, [
      { toolName: "highlight_project", input: { title: "beRich.Hub v5" } },
    ]);
    await page.goto("/about");

    await ask(page, "show me beRich.Hub");

    await expect.poll(() => new URL(page.url()).pathname).toBe("/projects");
    await expect(page.locator("#work-project-2")).toHaveAttribute(
      "data-highlighted",
      "",
    );
    await expect(page.locator("#work-product-2")).not.toHaveAttribute(
      "data-highlighted",
    );
    await expect(actionChips(page)).toHaveText(["Showed beRich.Hub v5"]);
  });

  test("does not replay actions from a restored transcript", async ({
    page,
  }) => {
    const requests = await fakeChat(page, [
      { toolName: "navigate", input: { href: "/blog" } },
    ]);
    await page.goto("/about");
    await ask(page, "take me to the blog");
    await expect.poll(() => new URL(page.url()).pathname).toBe("/blog");
    await expect(actionChips(page)).toHaveText(["Opened Blog"]);

    await page.goto("/about");
    await page.getByTitle("Open Reem AI assistant").click();

    // The chip is restored, so the transcript is back, yet nothing moved
    await expect(actionChips(page)).toHaveText(["Opened Blog"]);
    expect(new URL(page.url()).pathname).toBe("/about");
    expect(requests.count).toBe(1);
  });

  test("ignores input outside the allowlist", async ({ page }) => {
    await fakeChat(
      page,
      [{ toolName: "navigate", input: { href: "https://example.com" } }],
      "Not going there.",
    );
    await page.goto("/about");

    await ask(page, "go somewhere else");

    // onToolCall runs before the reply text arrives, so by now it has run
    await expect(page.getByText("Not going there.")).toBeVisible();
    expect(new URL(page.url()).pathname).toBe("/about");
    await expect(actionChips(page)).toHaveText(["Site action"]);
  });

  test("switches the language in place", async ({ page }) => {
    await fakeChat(page, [
      { toolName: "set_language", input: { locale: "de" } },
    ]);
    await page.goto("/about");

    await ask(page, "switch the site to German");

    await expect(page.locator("html")).toHaveAttribute("lang", "de");
    // Still the same open panel, now in German, with the conversation in it
    await expect(page.getByPlaceholder("Fragen Sie Reem…")).toBeVisible();
    await expect(page.getByRole("log")).toContainText(
      "switch the site to German",
    );
    await expect(
      page
        .getByRole("list", { name: "Auf der Seite erledigt" })
        .getByRole("listitem"),
    ).toHaveText(["Sprache: Deutsch"]);
  });
});

test.describe("Reem site actions on phones", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("closes the full-screen panel and leaves a hint", async ({ page }) => {
    await fakeChat(page, [
      { toolName: "scroll_to_section", input: { section: "cert" } },
    ]);
    await page.goto("/about");

    await ask(page, "take me to the certifications");

    await expect.poll(() => new URL(page.url()).hash).toBe("#cert");
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(
      page.getByRole("status").filter({ hasText: "Reem moved you here" }),
    ).toBeVisible();

    // The page's own scroll to #cert must not slide the launcher away
    const launcher = page.getByTitle("Open Reem AI assistant");
    await expect(launcher).toBeInViewport();
    await page.waitForTimeout(2500);
    await expect(launcher).toBeInViewport();

    await launcher.click();
    await expect(actionChips(page)).toHaveText(["Jumped to Certifications"]);
  });
});
