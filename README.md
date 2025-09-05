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

This config automatically respects your project's `.gitignore` (via `includeIgnoreFile`) so files and folders you already ignore in Git (like `node_modules` or build outputs) are also ignored by ESLint without needing a separate ignore list.
