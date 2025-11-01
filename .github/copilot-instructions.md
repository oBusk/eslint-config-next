# Copilot Instructions for @obusk/eslint-config-next

## Repository Overview

This is an ESLint configuration package for Next.js projects with Tailwind CSS. It's a **single-file npm package** that exports a strict, opinionated ESLint flat config for TypeScript, React, Next.js, Tailwind, Jest, and Testing Library.

**Key Facts:**

- **Type:** npm package (ESLint shareable config)
- **Language:** JavaScript (ES modules) with TypeScript type definitions
- **Size:** ~130 lines of code (index.js + index.d.ts)
- **Package Manager:** pnpm 10.20.0
- **Node Version:** v22.21.0 (specified in .nvmrc)
- **Main Files:** index.js (config), index.d.ts (types), package.json
- **License:** ISC

## Build & Validation Commands

### Environment Setup

**CRITICAL:** Always install pnpm first if not available:

```bash
npm install -g pnpm@10.20.0
```

### Installation

**ALWAYS run this first before any other commands:**

```bash
pnpm install --frozen-lockfile
```

**Time:** ~30 seconds. This installs 600+ packages and sets up git hooks.

**Note:** You may see warnings about unrs-resolver postinstall script and ignored build scripts (sharp). These are expected and don't indicate failure.

### Validation Commands

Run these commands **in this exact order** to validate changes:

1. **Type Checking** (fastest, run first):

```bash
pnpm run typecheck
```

- Runs: `tsc --noEmit`
- Time: <5 seconds
- Checks: index.js (with checkJs) and index.d.ts

2. **Code Formatting Check**:

```bash
pnpm run prettier
```

- Runs: `prettier **/*.{md,js,json,yaml,yml} --ignore-path .gitignore --ignore-path .prettierignore --check`
- Time: <5 seconds
- Checks: All markdown, JavaScript, JSON, YAML files

**To auto-fix formatting issues:**

```bash
pnpm run prettier-fix
```

3. **Package Integrity** (optional):

```bash
pnpm pack
```

- Creates: obusk-eslint-config-next-{version}.tgz
- Time: <5 seconds
- **Important:** Add `/*.tgz` to .gitignore (already done) to prevent committing tarballs

### Pre-commit Hooks

The repository uses `simple-git-hooks` and `lint-staged`:

- **Trigger:** Automatically on `git commit`
- **Actions:**
  - Runs prettier on staged files
  - Runs typecheck on index.js and \*.ts files
- **Config:** See `lint-staged` in package.json

## GitHub Actions CI/CD

### Workflow: checks.yml (runs on every push/PR)

**Jobs:**

1. **typecheck**: Runs `pnpm run typecheck`
2. **prettier**: Runs `pnpm run prettier`

Both jobs:

- Use Node version from .nvmrc
- Install dependencies with `pnpm install --frozen-lockfile`
- Must pass for PR to merge

### Workflow: test.yml (runs on every push/PR)

**Purpose:** Tests the config package against a real Next.js project

**Steps:**

1. Clones this config repo to `./config`
2. Clones test project (oBusk/warcraftlogs-search) to `./test`
3. In config: runs `pnpm install --frozen-lockfile` then `pnpm pack`
4. In test: runs `npm install` then installs the packed .tgz
5. In test: runs `npm run lint` (uses this config)
6. **Timeout:** 5 minutes
7. **Environment:** CI=true

**Important:** Changes to index.js must not break linting in the test project.

### Workflow: publish.yml (runs on version tags)

**Trigger:** Push tags matching `v*`
**Actions:** Publishes to npm after validating prettier and typecheck

## Project Structure

### Root Directory Files

```
.editorconfig          - Editor settings (2-space indent, LF, UTF-8)
.gitattributes         - Git line ending settings
.gitignore             - Excludes node_modules, *.tgz
.nvmrc                 - Node version (v22.21.0)
.prettierignore        - Excludes pnpm-lock.yaml from formatting
index.js               - Main ESLint config export (127 lines)
index.d.ts             - TypeScript type definitions (5 lines)
package.json           - Package manifest
pnpm-lock.yaml         - Locked dependency versions
pnpm-workspace.yaml    - pnpm workspace config (detailed security settings)
tsconfig.json          - TypeScript config for type checking
LICENSE                - ISC License
README.md              - User documentation
```

### Key Source File: index.js

**Architecture:**

- Exports an array of ESLint flat config objects
- Imports and composes multiple ESLint plugins/configs
- Uses `FlatCompat` for legacy config compatibility
- Includes logic to find and respect consumer's .gitignore

**Main Components:**

1. **findProjectRoot()**: Walks up from cwd to find package.json
2. **gitignore handling**: Uses `includeIgnoreFile` if .gitignore exists
3. **Config composition**:
   - Next.js configs (core-web-vitals, typescript)
   - Import plugin (with ordering rules)
   - TypeScript rules (consistent-type-imports, no-unused-vars)
   - Tailwind plugin
   - JSDoc plugin
   - Jest + Testing Library
   - Prettier (last, for formatting)

**Important Rules:**

- Enforces `type` imports with inline syntax
- Strict import ordering (builtin/external → internal → parent → sibling → index)
- Alphabetized imports
- React leak detection
- Custom Tailwind callees: clsx, cx, cva, twMerge

### Configuration Files

- **tsconfig.json**: Uses node20 module resolution, checks JS files
- **pnpm-workspace.yaml**:
  - Security: minimumReleaseAge (72 hours), onlyBuiltDependencies whitelist
  - No package hoisting (empty hoistPattern/publicHoistPattern)
  - ignoreWorkspaceRootCheck: true (root is also a package)
- **.editorconfig**: 2-space indent, 80 char max line length

### Dependencies

**Production (bundled with package):**

- ESLint plugins: import, jest, jsdoc, prettier, tailwindcss, testing-library
- TypeScript ESLint parser and plugin
- eslint-config-next, eslint-config-prettier
- @eslint/compat, @eslint/eslintrc (for compatibility)

**Peer Dependencies (required by consumers):**

- eslint ^9.0.0
- next >=15.3.0
- prettier >=3.0.0
- tailwindcss ^3.4.0
- typescript ~5.9.0

**Dev Dependencies:**

- prettier, typescript (for validation)
- lint-staged, simple-git-hooks (for pre-commit)
- @types/node (for type checking)

## Common Pitfalls & Workarounds

### 1. pnpm Not Installed

**Error:** `bash: pnpm: command not found`
**Fix:** Run `npm install -g pnpm@10.20.0` first

### 2. Formatting Failures

**Error:** Prettier check fails
**Fix:** Run `pnpm run prettier-fix` then commit changes

### 3. TypeScript Errors in index.js

**Note:** index.js is checked with `checkJs: true` in tsconfig.json
**Fix:** Ensure JSDoc types are correct or add `@ts-ignore` comments if needed

### 4. Generated \*.tgz Files

**Issue:** `pnpm pack` creates tarball that shouldn't be committed
**Prevention:** Already in .gitignore as `/*.tgz`

### 5. Test Workflow Dependencies

**Note:** test.yml depends on an external repository (oBusk/warcraftlogs-search)
**Impact:** Changes must maintain compatibility with that project's setup

## Making Changes

### For Code Changes (index.js):

1. Make minimal changes to index.js
2. Run `pnpm run typecheck` (catches type errors)
3. Run `pnpm run prettier-fix` (auto-formats)
4. Run `pnpm run prettier` (verifies formatting)
5. Test locally if possible with a Next.js project
6. Commit (pre-commit hooks run automatically)

### For Documentation Changes:

1. Edit README.md or other .md files
2. Run `pnpm run prettier-fix`
3. Commit

### For Configuration Changes:

1. Edit package.json, tsconfig.json, etc.
2. Run full validation suite (typecheck + prettier)
3. Test with `pnpm pack` if package.json changed
4. Commit

## Trust These Instructions

The commands and sequences documented here have been validated against the actual repository state. Only perform additional searches if:

- Instructions are incomplete for your specific task
- Commands fail with unexpected errors
- Repository structure has changed significantly

**Validation Date:** 2025-11-01
