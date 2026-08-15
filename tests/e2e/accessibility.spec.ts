import AxeBuilder from "@axe-core/playwright";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import enMessages from "../../messages/en.json";
import type { BlogListResponse } from "../../types/hubs/blogs";

const localeCookieName = "PORTFOLIOVERSIONLATEST_LOCALE";
const browserLanguageCookieName = "PORTFOLIOVERSIONLATEST_BROWSER_LANG";
const defaultBaseURL = "http://localhost:3000";

const accessibilityRoutes = [
  { label: "home page", path: "/" },
  { label: "about page", path: "/about" },
  { label: "about portfolio page", path: "/about-portfolio" },
  { label: "services page", path: "/services" },
  { label: "project cards", path: "/projects" },
  { label: "blog list", path: "/blog" },
  { label: "ROI calculator", path: "/rio-calculator" },
  { label: "booking confirmation page", path: "/booking-confirmed" },
  { label: "impressum page", path: "/impressum" },
  { label: "privacy page", path: "/privacy" },
] as const;

const adminAuthenticationRoutes = [
  { label: "admin blog authentication form", path: "/admin/blog" },
  { label: "admin chatbot authentication form", path: "/admin/chatbot" },
] as const;

async function setEnglishLocale(
  context: BrowserContext,
  baseURL: string | undefined,
) {
  const url = new URL("/", baseURL ?? defaultBaseURL).toString();

  await context.addCookies([
    {
      name: localeCookieName,
      value: "en",
      url,
    },
    {
      name: browserLanguageCookieName,
      value: "en",
      url,
    },
  ]);
}

async function hideCookieBanner(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("cookie-consent", "accepted");
    window.sessionStorage.setItem("locale-detection-done", "true");
  });
}

async function expectNoAccessibilityViolations(page: Page, include?: string) {
  const builder = new AxeBuilder({ page }).withTags([
    "wcag2a",
    "wcag2aa",
    "wcag21a",
    "wcag21aa",
  ]);

  if (include) {
    builder.include(include);
  }

  const results = await builder.analyze();
  const violations = results.violations;
  const violationSummary = violations
    .map((violation) => {
      const targets = violation.nodes
        .map((node) => node.target.join(", "))
        .join("; ");

      return `${violation.id}: ${violation.help} (${targets})`;
    })
    .join("\n");

  expect(violations, violationSummary).toHaveLength(0);
}

test.describe("accessibility", () => {
  test.beforeEach(async ({ context, page }, testInfo) => {
    await setEnglishLocale(context, testInfo.project.use.baseURL);
    await hideCookieBanner(page);
  });

  for (const route of accessibilityRoutes) {
    test(`${route.label} has no detected WCAG violations`, async ({ page }) => {
      const response = await page.goto(route.path);

      expect(response, `${route.path} should return a response`).not.toBeNull();
      expect(response?.ok(), `${route.path} should load successfully`).toBe(
        true,
      );
      await expect(page.locator("#main-content")).toBeVisible();

      await expectNoAccessibilityViolations(page);
    });
  }

  test("first published blog detail has no detected WCAG violations", async ({
    page,
    request,
  }) => {
    const response = await request.get("/api/blog?limit=1");

    test.skip(!response.ok(), "Blog API is unavailable in this environment.");

    const data = (await response.json()) as BlogListResponse;
    const blog = data.blogs.find((candidate) => Boolean(candidate.slug));

    if (!blog?.slug) {
      test.skip(true, "No published blog posts are available to scan.");
      return;
    }

    const blogResponse = await page.goto(`/blog/${blog.slug}`);

    expect(blogResponse, "Blog detail should return a response").not.toBeNull();
    expect(blogResponse?.ok(), "Blog detail should load successfully").toBe(
      true,
    );
    await expect(page.locator("#main-content")).toBeVisible();

    await expectNoAccessibilityViolations(page);
  });

  test("chatbot dialog has no detected WCAG violations", async ({ page }) => {
    await page.goto("/");
    const openAssistantButton = page.getByRole("button", {
      name: enMessages.ChatBot.openAssistant,
    });

    await expect(openAssistantButton).toBeVisible({ timeout: 6_000 });
    await openAssistantButton.evaluate((element) => {
      if (element instanceof HTMLButtonElement) {
        element.click();
      }
    });
    await expect(page.getByRole("dialog")).toBeVisible();

    await expectNoAccessibilityViolations(page, '[role="dialog"]');
  });

  for (const route of adminAuthenticationRoutes) {
    test(`${route.label} has no detected WCAG violations`, async ({ page }) => {
      const response = await page.goto(route.path);

      expect(response, `${route.path} should return a response`).not.toBeNull();
      expect(response?.ok(), `${route.path} should load successfully`).toBe(
        true,
      );
      await expect(page.getByLabel("Admin Token")).toBeVisible();

      await expectNoAccessibilityViolations(page);
    });
  }
});
