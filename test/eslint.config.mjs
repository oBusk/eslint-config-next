// @ts-check
import nextObusk from "@obusk/eslint-config-next";
import { defineConfig } from "eslint/config";

const eslintConfig = defineConfig(nextObusk, {
  settings: {
    react: { version: "19" },
    tailwindcss: {
      functions: ["clsx", "cx", "cva", "twMerge"],
      parseKeyFunctions: ["clsx", "cx", "cva"],
      cssConfigPath: "app/globals.css",
    },
  },
});

export default eslintConfig;
