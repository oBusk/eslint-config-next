import jest from "eslint-plugin-jest";
import testingLibrary from "eslint-plugin-testing-library";
import { defineConfig } from "eslint/config";

const extensions = "{js,jsx,mjs,cjs,ts,tsx,mts,cts}";

export default defineConfig([
  {
    name: "oBusk Jest + Testing Library",
    // Jest's default testMatch, so the rules (and Jest globals) only apply to tests
    files: [
      `**/__tests__/**/*.${extensions}`,
      `**/*.{test,spec}.${extensions}`,
    ],
    extends: [
      jest.configs["flat/recommended"],
      jest.configs["flat/style"],
      testingLibrary.configs["flat/react"],
    ],
  },
]);
