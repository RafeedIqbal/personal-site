import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function checkAccessibility(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
    .analyze();
  expect(violations).toEqual([]);
}

// /publicus is offline (the route lives in app/_publicus, which Next does not build).
test.skip(() => true, "/publicus is offline");

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
  // The dialog's close event is asynchronous; wait for it so it can't close the next one.
  await expect(dialog).toBeHidden();

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

// The explorer mounts as it approaches the viewport, and opens on its setup screen until a visitor finishes or skips it.
async function openExplorer(page: Page) {
  const shell = page.locator(".px-shell");
  // The explorer can replace its placeholder mid-scroll, so scroll whichever is there until the explorer shows.
  await expect(async () => {
    await page.locator("#explorer .pu-demo-loading, #explorer .px-shell").first().scrollIntoViewIfNeeded({ timeout: 1000 });
    await expect(shell).toBeVisible({ timeout: 1000 });
  }).toPass();
  return shell;
}

test("the explorer opens on a setup screen that shows everything it does", async ({ page }) => {
  await page.goto("/publicus");
  const shell = await openExplorer(page);
  await expect(shell.getByRole("heading", { name: "Try it as a vendor or as a public buyer" })).toBeVisible();
  await expect(shell.locator(".px-features li strong")).toHaveText(["For vendors", "Requirement checks", "For government", "Sources & imports", "Data problems"]);
  await expect(shell.getByRole("tablist")).toHaveCount(0);
  await expect(shell.getByRole("button", { name: "CanadaBuys rows" })).toBeVisible();
  await checkAccessibility(page);
});

test("a vendor setup ranks the sample for that company, then the tour walks through it", async ({ page }) => {
  await page.goto("/publicus");
  const shell = await openExplorer(page);
  await shell.getByRole("button", { name: /I sell to government/ }).click();
  await expect(shell.getByRole("heading", { name: "Your company" })).toBeFocused();
  const summary = shell.locator(".px-preview-summary");
  await expect(summary).toHaveText("0 fit your work, regions and size · 0 pass every check");
  await shell.getByRole("button", { name: "Continue" }).click();
  await expect(shell.getByRole("alert")).toHaveText("Enter your company’s name.");
  await shell.getByLabel("Company name").fill("Harbour Data Co");
  const description = shell.getByLabel("What does your company do? (optional)");
  const data = shell.getByRole("checkbox", { name: "Data platforms" });
  await description.fill("We run data analytics for city councils.");
  await expect(data).toBeChecked();
  // The ticks follow the description both ways: deleting the words unticks what they suggested.
  await description.fill("We run");
  await expect(data).not.toBeChecked();
  await description.fill("We run data analytics for city councils.");
  await expect(data).toBeChecked();
  // A suggestion the visitor unticks stays unticked while they keep typing, and a hand tick stays put.
  await data.uncheck();
  await description.fill("We run data analytics and dashboards for city councils.");
  await expect(data).not.toBeChecked();
  await expect(shell.locator(".px-setup-hint")).toHaveText("You unticked what your description suggested.");
  await data.check();
  await description.fill("");
  await expect(data).toBeChecked();
  await expect(shell.locator(".px-preview .px-list-heading")).toContainText("Harbour Data Co");
  await shell.getByRole("checkbox", { name: "Software development" }).check();
  await shell.getByRole("button", { name: "Continue" }).click();
  await shell.getByRole("checkbox", { name: "Ontario" }).check();
  await expect(summary).not.toHaveText(/^0 fit/);
  await shell.getByRole("radio", { name: "$1M" }).check();
  await shell.getByRole("button", { name: "Continue" }).click();
  await shell.getByRole("checkbox", { name: "Reliability status" }).check();
  await expect(summary).toHaveText(/[1-9] pass every check$/);
  await shell.getByRole("button", { name: "See my matches" }).click();

  await expect(shell.getByRole("heading", { name: "Opportunities for Harbour Data Co" })).toBeVisible();
  const tour = page.getByRole("dialog", { name: "Your matches, best first" });
  await expect(tour).toBeVisible();
  await expect(tour).toContainText("1 of 8");
  await expect(tour.getByRole("heading", { name: "Your matches, best first" })).toBeFocused();
  await expect(tour).toContainText("ranked against Harbour Data Co");
  await checkAccessibility(page);
  await tour.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("dialog", { name: "Requirements, checked against you" }).getByRole("heading")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator(".px-tour-card")).toHaveCount(0);

  await page.reload();
  const again = await openExplorer(page);
  await expect(again.getByRole("heading", { name: "Opportunities for Harbour Data Co" })).toBeVisible();
  await expect(page.locator(".px-tour-card")).toHaveCount(0);
});

test("a buyer setup opens the government view on that organisation's contracts", async ({ page }) => {
  await page.goto("/publicus");
  const shell = await openExplorer(page);
  await shell.getByRole("button", { name: /I buy for a public body/ }).click();
  await shell.getByRole("button", { name: "Continue" }).click();
  await expect(shell.getByRole("alert")).toHaveText("Choose an organisation.");
  await shell.getByRole("radio", { name: /Town of Cedar Bay/ }).check();
  await expect(shell.locator(".px-preview")).toContainText("Managed hosting & data operations");
  await shell.getByRole("button", { name: "Continue" }).click();
  await shell.getByRole("checkbox", { name: /Expires within six months/ }).uncheck();
  await shell.getByRole("button", { name: "See my contracts" }).click();

  await expect(shell.getByRole("tab", { name: "For government" })).toHaveAttribute("aria-selected", "true");
  await expect(shell.getByRole("heading", { name: "Contracts for Town of Cedar Bay" })).toBeVisible();
  await expect(shell.locator(".px-record")).toHaveCount(1);
  await expect(shell.getByRole("combobox", { name: "Filter records" })).toHaveValue("mine");
  const tour = page.getByRole("dialog", { name: "Town of Cedar Bay’s contracts" });
  await expect(tour).toBeVisible();
  await tour.getByRole("button", { name: "Skip tour" }).click();
  await expect(tour).toBeHidden();
  await expect(shell.locator(".px-issues li.is-muted")).toContainText("Expires within six months");
  await expect(shell.locator(".px-elsewhere")).toHaveText("Northstar Digital Inc. also holds contracts with Lakeview Regional Council.");
  await shell.getByRole("tab", { name: "For vendors" }).click();
  await expect(shell.locator(".px-record", { hasText: "Your tender" })).toHaveCount(2);
});

test("skipping setup explores as Maple Systems, and the tour's try-it steps move on by themselves", async ({ page }) => {
  await page.goto("/publicus");
  const shell = await openExplorer(page);
  await shell.getByRole("button", { name: /Skip and explore as Maple Systems/ }).click();
  await expect(shell.getByRole("heading", { name: "Opportunities for Maple Systems" })).toBeVisible();
  await page.getByRole("dialog", { name: "Your matches, best first" }).getByRole("button", { name: "Next" }).click();
  await page.getByRole("dialog", { name: "Requirements, checked against you" }).getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("dialog", { name: "An explanation that cites its sources" })).toBeVisible();
  await shell.getByRole("button", { name: "Explain this match" }).click();
  const pipeline = page.getByRole("dialog", { name: "Keep track of what you’ll pursue" });
  await expect(pipeline).toBeVisible();
  await expect(shell.locator(".px-answer")).toBeVisible();
  await pipeline.getByRole("button", { name: "Next" }).click();
  await expect(shell.getByRole("tab", { name: "For government" })).toHaveAttribute("aria-selected", "true");
  await page.getByRole("dialog", { name: "The buyer’s side" }).getByRole("button", { name: "Next" }).click();
  await expect(shell.getByRole("tab", { name: "Sources & imports" })).toHaveAttribute("aria-selected", "true");
  await page.getByRole("dialog", { name: "Bring real data" }).getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("dialog", { name: "Break the data on purpose" })).toBeVisible();
  await shell.getByRole("combobox", { name: "Evidence scenario" }).selectOption("conflict");
  const last = page.getByRole("dialog", { name: "Make it yours" });
  await expect(last).toContainText("8 of 8");
  await last.getByRole("button", { name: "Finish" }).click();
  await expect(last).toBeHidden();
  await expect(shell.getByRole("button", { name: "Setup" })).toBeFocused();
});

test("Take the tour replays it, and resetting the workspace shows setup again", async ({ page }) => {
  await page.goto("/publicus");
  const shell = await openExplorer(page);
  await shell.getByRole("button", { name: /Skip and explore/ }).click();
  await page.getByRole("dialog", { name: "Your matches, best first" }).getByRole("button", { name: "Skip tour" }).click();
  await shell.getByRole("button", { name: "Take the tour" }).click();
  await expect(page.getByRole("dialog", { name: "Your matches, best first" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".px-tour-card")).toHaveCount(0);
  await shell.getByRole("button", { name: "Setup" }).click();
  await expect(shell.getByRole("button", { name: /I sell to government/ })).toContainText("Current");
  await shell.getByRole("button", { name: "Keep my current setup" }).click();
  await shell.getByRole("button", { name: "Reset workspace" }).click();
  await page.getByRole("dialog", { name: "Reset this workspace?" }).getByRole("button", { name: "Reset workspace" }).click();
  await expect(shell.getByRole("heading", { name: "Try it as a vendor or as a public buyer" })).toBeVisible();
});

for (const width of [320, 390, 1440]) {
  test(`setup and the tour fit a ${width}px screen`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/publicus");
    const shell = await openExplorer(page);
    const spill = (selector: string) => page.locator(selector).evaluate((element) => element.scrollWidth - element.clientWidth);
    expect(await spill(".px-setup")).toBeLessThanOrEqual(0);
    expect(await spill(".px-topbar")).toBeLessThanOrEqual(0);
    await shell.getByRole("button", { name: /I sell to government/ }).click();
    expect(await spill(".px-setup")).toBeLessThanOrEqual(0);
    await shell.getByRole("button", { name: "Back" }).click();
    await shell.getByRole("button", { name: /Skip and explore/ }).click();
    const card = page.locator(".px-tour-card");
    await expect(card).toBeVisible();
    const box = await card.boundingBox();
    expect(box && box.x >= 0 && box.x + box.width <= width && box.y >= 0 && box.y + box.height <= 800).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  });
}

test("the page stays still while the tour moves between steps", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/publicus");
  const shell = await openExplorer(page);
  await shell.getByRole("button", { name: /Skip and explore/ }).click();
  const card = page.locator(".px-tour-card");
  await expect(card).toContainText("1 of 8");
  // The tour frames the explorer once, sized to fit the window, and every later step happens inside it.
  await expect.poll(() => shell.evaluate((node) => { const box = node.getBoundingClientRect(); return box.top >= 0 && box.bottom <= innerHeight; })).toBe(true);
  const y = await page.evaluate(() => scrollY);
  for (let step = 2; step <= 8; step++) {
    await card.getByRole("button", { name: "Next" }).click();
    await expect(card).toContainText(`${step} of 8`);
    expect(await page.evaluate(() => scrollY)).toBe(y);
  }
  await expect(shell.getByRole("tab", { name: "For vendors" })).toHaveAttribute("aria-selected", "true");
  await card.getByRole("button", { name: "Finish" }).click();
  await expect(shell.locator(".px-record-list")).toHaveCSS("height", "830px");
});

test("the tour's spotlight stays on its target in full screen", async ({ page }) => {
  await page.goto("/publicus");
  const shell = await openExplorer(page);
  await shell.getByRole("button", { name: /Skip and explore/ }).click();
  await page.getByRole("dialog", { name: "Your matches, best first" }).getByRole("button", { name: "Skip tour" }).click();
  await shell.getByRole("button", { name: "Open full screen" }).click();
  await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(true);
  await shell.getByRole("button", { name: "Take the tour" }).click();
  await page.getByRole("dialog", { name: "Your matches, best first" }).getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("dialog", { name: "Requirements, checked against you" })).toBeVisible();
  // The ring sits 6px outside the section it highlights, wherever the shell has scrolled to.
  await expect.poll(() => page.evaluate(() => {
    const target = document.querySelector('[data-tour="requirements"]')!.getBoundingClientRect(), ring = document.querySelector(".px-tour-ring")!.getBoundingClientRect();
    return [Math.round(ring.left - target.left), Math.round(ring.top - target.top)];
  })).toEqual([-6, -6]);
});
