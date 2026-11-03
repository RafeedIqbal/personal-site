import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import { ESLint } from "eslint";

const siteRequire = createRequire(import.meta.url);
const configRequire = createRequire(siteRequire.resolve("eslint-config-next"));
const nextPlugin = configRequire("@next/eslint-plugin-next");
const pluginRequire = createRequire(configRequire.resolve("@next/eslint-plugin-next"));
const { getRootDirs } = pluginRequire("./utils/get-root-dirs.js");
const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const requireFrom = (name) =>
  createRequire(path.join(siteRoot, "node_modules", name, "package.json"));
const MINIMATCH_DEPENDENTS = [
  "eslint",
  "@eslint/config-array",
  "@eslint/eslintrc",
  "@typescript-eslint/typescript-estree",
  "eslint-plugin-import",
  "eslint-plugin-jsx-a11y",
  "eslint-plugin-react",
];
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

test("every ESLint dependency resolves minimatch to the local adapter", () => {
  for (const name of MINIMATCH_DEPENDENTS) {
    const resolved = requireFrom(name).resolve("minimatch");
    assert.equal(path.basename(path.dirname(resolved)), "minimatch-compat", name);
  }
});

test("the lockfile holds no minimatch release affected by GHSA-g3hv-75wg-m249", async () => {
  const lock = JSON.parse(await readFile(path.join(siteRoot, "package-lock.json"), "utf8"));
  const releases = Object.entries(lock.packages)
    .filter(([key, entry]) => /node_modules\/minimatch(-v11)?$/.test(key) && !entry.link)
    .map(([, entry]) => entry.version);
  assert.ok(releases.length > 0);
  for (const version of releases) {
    const [major, minor, patch] = version.split(".").map(Number);
    assert.ok(major > 11 || (major === 11 && (minor > 0 || patch >= 1)), version);
  }
});

test("the adapter keeps the callable shape ESLint plugins expect", () => {
  const minimatch = requireFrom("eslint-plugin-react")("minimatch");
  assert.equal(typeof minimatch, "function");
  assert.equal(minimatch.minimatch, minimatch);
  assert.equal(minimatch.__esModule, undefined);
  assert.equal(typeof minimatch.Minimatch, "function");
  assert.equal(typeof minimatch.filter, "function");
  // Babel's _interopRequireDefault, as used by eslint-plugin-import and jsx-a11y.
  const interop = minimatch && minimatch.__esModule ? minimatch : { default: minimatch };
  assert.equal(interop.default("a.js", "*.js"), true);
  assert.equal(minimatch.makeRe("src/**").test("src/a/b.js"), true);
  assert.equal(minimatch.makeRe("src/**").test("lib/a.js"), false);
});

test("the adapter matches the way ESLint config and ignores rely on", () => {
  const minimatch = requireFrom("eslint")("minimatch");
  const { Minimatch } = minimatch;
  assert.equal(minimatch(".next/server/app.js", ".next/**"), true);
  assert.equal(minimatch("apps/web/node_modules/x/index.js", "**/node_modules/**"), true);
  assert.equal(minimatch("next-env.d.ts", "**/node_modules/**"), false);
  assert.equal(new Minimatch("src/lib/**").match("src", true), true);
  assert.equal(new Minimatch("!*.js", { flipNegate: true }).match("a.js"), true);
  assert.equal(minimatch("src/deep/file.ts", "*.ts", { matchBase: true }), true);
  assert.equal(minimatch(".eslintrc.js", "*.js"), false);
  assert.equal(minimatch(".eslintrc.js", "*.js", { dot: true }), true);
});

test("plugin rules that match globs still run on minimatch 11", async () => {
  const lint = async (plugin, rule, options, code) => {
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: {
        languageOptions: {
          ecmaVersion: "latest",
          sourceType: "module",
          parserOptions: { ecmaFeatures: { jsx: true } },
        },
        plugins: plugin,
        rules: { [rule]: ["error", ...options] },
      },
    });
    const [result] = await eslint.lintText(code);
    return result.messages.filter((m) => m.ruleId === rule).length;
  };
  const react = { react: configRequire("eslint-plugin-react") };
  const pascal = [{ ignore: ["Allowed_*"] }];
  assert.equal(await lint(react, "react/jsx-pascal-case", pascal, "<Allowed_widget />;"), 0);
  assert.equal(await lint(react, "react/jsx-pascal-case", pascal, "<Other_widget />;"), 1);

  const imports = { import: configRequire("eslint-plugin-import") };
  const order = [{
    groups: ["builtin", "external", "internal"],
    pathGroups: [{ pattern: "@/**", group: "internal" }],
  }];
  assert.equal(
    await lint(imports, "import/order", order, 'import a from "@/lib/a";\nimport fs from "fs";'),
    1,
  );
  const internal = [{ allow: ["lodash/*"] }];
  assert.equal(await lint(imports, "import/no-internal-modules", internal, 'import fp from "lodash/fp";'), 0);
  assert.equal(await lint(imports, "import/no-internal-modules", internal, 'import c from "react-dom/client";'), 1);

  const a11y = { "jsx-a11y": configRequire("eslint-plugin-jsx-a11y") };
  const label = [{ assert: "nesting", controlComponents: ["Custom*"], depth: 3 }];
  const rule = "jsx-a11y/label-has-associated-control";
  assert.equal(await lint(a11y, rule, label, "<label>Name <CustomInput /></label>;"), 0);
  assert.equal(await lint(a11y, rule, label, "<label>Name</label>;"), 1);
});

test("the site's ESLint global ignores still apply", async () => {
  const eslint = new ESLint({ cwd: siteRoot });
  assert.equal(await eslint.isPathIgnored(path.join(siteRoot, ".next/server/app.js")), true);
  assert.equal(await eslint.isPathIgnored(path.join(siteRoot, "node_modules/x/index.js")), true);
  assert.equal(await eslint.isPathIgnored(path.join(siteRoot, "app/page.tsx")), false);
});
