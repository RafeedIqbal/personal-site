import { expect, test, type Page } from "@playwright/test";

// The production CSP is only as good as the pages that still work under it. Collect every
// violation the browser reports while each page's interactive parts are exercised.
async function watchViolations(page: Page) {
  const violations: string[] = [];
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (event) => {
      console.error(`CSP violation: ${event.violatedDirective} ${event.blockedURI}`);
    });
  });
  page.on("console", (message) => {
    if (/Content Security Policy|CSP violation|Trusted Type/i.test(message.text())) violations.push(message.text());
  });
  page.on("pageerror", (error) => violations.push(`page error: ${error.message}`));
  return violations;
}

test("every route sends the security headers and the production CSP", async ({ request }) => {
  for (const path of ["/"]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    const headers = response.headers();
    expect(headers["x-content-type-options"], path).toBe("nosniff");
    expect(headers["x-frame-options"], path).toBe("DENY");
    expect(headers["referrer-policy"], path).toBe("strict-origin-when-cross-origin");
    expect(headers["cross-origin-opener-policy"], path).toBe("same-origin");
    expect(headers["permissions-policy"], path).toContain("camera=()");
    const csp = headers["content-security-policy"] ?? "";
    for (const directive of ["default-src 'self'", "script-src 'self' 'unsafe-inline'", "img-src 'self'", "connect-src 'self'", "frame-src 'none'", "object-src 'none'", "base-uri 'none'", "form-action 'self'", "frame-ancestors 'none'"]) {
      expect(csp, `${path}: ${directive}`).toContain(directive);
    }
  }
  const home = (await request.get("/")).headers();
  expect(home["cross-origin-resource-policy"]).toBe("same-origin");
  expect(home["x-robots-tag"]).toBeUndefined();
  expect((await request.get("/opengraph-image")).headers()["cross-origin-resource-policy"]).toBe("cross-origin");
});

// /belong and /publicus are offline: their code lives in app/_belong and app/_publicus
// (private folders, so Next builds no route) and the /publicus files in app/_publicus/assets.
test("the offline /belong and /publicus routes and their files are not served", async ({ request }) => {
  for (const path of ["/belong", "/belong/opengraph-image", "/belong/twitter-image", "/publicus", "/publicus/opengraph-image", "/publicus/twitter-image", "/publicus/work/blend-alchemy-demo.mp4", "/publicus/Rafeed_Iqbal_Publicus_Resume.pdf"]) {
    expect((await request.get(path)).status(), path).toBe(404);
  }
});

test("the portfolio's terminal, help and image dialog run without CSP violations", async ({ page }) => {
  const violations = await watchViolations(page);
  await page.goto("/");
  await page.getByRole("button", { name: /^Open terminal/ }).click();
  const input = page.getByRole("textbox", { name: "Terminal command input" });
  await input.fill("help");
  await input.press("Enter");
  await expect(page.getByRole("region", { name: "Command help" })).toBeVisible();
  await input.fill("games");
  await input.press("Enter");
  await expect(page.getByRole("group", { name: "Terminal arcade" })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");
  await page.getByRole("link", { name: "Private-label fragrance website View image" }).click();
  await expect(page.getByRole("dialog", { name: "Private-label fragrance website" }).locator("img")).toBeVisible();
  await page.keyboard.press("Escape");
  expect(violations).toEqual([]);
});

test.skip("the /belong demo and its drawer run without CSP violations", async ({ page }) => {
  const violations = await watchViolations(page);
  await page.goto("/belong");
  await page.locator("#chip-1").click();
  await expect(page.locator("#chip-1")).toHaveAttribute("aria-pressed", "true");
  const gate = page.locator(".bl-gate:not([disabled])").first();
  await gate.click();
  const drawer = page.locator("dialog.bl-drawer");
  await expect(drawer).toBeVisible();
  // On desktop the drawer sits inside the app window, so it is not modal.
  expect(await drawer.evaluate((node) => node.matches(":modal"))).toBe(false);
  await page.keyboard.press("Escape");
  await expect(drawer).toHaveCount(0);
  expect(violations).toEqual([]);
});

test.skip("on phones the /belong drawer is a modal sheet that returns focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/belong");
  await page.locator("#instrument").scrollIntoViewIfNeeded();
  const toggle = page.getByRole("button", { name: "The nine gates" });
  if (await toggle.isVisible()) await toggle.click();
  const gate = page.locator(".bl-gate:not([disabled])").first();
  await gate.click();
  const drawer = page.locator("dialog.bl-drawer");
  await expect(drawer).toBeVisible();
  expect(await drawer.evaluate((node) => node.matches(":modal"))).toBe(true);
  await expect(drawer.getByRole("heading", { level: 3 })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(drawer).toHaveCount(0);
  await expect(gate).toBeFocused();
});

test.skip("/publicus loads the explorer near the viewport and runs without CSP violations", async ({ page }) => {
  const violations = await watchViolations(page);
  await page.goto("/publicus");
  // The explorer's code loads only as the reader approaches it.
  await expect(page.locator(".px-shell")).toHaveCount(0);
  await page.locator("#explorer").scrollIntoViewIfNeeded();
  await expect(page.locator("#explorer").getByRole("button", { name: "CanadaBuys rows" })).toBeVisible();
  await page.getByRole("button", { name: "Ask a question" }).click();
  const chat = page.getByRole("dialog", { name: "Questions about this application" });
  await chat.getByRole("button", { name: "Why does row 1 show a $0.00 total?" }).click();
  await expect(chat.getByRole("link", { name: "Record 01" })).toBeVisible();
  expect(violations).toEqual([]);
});
