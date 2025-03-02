# @obusk/eslint-config-next

> A strict configuration for using Next.js and Tailwind

## Installation

```bash
npm install --save-dev @obusk/eslint-config-next
```

## Usage

### ESLint Flat Config (recommended)

This package exports a flat config by default. Add the following to your `eslint.config.js`:

```js
import obuskNext from "@obusk/eslint-config-next";

export default [...obuskNext];
```

### Legacy Config

Add the following to your `.eslintrc` file:

```json
{
  "extends": "@obusk/next"
}
```
