import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import importPlugin from "eslint-plugin-import-x";
import { defineConfig } from "eslint/config";
import fs from "node:fs";
import { projectRoot } from "./project.js";

/**
 * Escape a path for use as a glob in `settings.next.rootDir`. The Next plugin
 * turns backslashes into slashes before globbing, so special characters are
 * wrapped in a character class instead (`(` -> `[(]`). `!` is left alone,
 * since `[!]` starts a negated class and `!` is only special before `(`.
 * @param {string} p
 * @returns {string}
 */
function escapeGlob(p) {
  return p.replace(/[()[\]{}*?+@,]/g, "[$&]");
}

/**
 * Replace eslint-plugin-import with eslint-plugin-import-x in a config object.
 * eslint-plugin-import crashes on ESLint 10. Its rules are renamed to their
 * import-x equivalent (or dropped if import-x has none), while its settings are
 * dropped since import-x resolvers are configured separately.
 * @param {import("eslint").Linter.Config} config
 * @returns {import("eslint").Linter.Config}
 */
function withImportX({ plugins, settings, rules, ...config }) {
  /** @param {string} key */
  const isImport = (key) => key === "import" || key.startsWith("import/");
  /** @param {Record<string, any>} obj */
  const omitImport = (obj) =>
    Object.fromEntries(Object.entries(obj).filter(([key]) => !isImport(key)));

  return {
    ...config,
    ...(plugins && { plugins: omitImport(plugins) }),
    ...(settings && { settings: omitImport(settings) }),
    ...(rules && {
      rules: Object.fromEntries(
        Object.entries(rules).flatMap(([key, value]) => {
          if (!isImport(key)) return [[key, value]];
          const name = key.slice("import/".length);
          return importPlugin.rules?.[name]
            ? [[`import-x/${name}`, value]]
            : [];
        }),
      ),
    }),
  };
}

export default defineConfig([
  {
    name: "oBusk Next.js + TypeScript",
    extends: [nextVitals.map(withImportX), nextTs],
    settings: {
      // The Next plugin looks for pages/ and app/ relative to ESLint's cwd
      // unless told otherwise, which breaks when linting from a subdirectory
      // (realpath, as the glob matches escaped segments case-sensitively)
      next: { rootDir: escapeGlob(fs.realpathSync.native(projectRoot)) },
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
      "react/jsx-no-leaked-render": "error",
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
]);
