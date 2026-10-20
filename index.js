import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import { defineConfig } from "eslint/config";
import imports from "./configs/imports.js";
import jsdoc from "./configs/jsdoc.js";
import next from "./configs/next.js";
import project from "./configs/project.js";
import tailwind from "./configs/tailwind.js";
import testing from "./configs/testing.js";

/**
 * @type {import("eslint").Linter.Config[]}
 */
const eslintConfig = defineConfig([
  project,
  next,
  imports,
  tailwind,
  jsdoc,
  testing,
  // Prettier must come last to turn off rules that conflict with formatting
  eslintPluginPrettierRecommended,
]);

export default eslintConfig;
