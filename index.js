import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import { defineConfig } from "eslint/config";
import fs from "node:fs";
import path from "node:path";
import imports from "./configs/imports.js";
import jsdoc from "./configs/jsdoc.js";
import next from "./configs/next.js";
import project, { findProjectRoot } from "./configs/project.js";
import tailwind from "./configs/tailwind.js";
import testing from "./configs/testing.js";

/**
 * Create the config for a project.
 * @param {import("./index.d.ts").ConfigOptions} [options]
 * @returns {import("eslint").Linter.Config[]}
 */
export function createConfig({ root } = {}) {
  const projectRoot = root ? path.resolve(root) : findProjectRoot();
  if (!fs.existsSync(projectRoot)) {
    throw new Error(
      `[@obusk/eslint-config-next] root does not exist: ${projectRoot}`,
    );
  }

  return defineConfig([
    project(projectRoot),
    next(projectRoot),
    imports,
    tailwind(projectRoot),
    jsdoc,
    testing,
    // Prettier must come last to turn off rules that conflict with formatting
    eslintPluginPrettierRecommended,
  ]);
}

/**
 * The config, with the project root guessed from where ESLint was started.
 * Use {@link createConfig} to pass the root explicitly.
 */
const eslintConfig = createConfig();

export default eslintConfig;
