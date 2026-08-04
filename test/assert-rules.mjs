import { ESLint } from "eslint";

const cases = [
  {
    name: "type-only imports must use the type keyword",
    filename: "src/case.ts",
    code: `import { BadgeData } from "./format";\nexport const a: BadgeData | null = null;\n`,
    expected: "@typescript-eslint/consistent-type-imports",
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
    name: "conditional renders must not leak falsy values",
    filename: "src/case.tsx",
    code: `export function C({ n }: { n: number }) {\n  return <div>{n && <span>x</span>}</div>;\n}\n`,
    expected: "react/jsx-no-leaked-render",
  },
  {
    name: "contradicting tailwind classes are rejected",
    filename: "src/case.tsx",
    code: `export function C() {\n  return <div className="p-2 p-4" />;\n}\n`,
    expected: "tailwindcss/no-contradicting-classname",
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

for (const { name, filename, code, expected } of cases) {
  const [result] = await eslint.lintText(code, { filePath: filename });
  const fired = new Set(result.messages.map((m) => m.ruleId));

  if (!fired.has(expected)) {
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
