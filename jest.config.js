const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  // Exclude Playwright e2e tests — they must be run via `pnpm exec playwright test`.
  testPathIgnorePatterns: ["/node_modules/", "<rootDir>/e2e/"],
};

module.exports = createJestConfig(config);
