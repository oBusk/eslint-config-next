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
    name: "formatting is enforced through prettier",
    filename: "src/case.ts",
    code: `export const a = {b:1,c:2}\n`,
    expected: "prettier/prettier",
  },
];

const eslint = new ESLint({ cwd: import.meta.dirname });
const failures = [];

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
