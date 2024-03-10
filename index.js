/** @type {import("eslint").ESLint.ConfigData} */
module.exports = {
  root: true,
  extends: [
    "next",
    "next/core-web-vitals",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:tailwindcss/recommended",
    "plugin:jsdoc/recommended-typescript-error",
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
        pathGroups: [
          {
            pattern: "^/**",
            group: "internal",
          },
        ],
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
        "newlines-between": "never",
        warnOnUnassignedImports: true,
      },
    ],
    "jsdoc/no-undefined-types": 1,
    "jsdoc/require-jsdoc": 0,
    "jsdoc/require-param": 0,
    "jsdoc/require-returns": 0,
    "jsdoc/require-yields": 0,
    "jsdoc/tag-lines": ["error", "any", { startLines: 1, endLines: 0 }],
    "react/jsx-no-leaked-render": "error",
    // Sort imports to sort import members
    "sort-imports": [
      "error",
      { ignoreCase: true, ignoreDeclarationSort: true },
    ],
  },
  overrides: [
    {
      files: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
      extends: [
        "plugin:jest/recommended",
        "plugin:jest/style",
        "plugin:testing-library/react",
      ],
    },
  ],
  settings: {
    tailwindcss: {
      callees: ["clsx", "cx", "cva", "twMerge"],
    },
    jest: {
      // Trick to resolve jest from where executed (not from this project's node_modules)
      version: require("jest/package.json").version,
    },
  },
};
