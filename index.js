import { includeIgnoreFile } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import jest from "eslint-plugin-jest";
import jsdoc from "eslint-plugin-jsdoc";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import tailwind from "eslint-plugin-tailwindcss";
import testingLibrary from "eslint-plugin-testing-library";
import fs from "node:fs";
import path from "node:path";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

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

const projectRoot = findProjectRoot();
const gitignorePath = path.join(projectRoot, ".gitignore");
// Only include if the consumer project actually has a .gitignore
const gitignore = fs.existsSync(gitignorePath)
  ? includeIgnoreFile(gitignorePath, "Project .gitignore patterns")
  : null;

/**
 * @type {import("eslint").Linter.Config[]}
 */
const eslintConfig = [
  ...(gitignore ? [gitignore] : []),

  ...nextVitals,
  ...nextTs,

  ...compat.config({
    root: true,
    extends: ["plugin:import/recommended", "plugin:import/typescript"],
    plugins: ["testing-library", "@typescript-eslint/eslint-plugin"],
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
      "import/order": [
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
  }),

  // Disable triple-slash reference rule for the auto-generated Next.js env file.
  // next-env.d.ts is maintained by Next.js and can contain triple-slash references
  // (e.g. to ./.next/types/routes.d.ts) that are not intended to be rewritten.
  {
    files: ["next-env.d.ts", "**/next-env.d.ts"],
    rules: {
      "@typescript-eslint/triple-slash-reference": "off",
    },
  },

  // Tailwind
  ...tailwind.configs["flat/recommended"],
  {
    settings: {
      tailwindcss: { callees: ["clsx", "cx", "cva", "twMerge"] },
    },
  },

  // JSDoc
  jsdoc.configs["flat/recommended-typescript-flavor-error"],
  {
    files: ["**/*.ts?(x)"],
    plugins: {
      jsdoc,
    },
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
];

export default eslintConfig;
