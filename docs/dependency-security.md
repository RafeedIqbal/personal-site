# Dependency security

Next.js and `eslint-config-next` are pinned together at 16.4.3, which includes the
security fixes missing from earlier 16.3 releases. The lockfile also selects patched releases of
`sharp`, `source-map-js`, and both installed `brace-expansion` release lines.

## ESLint glob replacement

`braces` has no published fix for
[GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).
It previously entered the development dependency tree through
`@next/eslint-plugin-next` -> `fast-glob` -> `micromatch` -> `braces`.

The npm override replaces `fast-glob` only for `@next/eslint-plugin-next` with
the local `scripts/next-eslint-glob` adapter backed by
[`tinyglobby` 0.2.17](https://github.com/SuperchupuDev/tinyglobby). The plugin's
only use is `globSync(pattern, { onlyDirectories: true })` in `getRootDirs`.
The adapter preserves absolute patterns and disables tinyglobby's automatic
directory expansion, so literal roots do not unexpectedly include child folders.
This removes the vulnerable dependency chain without disabling Next.js lint rules
or excluding development dependencies from the audit.

The replacement may return directory paths with trailing slashes. Next's consumer
joins these paths before filesystem access, so the checks compare resolved directory
locations and exercise actual lint rules for App and Pages Router roots. This is a
narrow adapter for that API, not a general-purpose replacement for `fast-glob`.

`npm run test:dependencies` checks the installed replacement, root discovery
(including wildcard, brace, array, and normalized Windows paths), and the actual
`no-html-link-for-pages` rule. CI runs these checks after a clean `npm ci` and
retains the standard `npm audit --audit-level=moderate` gate without exceptions.

When upgrading `eslint-config-next`, review the plugin's glob usage and run the
compatibility checks. Remove the override when the upstream dependency chain no
longer includes affected `braces` releases, then confirm a clean install and audit.

## ESLint minimatch replacement

[GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) affects
every `minimatch` release below 11.0.1, and the fix was not backported to the
3.x, 9.x or 10.x lines. ESLint 9, `@eslint/config-array`, `@eslint/eslintrc`,
`eslint-plugin-import`, `eslint-plugin-jsx-a11y` and `eslint-plugin-react` still
request minimatch 3, and `@typescript-eslint/typescript-estree` requests 10.

A plain override to minimatch 11 installs cleanly but breaks rules that are not on
by default: its CommonJS build is a non-callable namespace with no `default`
export and no `makeRe`, while the React, import and jsx-a11y plugins call
`minimatch(path, pattern)` directly or through Babel interop, and
`import/no-internal-modules` calls `makeRe(pattern).test(path)`.

The global `minimatch` override therefore points at the local
`scripts/minimatch-compat` adapter. It depends on minimatch 11.0.4 under the alias
`minimatch-v11` (so the override does not apply to itself), exposes a callable
function with minimatch's named exports attached, and adds a `makeRe` that only
provides the `test()` method its single caller uses. Omitting the `__esModule`
flag lets Babel and Rollup interop treat the function as the default export.

`npm run test:dependencies` checks that each ESLint dependency resolves the
adapter, that the lockfile holds no affected release, the exported shape, the
matching behavior ESLint config and ignores rely on (dot files, `**`, partial
matches, `flipNegate`, `matchBase`), real rules that match globs
(`react/jsx-pascal-case`, `import/order`, `import/no-internal-modules`,
`jsx-a11y/label-has-associated-control`), and the site's global ignores.

Remove the override once ESLint and these plugins depend on minimatch 11.0.1 or
later, then confirm a clean install, `npm run test:dependencies` and the audit.
Never run `npm audit fix --force` for this advisory: it proposes downgrading to
ESLint 4 and `eslint-config-next` 12.
