# @obusk/eslint-config-next

> A strict configuration for using Next.js and Tailwind

## Installation

```bash
npm install --save-dev @obusk/eslint-config-next
```

It expects ESLint 10, Next.js 16.4+, Tailwind CSS 4, TypeScript, Prettier and Jest in your project. See `peerDependencies` in `package.json` for the exact ranges.

## Usage

### ESLint Flat Config

This package exports a flat config by default. Add the following to your `eslint.config.js`:

```js
import obuskNext from "@obusk/eslint-config-next";

export default [...obuskNext];
```

### Project root

The config needs your project root to find your `.gitignore` files, your Tailwind CSS entry point and your Next.js `app`/`pages` directories. By default it guesses: the nearest directory containing a `package.json`, starting from where ESLint was started.

That guess is wrong when ESLint is started outside the project, typically in a monorepo: a lint-staged hook at the repository root, `npx eslint apps/web` from the root, or an editor opened at the root. To avoid guessing, pass the root explicitly with `createConfig`:

```js
import { createConfig } from "@obusk/eslint-config-next";

export default createConfig({ root: import.meta.dirname });
```

### Configuration

If your Tailwind CSS entry point isn't in one of the auto-detected locations (see below), point the config at it in your `eslint.config.js`:

```js
import obuskNext from "@obusk/eslint-config-next";
import path from "node:path";

export default [
  ...obuskNext,
  {
    settings: {
      "better-tailwindcss": {
        // Path to the file containing your `@import "tailwindcss";`. Relative
        // paths resolve against where ESLint was started, so make it absolute.
        entryPoint: path.join(import.meta.dirname, "src/app/globals.css"),
      },
    },
  },
];
```

- **`better-tailwindcss.entryPoint`** — `eslint-plugin-better-tailwindcss` needs the path to your Tailwind CSS entry point to resolve your theme. This config tries to auto-detect it at `app/globals.css`, `src/app/globals.css`, `styles/globals.css`, or `src/styles/globals.css` in your [project root](#project-root), but if your file lives elsewhere you must set it explicitly.

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

This config automatically respects your project's `.gitignore` files, the way git does.

How it works:

- Starting from your [project root](#project-root), it collects every `.gitignore` up to the repository root (the directory containing `.git`), and feeds them to ESLint via `includeIgnoreFile`.
- Each file's patterns are relative to that file, so `/dist` in the repository root's `.gitignore` only matches the root's `dist`.
- Outside a git repository, only the project root's own `.gitignore` is used. If there is none, ESLint just proceeds without extra ignore patterns.

This means a package in a monorepo (e.g. `packages/api`) gets both its own `.gitignore` and the repository root's. `.gitignore` files in subdirectories below the project root are not applied.

# License

ISC License © Oscar Busk
