# Dependency security

Next.js and `eslint-config-next` are pinned together at 16.3.8, which includes the
security fixes missing from 16.3.4. The lockfile also selects patched releases of
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
