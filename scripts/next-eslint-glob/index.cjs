/* eslint-disable @typescript-eslint/no-require-imports -- Next loads this adapter through CommonJS. */
const { isAbsolute } = require("node:path");
const { globSync } = require("tinyglobby");

// Next only uses globSync for root discovery, without directory expansion.
exports.globSync = (pattern, options) => globSync(pattern, {
  ...options,
  absolute: isAbsolute(pattern),
  expandDirectories: false,
});
