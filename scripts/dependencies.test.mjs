import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, test } from "node:test";
import { ESLint } from "eslint";

const siteRequire = createRequire(import.meta.url);
const configRequire = createRequire(siteRequire.resolve("eslint-config-next"));
const nextPlugin = configRequire("@next/eslint-plugin-next");
const pluginRequire = createRequire(configRequire.resolve("@next/eslint-plugin-next"));
const { getRootDirs } = pluginRequire("./utils/get-root-dirs.js");
let fixture;
let roots;

before(async () => {
  fixture = await mkdtemp(path.join(tmpdir(), "portfolio-eslint-"));
  roots = ["alpha", "beta"].map((name) => path.join(fixture, "apps", name));
  for (const root of roots) {
    await mkdir(path.join(root, "app"), { recursive: true });
    await mkdir(path.join(root, "pages"), { recursive: true });
    await writeFile(path.join(root, "app", "page.tsx"), "");
    await writeFile(path.join(root, "pages", "dashboard.tsx"), "");
  }
  await writeFile(path.join(fixture, "apps", "README.md"), "");
});

after(async () => {
  if (fixture) await rm(fixture, { recursive: true, force: true });
});

test("Next's scoped glob dependency resolves to the local adapter", () => {
  assert.equal(
    pluginRequire("fast-glob/package.json").name,
    "@personal-site/next-eslint-glob",
  );
});

test("Next finds only directories through literal, wildcard, brace, and array roots", () => {
  const context = { cwd: fixture, settings: {} };
  assert.deepEqual(getRootDirs(context), [fixture]);
  for (const rootDir of [
    path.join(fixture, "apps", "*"),
    path.relative(process.cwd(), path.join(fixture, "apps", "*")),
    path.join(fixture, "apps", "{alpha,beta}"),
    roots,
  ]) {
    assert.deepEqual(
      getRootDirs({ ...context, settings: { next: { rootDir } } })
        .map((dir) => path.resolve(dir))
        .sort(),
      roots,
    );
  }
  for (const rootDir of [roots[0], roots[0].replaceAll("/", "\\")]) {
    assert.deepEqual(
      getRootDirs({ ...context, settings: { next: { rootDir } } })
        .map((dir) => path.resolve(dir)),
      [roots[0]],
    );
  }
  assert.deepEqual(getRootDirs({
    ...context,
    settings: { next: { rootDir: path.join(fixture, "missing", "*") } },
  }), []);
});

test("Next's link rule still finds routes under a globbed root", async () => {
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: {
      languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
      plugins: { "@next/next": nextPlugin },
      settings: { next: { rootDir: path.join(fixture, "apps", "*") } },
      rules: { "@next/next/no-html-link-for-pages": "error" },
    },
  });
  for (const href of ["/", "/dashboard"]) {
    const [internal] = await eslint.lintText(
      `const link = <a href="${href}">Internal</a>;`,
    );
    assert.equal(internal.errorCount, 1, `Expected a lint error for ${href}`);
    assert.equal(internal.messages[0].ruleId, "@next/next/no-html-link-for-pages");
  }

  const [external] = await eslint.lintText(
    'const link = <a href="https://bajan.arizmilabs.com/login">Bajan</a>;',
  );
  assert.equal(external.errorCount, 0);
});
