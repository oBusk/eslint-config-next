import { FlatCompat } from "@eslint/eslintrc";
import { getJestVersion } from "./utils.js";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const eslintConfig = [
  ...compat.config({
    root: true,
    extends: [
      "next",
      "next/core-web-vitals",
      "plugin:import/recommended",
      "plugin:import/typescript",
      "plugin:tailwindcss/recommended",
      "plugin:jsdoc/recommended-typescript-flavor-error",
      "plugin:prettier/recommended",
    ],
    plugins: ["jest", "testing-library", "@typescript-eslint/eslint-plugin"],
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          disallowTypeAnnotations: true,
          fixStyle: "inline-type-imports",
        },
      ],
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
    overrides: [
      {
        files: [
          "**/__tests__/**/*.[jt]s?(x)",
          "**/?(*.)+(spec|test).[jt]s?(x)",
        ],
        extends: [
          "plugin:jest/recommended",
          "plugin:jest/style",
          "plugin:testing-library/react",
        ],
      },
      {
        files: ["**/*.ts?(x)"],
        extends: ["plugin:jsdoc/recommended-typescript-error"],
        rules: {
          "jsdoc/no-undefined-types": 1,
          "jsdoc/require-jsdoc": 0,
          "jsdoc/require-param": 0,
          "jsdoc/require-returns": 0,
          "jsdoc/require-yields": 0,
          "jsdoc/tag-lines": ["error", "any", { startLines: 1, endLines: 0 }],
        },
      },
    ],
    settings: {
      tailwindcss: { callees: ["clsx", "cx", "cva", "twMerge"] },
      jest: { version: getJestVersion() },
    },
  }),
];

export default eslintConfig;
