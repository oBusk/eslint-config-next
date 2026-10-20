import { createConfig } from "@obusk/eslint-config-next";
import { ESLint } from "eslint";
import os from "node:os";
import path from "node:path";

const cases = [
  {
    name: "type-only imports must use the type keyword",
    filename: "src/case.ts",
    code: `import { BadgeData } from "./format";\nexport const a: BadgeData | null = null;\n`,
    expected: "@typescript-eslint/consistent-type-imports",
  },
  {
    name: "imports must be ordered",
    filename: "src/case.ts",
    code: `import { formatCount } from "./format";\nimport path from "node:path";\nexport const a = [formatCount, path];\n`,
    expected: "import-x/order",
  },
  {
    name: "import members must be sorted",
    filename: "src/case.ts",
    code: `import { formatCount, type BadgeData } from "./format";\nexport const a: BadgeData | null = formatCount ? null : null;\n`,
    expected: "sort-imports",
  },
  {
    name: "unused variables are rejected",
    filename: "src/case.ts",
    code: `const unused = 1;\nexport const a = 2;\n`,
    expected: "@typescript-eslint/no-unused-vars",
  },
  {
    name: "anonymous default exports are flagged",
    filename: "src/case.ts",
    code: `export default { a: 1 };\n`,
    expected: "import-x/no-anonymous-default-export",
  },
  {
    name: "eslint-plugin-import is not loaded (it crashes on ESLint 10)",
    filename: "src/case.ts",
    code: `export default { a: 1 };\n`,
    unexpected: "import/no-anonymous-default-export",
  },
  {
    name: "conditional renders must not leak falsy values",
    filename: "src/case.tsx",
    code: `export function C({ n }: { n: number }) {\n  return <div>{n && <span>x</span>}</div>;\n}\n`,
    expected: "react/jsx-no-leaked-render",
  },
  {
    name: "conflicting tailwind classes are rejected",
    filename: "src/case.tsx",
    code: `export function C() {\n  return <div className="p-2 p-4" />;\n}\n`,
    expected: "better-tailwindcss/no-conflicting-classes",
  },
  {
    name: "unknown tailwind classes are rejected",
    filename: "src/case.tsx",
    code: `export function C() {\n  return <div className="not-a-tailwind-class" />;\n}\n`,
    expected: "better-tailwindcss/no-unknown-classes",
  },
  {
    name: "component classes from @layer components are allowed",
    filename: "src/case.tsx",
    code: `export function C() {\n  return <div className="card flex" />;\n}\n`,
    unexpected: "better-tailwindcss/no-unknown-classes",
  },
  {
    name: "auto-detected tailwind entry point works when linting from a subdirectory",
    cwd: "src",
    filename: "case.tsx",
    code: `export function C() {\n  return <div className="card flex" />;\n}\n`,
    unexpected: "better-tailwindcss/no-unknown-classes",
  },
  {
    name: "px arbitrary values are canonicalized to the spacing scale",
    filename: "src/case.tsx",
    code: `export function C() {\n  return <div className="w-[16px]" />;\n}\n`,
    expected: "better-tailwindcss/enforce-canonical-classes",
  },
  {
    name: "JSDoc in TypeScript must not repeat types",
    filename: "src/case.ts",
    code: `/**\n * Doubles.\n *\n * @param {number} x The value\n */\nexport function f(x: number) {\n  return x * 2;\n}\n`,
    expected: "jsdoc/no-types",
  },
  {
    name: "JSDoc in TypeScript does not require types",
    filename: "src/case.ts",
    code: `/**\n * Doubles.\n *\n * @param x The value\n */\nexport function f(x: number) {\n  return x * 2;\n}\n`,
    unexpected: "jsdoc/require-param-type",
  },
  {
    name: "JSDoc in JavaScript requires types",
    filename: "src/case.js",
    code: `/**\n * Doubles.\n *\n * @param x The value\n * @returns {number} The doubled value\n */\nexport function f(x) {\n  return x * 2;\n}\n`,
    expected: "jsdoc/require-param-type",
  },
  {
    name: "jest rules apply to test files",
    filename: "src/case.test.ts",
    code: `it.only("works", () => {\n  expect(1).toBe(1);\n});\n`,
    expected: "jest/no-focused-tests",
  },
  {
    name: "jest rules apply to __tests__ directories",
    filename: "src/__tests__/case.ts",
    code: `it.only("works", () => {\n  expect(1).toBe(1);\n});\n`,
    expected: "jest/no-focused-tests",
  },
  {
    name: "jest rules do not apply outside tests",
    filename: "src/case.ts",
    code: `it.only("works", () => {\n  expect(1).toBe(1);\n});\n`,
    unexpected: "jest/no-focused-tests",
  },
  {
    name: "testing-library rules apply to test files",
    filename: "src/case.test.tsx",
    code: `import { render } from "@testing-library/react";\n\nit("renders", () => {\n  const screen = render(<div />);\n  expect(screen).toBeDefined();\n});\n`,
    expected: "testing-library/render-result-naming-convention",
  },
  {
    name: "testing-library rules do not apply outside tests",
    filename: "src/case.tsx",
    code: `import { render } from "./format";\n\nexport function C() {\n  const screen = render();\n  return <div>{String(screen)}</div>;\n}\n`,
    unexpected: "testing-library/render-result-naming-convention",
  },
  {
    // Also covers Next's app/ lookup, via the console checks below
    name: "createConfig({ root }) finds the tailwind entry point from the given root",
    explicitRoot: true,
    filename: "src/case.tsx",
    code: `export function C() {\n  return <div className="card flex" />;\n}\n`,
    unexpected: "better-tailwindcss/no-unknown-classes",
  },
  {
    name: "formatting is enforced through prettier",
    filename: "src/case.ts",
    code: `export const a = {b:1,c:2}\n`,
    expected: "prettier/prettier",
  },
];

const ignoreCases = [
  {
    name: "patterns from the repository root .gitignore apply, relative to it",
    path: "src/gitignored/case.ts",
    ignored: true,
  },
  {
    name: "anchored .gitignore patterns don't match elsewhere",
    path: "src/case.ts",
    ignored: false,
  },
  {
    name: "createConfig({ root }) finds .gitignore files from the given root",
    explicitRoot: true,
    path: "src/gitignored/case.ts",
    ignored: true,
  },
];

// createConfig({ root }) must not depend on where ESLint was started, so build
// it from an unrelated directory, where the guessed root would be wrong
const originalCwd = process.cwd();
process.chdir(os.tmpdir());
const explicitRootConfig = createConfig({ root: import.meta.dirname });
process.chdir(originalCwd);

// One ESLint instance per cwd, so cases can lint as if run from a subdirectory.
// Cases with `explicitRoot` use the config above instead of eslint.config.mjs.
const eslints = new Map();
const getESLint = ({ cwd = ".", explicitRoot = false } = {}) => {
  const key = `${cwd}|${explicitRoot}`;
  if (!eslints.has(key)) {
    eslints.set(
      key,
      new ESLint({
        cwd: path.resolve(import.meta.dirname, cwd),
        ...(explicitRoot && {
          overrideConfigFile: true,
          overrideConfig: explicitRootConfig,
        }),
      }),
    );
  }
  return eslints.get(key);
};
const failures = [];

// Some plugins report configuration problems on the console rather than as
// lint messages. Record it to assert on below, while still printing it.
const consoleMessages = [];
const originalConsole = { error: console.error, warn: console.warn };
for (const method of /** @type {const} */ (["error", "warn"])) {
  console[method] = (...args) => {
    consoleMessages.push(args.join(" "));
    originalConsole[method](...args);
  };
}

for (const { name, filename, code, expected, unexpected, ...opts } of cases) {
  const [result] = await getESLint(opts).lintText(code, { filePath: filename });
  const fired = new Set(result.messages.map((m) => m.ruleId));

  if (unexpected) {
    if (fired.has(unexpected)) {
      failures.push(`${name}\n    expected ${unexpected} not to fire`);
    }
  } else if (!fired.has(expected)) {
    const fatal = result.messages.filter((m) => m.fatal).map((m) => m.message);
    failures.push(
      `${name}\n    expected ${expected}, got ${[...fired].join(", ") || "no errors"}` +
        (fatal.length ? `\n    parse errors: ${fatal.join("; ")}` : ""),
    );
  }
}

for (const { name, path: filePath, ignored, ...opts } of ignoreCases) {
  if ((await getESLint(opts).isPathIgnored(filePath)) !== ignored) {
    failures.push(
      `${name}\n    expected ${filePath} to ${ignored ? "" : "not "}be ignored`,
    );
  }
}

Object.assign(console, originalConsole);

const consoleCases = [
  {
    // eslint-plugin-react's "detect" default must keep working on ESLint 10
    name: "React version should be detected without configuration",
    match: "React version",
  },
  {
    // The Next plugin must find app/ from the project root, not ESLint's cwd
    name: "Next.js app directory should be found from the project root",
    match: "Pages directory cannot be found",
  },
];

for (const { name, match } of consoleCases) {
  const warnings = [
    ...new Set(consoleMessages.filter((message) => message.includes(match))),
  ];
  if (warnings.length > 0) {
    failures.push(`${name}\n    ${warnings.join("\n    ")}`);
  }
}

if (failures.length > 0) {
  console.error(
    `${failures.length} of ${cases.length + ignoreCases.length + consoleCases.length} rule assertions failed:`,
  );
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  process.exit(1);
}

console.log(
  `All ${cases.length + ignoreCases.length + consoleCases.length} rule assertions passed.`,
);
