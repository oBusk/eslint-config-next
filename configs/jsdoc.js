import jsdocPlugin from "eslint-plugin-jsdoc";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    name: "oBusk JSDoc for JavaScript",
    files: ["**/*.{js,jsx,mjs,cjs}"],
    // Types live in JSDoc, written TypeScript-style
    extends: [jsdocPlugin.configs["flat/recommended-typescript-flavor-error"]],
  },
  {
    name: "oBusk JSDoc for TypeScript",
    files: ["**/*.{ts,tsx,mts,cts}"],
    // Types live in the code, so JSDoc must not repeat them
    extends: [jsdocPlugin.configs["flat/recommended-typescript-error"]],
    rules: {
      "jsdoc/require-jsdoc": 0,
      "jsdoc/require-param": 0,
      "jsdoc/require-returns": 0,
      "jsdoc/require-yields": 0,
      "jsdoc/tag-lines": ["error", "any", { startLines: 1, endLines: 0 }],
    },
  },
]);
