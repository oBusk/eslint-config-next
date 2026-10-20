import { ESLint } from "eslint";

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
    name: "formatting is enforced through prettier",
    filename: "src/case.ts",
    code: `export const a = {b:1,c:2}\n`,
    expected: "prettier/prettier",
  },
];

const eslint = new ESLint({ cwd: import.meta.dirname });
const failures = [];

// eslint-plugin-react reports a missing/undetectable React version through
// console.error. Capture it so the "detect" default keeps working on ESLint 10.
const consoleErrors = [];
const originalConsoleError = console.error;
console.error = (...args) => consoleErrors.push(args.join(" "));

for (const { name, filename, code, expected, unexpected } of cases) {
  const [result] = await eslint.lintText(code, { filePath: filename });
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

console.error = originalConsoleError;

const reactVersionWarnings = [
  ...new Set(
    consoleErrors.filter((message) => message.includes("React version")),
  ),
];
if (reactVersionWarnings.length > 0) {
  failures.push(
    `React version should be detected without configuration\n    ${reactVersionWarnings.join("\n    ")}`,
  );
}

if (failures.length > 0) {
  console.error(
    `${failures.length} of ${cases.length} rule assertions failed:`,
  );
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  process.exit(1);
}

console.log(`All ${cases.length} rule assertions passed.`);
