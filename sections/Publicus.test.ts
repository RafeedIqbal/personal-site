import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function checkAccessibility(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
    .analyze();
  expect(violations).toEqual([]);
}

test("the top of the page is the title and a mission statement, without a metadata row or records", async ({ page }) => {
  await page.goto("/publicus");
  await expect(page.locator(".pu-masthead dl")).toHaveCount(0);
  const intro = page.locator(".pu-intro > p");
  await expect(intro).toContainText("every claim points back to the record");
  await expect(intro).not.toContainText("CanadaBuys");
  await expect(page.locator("main > .pu-records, #records")).toHaveCount(0);
});

test("the BaseNote entry covers Alchemy, with the demo video, its transcript and a screen gallery", async ({ page }) => {
  await page.goto("/publicus");
  const entry = page.locator("#basenote");
  await expect(entry.getByRole("heading", { level: 3 })).toHaveText("Bespoke fragrances, made fast, with no minimum order");
  await expect(entry).toContainText("Alchemy does the same job for manufacturers");
  const video = entry.locator("video");
  await expect(video).toHaveAttribute("poster", "/publicus/work/blend-alchemy-demo-poster.webp");
  await expect(video).toHaveAttribute("preload", "none");
  await expect(video.locator("source")).toHaveAttribute("src", "/publicus/work/blend-alchemy-demo.mp4");
  expect((await page.request.head("/publicus/work/blend-alchemy-demo.mp4")).status()).toBe(200);
  await entry.getByText("Transcript", { exact: true }).click();
  await expect(entry.locator(".pu-transcript h4")).toHaveText(["Blend · Customer", "Blend · Store staff", "Alchemy · Research", "Alchemy · Formulation", "Alchemy · Formula draft"]);

  const thumbs = entry.locator(".pu-gallery li a");
  await expect(thumbs).toHaveCount(6);
  await thumbs.first().click();
  await expect(page.getByRole("dialog", { name: /storefront/ })).toBeVisible();
  // The dialog's name follows the screen it shows, so step through it by its class.
  const lightbox = page.locator("dialog.pu-lightbox");
  await expect(lightbox.getByText("1 of 6")).toBeVisible();
  await checkAccessibility(page);
  await lightbox.getByRole("button", { name: "Next" }).click();
  await expect(lightbox.getByText("2 of 6")).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(lightbox.getByText("3 of 6")).toBeVisible();
  await expect(lightbox).toHaveAccessibleName(/Stock the agent draws from/);
  await page.keyboard.press("Escape");
  await expect(lightbox).toBeHidden();
  await expect(thumbs.nth(2)).toBeFocused();
});

test("Icon links to both app stores, and Work ends with a link to the portfolio", async ({ page }) => {
  await page.goto("/publicus");
  const icon = page.locator("#icon");
  await expect(icon.getByRole("link", { name: "Icon on the App Store" })).toHaveAttribute("href", "https://apps.apple.com/app/icon-training/id6755780488");
  await expect(icon.getByRole("link", { name: "Icon on Google Play" })).toHaveAttribute("href", "https://play.google.com/store/apps/details?id=app.icontraining.icon");
  await expect(page.locator("#work").getByRole("link", { name: "See more of my work on rafeed.dev" })).toHaveAttribute("href", "/");
});

test("the CanadaBuys rows open in a dialog from the explorer and from record links", async ({ page }) => {
  await page.goto("/publicus");
  // The explorer mounts as it approaches the viewport.
  await page.locator("#explorer").scrollIntoViewIfNeeded();
  const button = page.locator("#explorer").getByRole("button", { name: "CanadaBuys rows" });
  await button.click();
  const dialog = page.getByRole("dialog", { name: "CanadaBuys rows as published" });
  await expect(dialog.locator("tbody tr")).toHaveCount(10);
  await expect(dialog.getByRole("heading", { name: "Row 01, as published" })).toBeVisible();
  await expect(dialog.locator(".pu-raw mark")).toHaveCount(2);
  await checkAccessibility(page);
  await dialog.locator('tr[data-row="05"] button').click();
  await expect(dialog.getByRole("heading", { name: "Row 05, as published" })).toBeVisible();
  await expect(dialog.locator('tr[data-row="05"]')).toHaveClass(/is-active/);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(button).toBeFocused();

  await page.locator("#why").getByRole("link", { name: "this CanadaBuys award" }).click();
  await expect(dialog.getByRole("heading", { name: "Row 01, as published" })).toBeVisible();
  expect(new URL(page.url()).hash).toBe("");
  await page.keyboard.press("Escape");

  await page.goto("/publicus#cb-03");
  await expect(page.getByRole("dialog", { name: "CanadaBuys rows as published" }).getByRole("heading", { name: "Row 03, as published" })).toBeInViewport();
});

test("the chat's record source opens the records dialog", async ({ page }) => {
  await page.goto("/publicus");
  await page.locator("#explorer").scrollIntoViewIfNeeded();
  await expect(page.locator("#explorer").getByRole("button", { name: "CanadaBuys rows" })).toBeVisible();
  await page.getByRole("button", { name: "Ask a question" }).click();
  const chat = page.getByRole("dialog", { name: "Questions about this application" });
  await chat.getByRole("button", { name: "Why does row 1 show a $0.00 total?" }).click();
  await chat.getByRole("link", { name: "Record 01" }).click();
  await expect(page.getByRole("dialog", { name: "CanadaBuys rows as published" }).getByRole("heading", { name: "Row 01, as published" })).toBeVisible();
});

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
