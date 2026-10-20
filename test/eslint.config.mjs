// @ts-check
import nextObusk from "@obusk/eslint-config-next";
import { defineConfig } from "eslint/config";

// No extra settings: the fixture relies on the config's auto-detection
const eslintConfig = defineConfig(nextObusk);

export default eslintConfig;
