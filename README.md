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

### Ignored Files

This config automatically respects your project's `.gitignore`.

How it works:

- At load time it walks upward from `process.cwd()` until it finds the nearest `package.json` (your project root).
- If a `.gitignore` exists in that root, those patterns are fed to ESLint via `includeIgnoreFile`.
- If no `.gitignore` is found, nothing breaks—ESLint just proceeds without extra ignore patterns.

This means you can run `eslint` from a subdirectory (e.g. `packages/api`) and it will still resolve the root `.gitignore` of the repository—mirroring how tools like ESLint/Jest discover project roots.
