/* eslint-disable @typescript-eslint/no-require-imports -- ESLint and its plugins load minimatch through CommonJS. */
const upstream = require("minimatch-v11");

const { Minimatch } = upstream;

// minimatch 11's CommonJS build is a non-callable namespace without a default
// export. ESLint plugins call the v3 shape, `minimatch(path, pattern)`, directly
// or through Babel/Rollup interop, so expose a callable with the statics attached.
// Object.assign skips the non-enumerable __esModule flag, which keeps that interop
// wrapping this function as `default`.
function minimatch(path, pattern, options) {
  return upstream.minimatch(path, pattern, options);
}
Object.assign(minimatch, upstream, { minimatch, Minimatch });

// 11.0.0 removed makeRe. Its only caller, eslint-plugin-import's
// no-internal-modules, only calls test() on the result.
minimatch.makeRe = (pattern, options) => {
  const matcher = new Minimatch(pattern, options);
  return { test: (path) => matcher.match(path) };
};

module.exports = minimatch;
