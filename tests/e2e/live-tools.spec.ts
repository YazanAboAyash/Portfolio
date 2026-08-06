import { expect, test, type BrowserContext } from "@playwright/test";
import enMessages from "../../messages/en.json";

const localeCookieName = "PORTFOLIOVERSIONLATEST_LOCALE";
const defaultBaseURL = "http://localhost:3000";

async function setEnglishLocale(
  context: BrowserContext,
  baseURL: string | undefined,
) {
  await context.addCookies([
    {
      name: localeCookieName,
      value: "en",
      url: new URL("/", baseURL ?? defaultBaseURL).toString(),
    },
  ]);
}

test.describe("live tools", () => {
  test.beforeEach(async ({ context }, testInfo) => {
    await setEnglishLocale(context, testInfo.project.use.baseURL);
  });

  test("updates the ROI calculator when inputs change", async ({ page }) => {
    await page.goto("/rio-calculator");

    await expect(
      page.getByRole("heading", { name: enMessages.LiveTools.rio.title }),
    ).toBeVisible();

    const hoursInput = page.getByLabel(
      enMessages.LiveTools.rio.inputs.hoursPerWeek,
    );

    await hoursInput.click();
    await hoursInput.press("Control+A");
    await hoursInput.pressSequentially("10");

    await expect(page.getByText(/23\.400/)).toBeVisible();
  });

  test("enables email analysis only after text is entered", async ({
    page,
  }) => {
    await page.route("/api/email-rewrite/remaining", (route) =>
      route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ remaining: 10 }),
      }),
    );

    await page.goto("/polite-email");

    await expect(
      page.getByText("Email Assistant", { exact: true }),
    ).toBeVisible();

    const submitButton = page.getByRole("button", {
      name: "Analyze & Generate Replies",
    });

    await expect(submitButton).toBeDisabled();
    await page
      .getByLabel("Email to Analyze")
      .fill("Hello, can you send the invoice when you have a moment?");
    await expect(submitButton).toBeEnabled();
  });
});
