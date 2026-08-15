import { expect, test, type BrowserContext } from "@playwright/test";

const localeCookieName = "PORTFOLIOVERSIONLATEST_LOCALE";
const defaultBaseURL = "http://localhost:3000";
const publicRoutes = [
  "/",
  "/about",
  "/about-portfolio",
  "/services",
  "/projects",
  "/blog",
  "/rio-calculator",
  "/impressum",
  "/privacy",
] as const;

async function setLocaleCookie(
  context: BrowserContext,
  baseURL: string | undefined,
  locale: string,
) {
  await context.addCookies([
    {
      name: localeCookieName,
      value: locale,
      url: new URL("/", baseURL ?? defaultBaseURL).toString(),
    },
  ]);
}

test.describe("public pages", () => {
  test.beforeEach(async ({ context }, testInfo) => {
    await setLocaleCookie(context, testInfo.project.use.baseURL, "en");
  });

  for (const route of publicRoutes) {
    test(`loads ${route}`, async ({ page }) => {
      const response = await page.goto(route);

      expect(response, `${route} should return a response`).not.toBeNull();
      expect(response?.ok(), `${route} should load successfully`).toBe(true);
      await expect(page.locator("#main-content")).toBeVisible();
      await expect(page.locator("body")).not.toContainText(
        /Application error|This page could not be found/i,
      );
    });
  }
});
