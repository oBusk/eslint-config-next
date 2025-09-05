import { FlatCompat } from "@eslint/eslintrc";
import jest from "eslint-plugin-jest";
import jsdoc from "eslint-plugin-jsdoc";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import tailwind from "eslint-plugin-tailwindcss";
import testingLibrary from "eslint-plugin-testing-library";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

/**
 * @type {import("eslint").Linter.Config[]}
 */
const eslintConfig = [
  ...compat.config({
    root: true,
    extends: [
      "next/core-web-vitals",
      "next/typescript",
      "plugin:import/recommended",
      "plugin:import/typescript",
    ],
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
