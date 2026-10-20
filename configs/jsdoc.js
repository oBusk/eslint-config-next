import { jsdoc } from "eslint-plugin-jsdoc";
import { defineConfig } from "eslint/config";

export default defineConfig([
  jsdoc({
    config: "flat/recommended-typescript-flavor-error",
  }),
  {
    name: "oBusk JSDoc Overrides for TypeScript",
    files: ["**/*.ts?(x)"],
    rules: {
      "jsdoc/require-jsdoc": 0,
      "jsdoc/require-param": 0,
      "jsdoc/require-returns": 0,
      "jsdoc/require-yields": 0,
      "jsdoc/tag-lines": ["error", "any", { startLines: 1, endLines: 0 }],
    },
  },
]);
