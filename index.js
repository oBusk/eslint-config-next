import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import importPlugin from "eslint-plugin-import-x";
import jest from "eslint-plugin-jest";
import { jsdoc } from "eslint-plugin-jsdoc";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import tailwind from "eslint-plugin-tailwindcss";
import testingLibrary from "eslint-plugin-testing-library";
import { defineConfig, includeIgnoreFile } from "eslint/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Find the consumer project's root (nearest directory containing a package.json)
function findProjectRoot(start = process.cwd()) {
  let dir = start;
  while (true) {
    if (fs.existsSync(path.join(dir, "package.json"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return start; // Fallback: give up at filesystem root
    dir = parent;
  }
}

const typescriptParserPath = fileURLToPath(
  import.meta.resolve("@typescript-eslint/parser"),
);

const projectRoot = findProjectRoot();
const gitignorePath = path.join(projectRoot, ".gitignore");
// Only include if the consumer project actually has a .gitignore
const gitignore = fs.existsSync(gitignorePath)
  ? includeIgnoreFile(gitignorePath, "Project .gitignore patterns")
  : null;

/**
 * @type {import("eslint").Linter.Config[]}
 */
const eslintConfig = defineConfig([
  {
    // Define some guaranteed ignores to avoid unnecessary linting
    ignores: [
      "**/.next/**",
      "**/.vercel/**",
      "**/.turbo/**",
      "**/.claude/worktrees/**",
      "dist/**",
      "out/**",
      "coverage/**",
    ],
  },
  {
    // Avoid linting the config file itself to aovoid headaches
    ignores: ["eslint.config.mjs"],
  },
  ...(gitignore ? [gitignore] : []),

  {
    name: "oBusk Next.js Typescript + Sorting rules",
    extends: [
      nextVitals,
      nextTs,
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
    ],
    settings: {
      "import-x/resolver-next": [createTypeScriptImportResolver()],
      "import-x/parsers": {
        "@typescript-eslint/parser": [],
        [typescriptParserPath]: [".ts", ".tsx", ".cts", ".mts"],
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          disallowTypeAnnotations: true,
          fixStyle: "inline-type-imports",
        },
      ],
      "@typescript-eslint/no-empty-object-type": 0,
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", ignoreRestSiblings: true },
      ],
      "import-x/order": [
        "error",
        {
          groups: [
            ["builtin", "external"],
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          pathGroups: [{ pattern: "^/**", group: "internal" }],
          alphabetize: { order: "asc", caseInsensitive: true },
          "newlines-between": "never",
          warnOnUnassignedImports: true,
        },
      ],
      "react/jsx-no-leaked-render": "error",
      // Sort imports to sort import members
      "sort-imports": [
        "error",
        { ignoreCase: true, ignoreDeclarationSort: true },
      ],
    },
  },

  // Disable triple-slash reference rule for the auto-generated Next.js env file.
  // next-env.d.ts is maintained by Next.js and can contain triple-slash references
  // (e.g. to ./.next/types/routes.d.ts) that are not intended to be rewritten.
  {
    name: "next-env exceptions",
    files: ["next-env.d.ts", "**/next-env.d.ts"],
    rules: {
      "@typescript-eslint/triple-slash-reference": "off",
    },
  },

  // Tailwind
  {
    name: "oBusk Tailwind Config",
    extends: [/** @type {any} */ (tailwind.configs.recommended)],
    settings: {
      tailwindcss: {
        functions: ["clsx", "cx", "cva", "twMerge"],
        parseKeyFunctions: ["clsx", "cx"],
      },
    },
  },

  // JSDoc
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

  // Jest+Testing Library
  jest.configs["flat/recommended"],
  jest.configs["flat/style"],
  testingLibrary.configs["flat/react"],

  // Prettier
  eslintPluginPrettierRecommended,
]);

export default eslintConfig;
