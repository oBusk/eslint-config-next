import betterTailwind from "eslint-plugin-better-tailwindcss";
import { defineConfig } from "eslint/config";
import fs from "node:fs";
import path from "node:path";
import { projectRoot } from "./project.js";

// Tailwind v4 CSS entry point (the file containing `@import "tailwindcss";`).
// Absolute, since better-tailwindcss resolves relative paths against ESLint's
// cwd, which isn't the project root when linting from a subdirectory.
const tailwindEntryPoint = [
  "app/globals.css",
  "src/app/globals.css",
  "styles/globals.css",
  "src/styles/globals.css",
]
  .map((candidate) => path.join(projectRoot, candidate))
  .find((candidate) => fs.existsSync(candidate));

export default defineConfig([
  {
    name: "oBusk Tailwind Config",
    extends: [betterTailwind.configs.recommended],
    settings: {
      "better-tailwindcss": {
        ...(tailwindEntryPoint && { entryPoint: tailwindEntryPoint }),
        // Treat classes defined in `@layer components` as known classes
        detectComponentClasses: true,
        // Allows canonicalizing px values to the spacing scale, e.g. `w-[16px]` -> `w-4`
        rootFontSize: 16,
      },
    },
    rules: {
      // Line wrapping is left to prettier
      "better-tailwindcss/enforce-consistent-line-wrapping": "off",
      "better-tailwindcss/no-unknown-classes": "error",
    },
  },
]);
