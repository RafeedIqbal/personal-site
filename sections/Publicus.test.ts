import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function checkAccessibility(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
    .analyze();
  expect(violations).toEqual([]);
}

test("the explorer blurb covers how it works, the architecture and the stack", async ({ page }) => {
  await page.goto("/publicus");
  const build = page.locator("#explorer .pu-build");
  await expect(build.locator("dt")).toHaveText(["How it works", "Architecture", "Stack"]);
  await expect(build.getByRole("list", { name: "Request path" }).getByRole("listitem")).toHaveText(["browser", "publicus-api", "Postgres job queue", "publicus-worker", "Gemini"]);
  await expect(page.locator("#explorer-title + p")).toContainText("the qualification checks, flags and explanations change with it");
});

test("the model eval shows both result tables with one chosen setting each", async ({ page }) => {
  await page.goto("/publicus");
  const figure = page.locator("figure#models");
  await expect(figure.getByRole("heading", { level: 3 })).toContainText("runs the chat");
  const tables = figure.getByRole("table");
  await expect(tables).toHaveCount(2);
  for (const table of await tables.all()) {
    expect(await table.locator("tbody tr").count()).toBeGreaterThanOrEqual(5);
    await expect(table.locator("tbody tr.is-chosen")).toHaveCount(1);
    await expect(table.locator("tbody tr.is-chosen")).toContainText("In use");
    await expect(table.locator("tbody tr", { hasText: "Eval pick" })).toHaveCount(1);
  }
  await expect(page.locator("#explorer .pu-build").getByRole("link", { name: "model eval below the explorer" })).toHaveAttribute("href", "#models");
  await checkAccessibility(page);
});

test("the help chat answers suggested questions without a backend and returns focus", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/publicus");
  const launcher = page.getByRole("button", { name: "Ask a question" });
  await launcher.click();
  const chat = page.getByRole("dialog", { name: "Questions about this application" });
  await expect(chat).toBeVisible();
  // CI has no Supabase keys, so typed questions are off and the email fallback shows.
  await expect(chat.getByText("Typed questions aren’t available right now.")).toBeVisible();
  await expect(chat.getByRole("textbox", { name: "Your question" })).toHaveCount(0);
  await checkAccessibility(page);

  await chat.getByRole("button", { name: "Why does row 1 show a $0.00 total?" }).click();
  const log = chat.getByRole("log", { name: "Conversation" });
  await expect(log).toContainText("$1,073,002.14");
  await expect(log.getByRole("link", { name: "Record 01" })).toHaveAttribute("href", "#cb-01");
  await expect(chat.getByRole("button", { name: "Why does row 1 show a $0.00 total?" })).toHaveCount(0);
  await checkAccessibility(page);

  await page.keyboard.press("Escape");
  await expect(chat).toBeHidden();
  await expect(launcher).toBeFocused();
  await launcher.click();
  await expect(log).toContainText("$1,073,002.14");
  await chat.getByRole("button", { name: "Start over" }).click();
  await expect(log.locator("li")).toHaveCount(0);
  await chat.getByRole("button", { name: "Close questions" }).click();
  await expect(launcher).toBeFocused();
  expect(errors).toEqual([]);
});

for (const width of [320, 390, 1440]) {
  test(`the page and the open chat fit a ${width}px screen`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/publicus");
    await page.getByRole("button", { name: "Ask a question" }).click();
    const chat = page.getByRole("dialog", { name: "Questions about this application" });
    await expect(chat).toBeVisible();
    const box = await chat.boundingBox();
    expect(box && box.x >= 0 && box.x + box.width <= width).toBe(true);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}
