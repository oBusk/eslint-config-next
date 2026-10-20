# @obusk/eslint-config-next

> A strict configuration for using Next.js and Tailwind

## Installation

```bash
npm install --save-dev @obusk/eslint-config-next
```

## Usage

### ESLint Flat Config

This package exports a flat config by default. Add the following to your `eslint.config.js`:

```js
import obuskNext from "@obusk/eslint-config-next";

export default [...obuskNext];
```

### Configuration

To use this preset, add a config object with the following `settings` to your `eslint.config.js`:

```js
import obuskNext from "@obusk/eslint-config-next";

export default [
  ...obuskNext,
  {
    settings: {
      react: {
        version: "19", // The React version used by your project
      },
      "better-tailwindcss": {
        // Path to the file containing your `@import "tailwindcss";`
        entryPoint: "src/app/globals.css",
      },
    },
  },
];
```

- **`react.version`** — `eslint-plugin-react` needs to know which React version you're targeting. Without it you'll get a "React version not specified" warning and some rules may misbehave.
- **`better-tailwindcss.entryPoint`** — `eslint-plugin-better-tailwindcss` needs the path to your Tailwind CSS entry point to resolve your theme. This config tries to auto-detect it at `app/globals.css`, `src/app/globals.css`, `styles/globals.css`, or `src/styles/globals.css`, but if your file lives elsewhere you must set it explicitly.

### Unknown Tailwind classes

`better-tailwindcss/no-unknown-classes` is an error: every class name must be known to Tailwind. If you need custom classes, either:

- Define them with [`@utility`](https://tailwindcss.com/docs/adding-custom-styles#adding-custom-utilities) (preferred — works with variants, sorting and conflict detection), or
- Define them inside [`@layer components`](https://tailwindcss.com/docs/adding-custom-styles#adding-component-classes) in your entry point (or a file it `@import`s). Note that moving existing unlayered CSS into a layer lets utilities override it.

Classes you can't move, e.g. from third-party libraries, can be ignored with regex patterns:

```js
{
  rules: {
    "better-tailwindcss/no-unknown-classes": ["error", { ignore: ["^rdp-"] }],
  },
}
```

### Ignored Files

This config automatically respects your project's `.gitignore`.

How it works:

- At load time it walks upward from `process.cwd()` until it finds the nearest `package.json` (your project root).
- If a `.gitignore` exists in that root, those patterns are fed to ESLint via `includeIgnoreFile`.
- If no `.gitignore` is found, nothing breaks—ESLint just proceeds without extra ignore patterns.

This means you can run `eslint` from a subdirectory (e.g. `packages/api`) and it will still resolve the root `.gitignore` of the repository—mirroring how tools like ESLint/Jest discover project roots.

# License

ISC License © Oscar Busk
