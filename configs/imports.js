import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import importPlugin from "eslint-plugin-import-x";
import { defineConfig } from "eslint/config";
import { fileURLToPath } from "node:url";

const typescriptParserPath = fileURLToPath(
  import.meta.resolve("@typescript-eslint/parser"),
);

export default defineConfig([
  {
    name: "oBusk Import Rules",
    extends: [
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
    ],
    settings: {
      "import-x/resolver-next": [createTypeScriptImportResolver()],
      // import-x's typescript preset names the parser by package name, which
      // import-x then has to resolve from ESLint, the linted file or itself.
      // With strict installs (pnpm) none of those can see our dependency, so
      // parsing imported TS modules fails. Clear the by-name entry and map the
      // extensions to our own copy instead, which is the same parser ESLint uses
      // for TS files through eslint-config-next.
      "import-x/parsers": {
        "@typescript-eslint/parser": [],
        [typescriptParserPath]: [".ts", ".tsx", ".cts", ".mts"],
      },
    },
    rules: {
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
      // Sort imports to sort import members
      "sort-imports": [
        "error",
        { ignoreCase: true, ignoreDeclarationSort: true },
      ],
    },
  },
]);
