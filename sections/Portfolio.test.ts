import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function checkAccessibility(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
    .analyze();
  expect(violations).toEqual([]);
}

async function openTerminal(page: Page) {
  await page.getByRole("button", { name: /^Open terminal/ }).click();
  await expect(page.getByRole("textbox", { name: "Terminal command input" })).toBeFocused();
}

async function runCommand(page: Page, command: string) {
  const prompt = page.getByRole("textbox", { name: "Terminal command input" });
  await prompt.fill(command);
  await prompt.press("Enter");
}

test("work outcomes are visible and all seven cases remain accessible", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator(".featured-project h3")).toHaveText(["BaseNote", "Icon Training", "Palette Knife"]);
  await expect(page.locator(".supporting-project").getByRole("heading", { level: 4 })).toHaveText(["Bajan", "id8", "E-Predict", "SyncMaster"]);
  await expect(page.locator(".website-gallery h3")).toHaveText(["alpaclondon.com", "arizmilabs.com", "rivelimn.com"].map((name) => new RegExp(name)));
  await expect(page.locator("#work-icon .project-outcome")).toContainText("grew the team from 2 to 8");
  await checkAccessibility(page);

  for (const details of await page.locator(".case-details").all()) {
    await details.locator("summary").click();
    await expect(details).toHaveAttribute("open", "");
    await expect(details.getByText("The approach", { exact: true })).toBeVisible();
  }
  await expect(page.getByRole("link", { name: /View image$/ })).toHaveCount(9);
  const captions = await page.locator(".screenshot-caption").allTextContents();
  expect(new Set(captions).size).toBe(captions.length);
  await checkAccessibility(page);
  expect(errors).toEqual([]);
});

test("image labels, full-size access, and dialog focus work together", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("link", { name: "Icon Training product website View image" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Icon Training product website" });
  const close = dialog.getByRole("button", { name: "Close", exact: true });
  await expect(close).toBeFocused();
  // The native modal keeps the page inert; no script wraps Tab around inside it.
  await page.keyboard.press("Shift+Tab");
  const fullSize = dialog.getByRole("link", { name: /Open full-size image/ });
  await expect(fullSize).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await checkAccessibility(page);
  const popupPromise = page.waitForEvent("popup");
  await fullSize.click();
  const popup = await popupPromise;
  await popup.waitForLoadState();
  expect(popup.url()).toContain("/images/sites/icon-training.webp");
  await popup.close();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("the BaseNote demo video loads on demand with a captions track", async ({ page, request }) => {
  await page.goto("/");
  const video = page.locator("#work-basenote video");
  await expect(video).toBeVisible();
  await expect(page.locator("#work-basenote .screenshot")).toHaveCount(0);
  await expect(video).toHaveAttribute("controls", "");
  await expect(video).toHaveAttribute("preload", "none");
  await expect(video).toHaveAttribute("poster", "/images/work/basenote-demo.webp");
  await expect(video.locator("source")).toHaveAttribute("type", "video/mp4");
  await expect(video.locator('track[kind="captions"]')).toHaveAttribute("srclang", "en");
  await expect(page.locator("#work-basenote figcaption")).toContainText("Blend & Alchemy product demo");
  await checkAccessibility(page);

  const media = await request.get("/videos/blend-alchemy-demo.mp4", { headers: { Range: "bytes=0-1023" } });
  expect(media.status()).toBe(206);
  expect(media.headers()["content-type"]).toContain("video/mp4");
  const captions = await request.get("/videos/blend-alchemy-demo.en.vtt");
  expect(captions.status()).toBe(200);
  expect(captions.headers()["content-type"]).toContain("text/vtt");
  expect(await captions.text()).toMatch(/^WEBVTT/);
  const poster = await request.get("/images/work/basenote-demo.webp");
  expect(poster.status()).toBe(200);
  expect(poster.headers()["content-type"]).toContain("image/webp");
});

test("terminal uses a modifier shortcut and preserves help, history, and website commands", async ({ page }) => {
  await page.goto("/");
  const work = page.getByRole("link", { name: "View selected work" });
  await work.focus();
  await page.keyboard.press("Backquote");
  await expect(page.getByRole("dialog", { name: "Terminal", exact: true })).toHaveCount(0);
  await page.keyboard.press("Control+Backquote");
  const prompt = page.getByRole("textbox", { name: "Terminal command input" });
  await expect(prompt).toBeFocused();
  await prompt.fill("who");
  await prompt.press("Tab");
  await expect(prompt).toHaveValue("whoami");
  await prompt.press("Enter");
  await expect(page.getByRole("log")).toContainText("Rafeed Iqbal");
  await runCommand(page, "cat experience.log");
  await runCommand(page, "help");
  const help = page.getByRole("region", { name: "Command help" });
  await expect(help).toBeVisible();
  await expect(help.getByRole("button", { name: "Close help", exact: true })).toBeInViewport();
  await expect(help.getByRole("button", { name: /^clear / })).toBeInViewport();
  await expect(prompt).toBeInViewport();
  const commands = help.getByRole("button").filter({ hasNotText: "Close help" });
  for (const button of await commands.all()) {
    const box = await button.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
  await checkAccessibility(page);
  await page.setViewportSize({ width: 1024, height: 600 });
  await expect(prompt).toBeInViewport();
  await expect(help.getByRole("button", { name: "Close help", exact: true })).toBeInViewport();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await help.getByRole("button", { name: "whoami display identity" }).click();
  await expect(prompt).toHaveValue("whoami");
  await expect(prompt).toBeFocused();
  await runCommand(page, "ls websites/");
  for (const site of ["rafeed.dev", "icontraining.app", "alpaclondon.com", "arizmilabs.com", "basenotesolutions.com", "rivelimn.com"]) {
    await expect(page.getByRole("log")).toContainText(site);
  }
  await prompt.press("ArrowUp");
  await expect(prompt).toHaveValue("ls websites/");
  await page.keyboard.press("Escape");
  await expect(work).toBeFocused();
  await openTerminal(page);
  await expect(page.getByRole("log")).toContainText("ls websites/");
});

test("arcade labels and focus controls stay usable without capturing prompt input", async ({ page }) => {
  await page.goto("/");
  await openTerminal(page);
  await runCommand(page, "games");
  const arcade = page.getByRole("group", { name: "Terminal arcade", exact: true });
  await expect(arcade.getByRole("button", { name: /Tic-Tac-Toe/ })).toBeVisible();
  await checkAccessibility(page);
  await arcade.getByRole("button", { name: /Tic-Tac-Toe/ }).click();
  const square = arcade.getByRole("button", { name: /row 1, column 1/i });
  await square.focus();
  await page.keyboard.press("Enter");
  await expect(square).toHaveAccessibleName(/X/);
  await arcade.getByRole("button", { name: "Library", exact: true }).click();
  await arcade.getByRole("button", { name: /Tetris/ }).click();
  const focusControls = arcade.getByRole("button", { name: /^(Focus|Resume) keyboard controls$/ });
  await focusControls.click();
  await expect(arcade).toBeFocused();
  const board = arcade.getByRole("img", { name: /^Tetris playfield/ });
  const activeColumns = () => board.locator(".bg-white").evaluateAll((cells) => cells.map((cell) => cell.getBoundingClientRect().x));
  const beforeMove = await activeColumns();
  const cellStep = await board.locator(":scope > div").evaluateAll((cells) => cells[1].getBoundingClientRect().x - cells[0].getBoundingClientRect().x);
  const pageScroll = await page.evaluate(() => scrollY);
  await page.keyboard.press("ArrowLeft");
  await expect.poll(activeColumns).toEqual(beforeMove.map((column) => column - cellStep));
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("Space");
  await expect(arcade.getByText("score: 10 · lines: 0", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => scrollY)).toBe(pageScroll);
  const prompt = page.getByRole("textbox", { name: "Terminal command input" });
  await prompt.focus();
  await expect(focusControls).toHaveText("Resume keyboard controls");
  const boardBeforeTyping = await board.innerHTML();
  await prompt.pressSequentially("wasd");
  await expect(prompt).toHaveValue("wasd");
  expect(await board.innerHTML()).toBe(boardBeforeTyping);
  await checkAccessibility(page);
  await page.keyboard.press("Escape");
  await expect(arcade).toHaveCount(0);
  await expect(prompt).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: /^Open terminal/ })).toBeFocused();
});

test("Escape steps back through help and the arcade, and the backdrop closes the whole terminal", async ({ page }) => {
  await page.goto("/");
  await openTerminal(page);
  const terminal = page.getByRole("dialog", { name: "Terminal", exact: true });
  await runCommand(page, "games");
  const arcade = page.getByRole("group", { name: "Terminal arcade", exact: true });
  await expect(arcade).toBeVisible();
  await runCommand(page, "help");
  const help = page.getByRole("region", { name: "Command help" });
  await expect(help).toBeVisible();
  // Back-to-back presses with no input between them each step back one layer.
  // (Desktop Chrome stops honouring a prevented `cancel` on the second press; this
  // test browser does not reproduce that, so check it by hand after changing Esc.)
  await page.keyboard.press("Escape");
  await expect(help).toHaveCount(0);
  await expect(arcade).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(arcade).toHaveCount(0);
  await expect(terminal).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(terminal).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^Open terminal/ })).toBeFocused();

  await openTerminal(page);
  await runCommand(page, "help");
  await expect(help).toBeVisible();
  const box = (await terminal.boundingBox())!;
  // A text selection dragged out of the panel leaves it open.
  await page.mouse.move(box.x + 40, box.y + 60);
  await page.mouse.down();
  await page.mouse.move(1420, 20, { steps: 4 });
  await page.mouse.up();
  await expect(terminal).toBeVisible();
  await page.mouse.click(1420, 20);
  await expect(terminal).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^Open terminal/ })).toBeFocused();
});

for (const width of [320, 390, 768, 1024, 1440, 1920]) {
  test(`navigation and content fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width < 1024) {
      const menu = page.locator(".mobile-menu");
      await menu.locator("summary").click();
      await checkAccessibility(page);
      await menu.getByRole("link", { name: "Contact contact.sh" }).click();
      await expect(menu).not.toHaveAttribute("open", "");
      await expect(menu.locator("summary")).toContainText("Contact");
      await expect(page.locator("#contact")).toBeInViewport();
      const contactTop = (await page.locator("#contact").boundingBox())!.y;
      const header = (await page.locator(".mobile-header").boundingBox())!;
      expect(contactTop).toBeGreaterThanOrEqual(header.y + header.height);
    }
    await page.locator("#work-id8 summary").click();
    await expect(page.locator("#work-id8 .screenshot")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test("no-JavaScript navigation, cases, images, and résumé remain available", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 740 } });
  const page = await context.newPage();
  await page.goto(baseURL!);
  const menu = page.locator(".mobile-menu");
  await menu.locator("summary").click();
  await menu.getByRole("link", { name: "Contact contact.sh" }).click();
  await expect(page.locator("#contact")).toBeInViewport();
  expect(await page.locator(".mobile-header").evaluate((el) => getComputedStyle(el).position)).toBe("static");
  await page.locator("#work-id8 summary").click();
  const image = page.locator("#work-id8 .screenshot");
  await expect(image).toBeVisible();
  await image.click();
  await expect(page).toHaveURL(/\/images\/work\/id8\.webp$/);
  await page.goBack();
  const downloadPromise = page.waitForEvent("download");
  await page.locator(".mobile-header").getByRole("link", { name: /Résumé/ }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("Rafeed_Iqbal_Resume.pdf");
  expect(await download.failure()).toBeNull();
  await context.close();
});

test("clipboard reports both success and failure, and the résumé is a PDF", async ({ page, request }) => {
  await page.goto("/");
  await page.evaluate(() => Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: async () => {} },
  }));
  await page.getByRole("button", { name: "Copy email", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Email copied.");
  await page.evaluate(() => Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: async () => { throw new DOMException("Denied", "NotAllowedError"); } },
  }));
  await page.getByRole("button", { name: "Copy email", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Couldn’t copy. Select the email address above to copy it.");
  const response = await request.get("/Rafeed_Iqbal_Resume.pdf");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/pdf");
});

test("skip link and reduced motion preserve a direct reading path", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe("auto");
  await page.mouse.move(300, 300);
  const canvasIsEmpty = await page.locator("canvas").evaluateAll((canvases) => canvases.every((canvas) => {
    const pixels = (canvas as HTMLCanvasElement).getContext("2d")?.getImageData(0, 0, (canvas as HTMLCanvasElement).width, (canvas as HTMLCanvasElement).height).data;
    return !pixels || pixels.every((value, index) => index % 4 !== 3 || value === 0);
  }));
  expect(canvasIsEmpty).toBe(true);
});

test("normal motion preserves navigation, canvas fading, and keyboard focus", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible();
  const hasCanvasPixels = () => canvas.evaluate((element) => {
    const canvas = element as HTMLCanvasElement;
    const pixels = canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height).data;
    return pixels.some((value, index) => index % 4 === 3 && value > 0);
  });
  await page.mouse.move(1400, 600, { steps: 5 });
  await expect.poll(hasCanvasPixels).toBe(true);
  await expect.poll(hasCanvasPixels).toBe(false);

  const experience = page.getByRole("link", { name: "Experience experience.log", exact: true });
  await experience.click();
  await expect(experience).toHaveAttribute("aria-current", "location");
  await expect.poll(async () => Math.round((await page.locator("#experience").boundingBox())!.y)).toBe(32);
  await openTerminal(page);
  await runCommand(page, "help");
  const help = page.getByRole("region", { name: "Command help" });
  await help.getByRole("button", { name: /^clear / }).focus();
  await page.keyboard.press("Escape");
  const prompt = page.getByRole("textbox", { name: "Terminal command input" });
  await expect(prompt).toBeFocused();
  await expect(help).toHaveCount(0);
  await prompt.pressSequentially("whoami");
  await expect(prompt).toHaveValue("whoami");
  await page.keyboard.press("Control+Backquote");
  await expect(page.getByRole("dialog", { name: "Terminal", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^Open terminal/ })).toBeFocused();
});
