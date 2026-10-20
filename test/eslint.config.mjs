// @ts-check
import nextObusk from "@obusk/eslint-config-next";
import { defineConfig } from "eslint/config";

const eslintConfig = defineConfig(nextObusk, {
  settings: {
    "better-tailwindcss": {
      entryPoint: "app/globals.css",
    },
  },
});

export default eslintConfig;
