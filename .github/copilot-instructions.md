# Copilot Agent Instructions for eslint-config-next

## Repository Overview

This is **@obusk/eslint-config-next** - an NPM package that provides a strict ESLint configuration for Next.js and Tailwind CSS projects. The package exports an ESLint flat config and is designed to be consumed by other projects as a dependency.

**Type**: ESM NPM package  
**Size**: Small repository (~20 files excluding node_modules)  
**Languages**: JavaScript (ES modules), TypeScript (type definitions)  
**Runtime**: Node.js ^24.11.0 (specified in devEngines, though older versions may work)  
**Package Manager**: pnpm v10.20.0 (required)

## Environment Requirements

**ALWAYS use pnpm for all package management operations.** The repository uses:

- Node.js ^24.11.0 (specified in package.json devEngines)
- pnpm v10.20.0 (specified in `packageManager` field)
- TypeScript ~5.9.0
- Git with LF line endings (enforced via .gitattributes)

## Project Structure

### Root Files

- `index.js` - Main ESLint config export (ESM module)
- `index.d.ts` - TypeScript type definitions
- `package.json` - Package manifest and scripts
- `tsconfig.json` - TypeScript configuration for type checking
- `pnpm-workspace.yaml` - Workspace configuration (includes test/ subdirectory)
- `.pnpmfile.cjs` - Custom pnpm hooks to remove deprecated @types/eslint

### Configuration Files

- `.editorconfig` - Editor settings (2 spaces, LF, UTF-8, max line 80)
- `.prettierignore` - Prettier ignore patterns (only pnpm-lock.yaml)
- `.gitignore` - Git ignore patterns (node_modules/, \*.tgz)
- `.gitattributes` - Forces LF line endings for all text files

### Workspace Structure

```
/
├── index.js              # Main config file (~127 lines)
├── index.d.ts            # Type definitions (~5 lines)
├── test/                 # Test workspace package
│   ├── package.json
│   ├── eslint.config.mjs
│   ├── index.ts
│   └── tsconfig.json
├── .github/
│   └── workflows/
│       ├── checks.yml        # Typecheck, prettier, validate
│       ├── test.yml          # Integration test
│       ├── publish.yml       # NPM publish on tag
│       └── copilot-setup-steps.yml
└── package.json
```

### Key Architectural Components

**Main config (index.js)**:

- Uses ESLint flat config format
- Combines configs from: next/core-web-vitals, next/typescript, typescript-eslint, import, jest, testing-library, tailwindcss, jsdoc, prettier
- Implements custom `.gitignore` file resolution that walks up from process.cwd() to find project root
- Disables triple-slash reference rule for next-env.d.ts files

**Dependencies**: The package has 12 direct dependencies (all ESLint plugins/configs) and 6 devDependencies. It declares peer dependencies on: eslint ^9.0.0, jest, next >=15.3.0, prettier >=3.0.0, tailwindcss ^3.4.0, typescript ~5.9.0.

## Build and Validation Commands

### Installation and Setup

**ALWAYS run this first after cloning:**

```bash
pnpm install --frozen-lockfile
```

- Time: ~2-5 seconds (dependencies already present)
- Note: You may see warnings about ignored build scripts (e.g., sharp) - this is expected and safe to ignore
- NEVER use `npm install` or `yarn install`

**Setup git hooks (optional, for pre-commit validation):**

```bash
pnpm exec simple-git-hooks
```

This sets up the pre-commit hook to run `pnpm run lint-staged` automatically.

### Validation Commands

**Type checking** (runs in CI):

```bash
pnpm run typecheck
```

- Time: < 5 seconds
- Checks: Validates index.js (with allowJs) and index.d.ts
- No output means success

**Code formatting check** (runs in CI):

```bash
pnpm run prettier
```

- Time: < 5 seconds
- Checks: All .md, .js, .mjs, .cjs, .ts, .mts, .cts, .json, .yaml, .yml files
- Uses both .gitignore and .prettierignore
- Output: "All matched files use Prettier code style!" means success

**Fix formatting issues:**

```bash
pnpm run prettier-fix
```

- Automatically formats all files according to Prettier rules

**Config validation** (runs in CI):

```bash
pnpm run -r print-config
```

- Time: < 5 seconds
- Runs: `eslint --print-config index.ts` in the test/ workspace
- Purpose: Validates that the ESLint config loads successfully and can be parsed
- Output: JSON config dump (very long, ~3000 lines) - this is expected
- Warnings about React version or Pages directory are expected and harmless

**Lint staged files** (runs on pre-commit):

```bash
pnpm run lint-staged
```

- Runs prettier and typecheck on staged files only
- Configured in package.json under "lint-staged"

### Testing

The repository uses **integration testing** rather than unit tests. The test workflow:

1. Checks out this repository to `config/` directory
2. Checks out test repository (oBusk/warcraftlogs-search) to `test/` directory
3. Installs dependencies in config/
4. Packs this package: `pnpm pack` (creates .tgz file)
5. Installs packed package in test repository
6. Runs linting: `npm run lint` in test repository

**To run local test validation:**

```bash
cd test
pnpm run lint
```

- Time: < 5 seconds
- Expected warnings: React version detection, Pages directory not found - these are harmless
- Exit code 0 means success

**To run config printing (useful for debugging):**

```bash
cd test
pnpm run print-config
```

### Publishing

Package publishing happens automatically via GitHub Actions when a tag is pushed:

- Creates tarball with `pnpm pack`
- Publishes to npm with appropriate dist-tag (latest for stable, next for pre-release)
- No manual publish commands needed

### All Validation Commands In Order

When making changes to the main config or type definitions:

```bash
pnpm install --frozen-lockfile   # If dependencies changed
pnpm run typecheck               # Validate types
pnpm run prettier                # Check formatting
pnpm run -r print-config         # Validate config loads
cd test && pnpm run lint         # Test in consumer context
```

Total time: ~15-20 seconds

## GitHub Workflows and CI/CD

### checks.yml (runs on push/PR)

Three parallel jobs:

1. **typecheck**: Runs `pnpm run typecheck`
2. **prettier**: Runs `pnpm run prettier`
3. **validate**: Runs `pnpm run -r print-config`

All use `oBusk/action-pnpm-setup@v1` which automatically installs correct Node.js and pnpm versions.

### test.yml (runs on push/PR)

- Timeout: 5 minutes
- Integration test with external repository
- Verifies the config works in a real Next.js project

### publish.yml (runs on tag push)

- Validates formatting and types before publishing
- Auto-determines dist-tag based on version (pre-release gets "next", stable gets "latest")
- Uses OIDC for secure npm authentication

### copilot-setup-steps.yml

- Runs on workflow_dispatch or when the workflow file itself changes
- Simply checks out code and runs `oBusk/action-pnpm-setup@v1`

## Common Patterns and Important Notes

### Making Code Changes

1. **DO NOT** modify anything in node_modules/ - these are dependencies
2. **DO NOT** commit .tgz files - they are built artifacts
3. **ALWAYS** run typecheck and prettier after changes to index.js or index.d.ts
4. **ALWAYS** test in the test/ workspace after changes
5. **DO NOT** add new dependencies without carefully considering peer dependency implications

### Formatting and Style

- 2 spaces indentation (enforced by .editorconfig and prettier)
- Max line length: 80 characters
- LF line endings (enforced by .gitattributes)
- Trailing commas, semicolons as per prettier defaults
- Double quotes for strings

### TypeScript Notes

- `tsconfig.json` uses "nodenext" module resolution
- `allowJs: true` and `checkJs: true` enable type checking for index.js
- Type checking runs on JavaScript files using JSDoc comments
- The config validates types but never emits compiled output (`noEmit: true`)

### pnpm Workspace Configuration

- The root package and test/ are in a monorepo workspace
- `ignoreWorkspaceRootCheck: true` allows adding packages to root
- Most packages NOT hoisted (publicHoistPattern: [])
- Only specific packages hoisted for test workspace compatibility
- Supply chain security enabled:
  - Only whitelisted packages can run install scripts
  - 72-hour minimum release age for new packages

### Common Pitfalls

1. **Using npm instead of pnpm**: Will fail because of workspace configuration and missing pnpm-lock.yaml changes
2. **Forgetting --frozen-lockfile**: May cause lockfile drift in CI
3. **Not running typecheck on index.js changes**: TypeScript validates JavaScript via JSDoc, catches type errors
4. **Ignoring prettier warnings**: CI will fail if files are not formatted
5. **Breaking the .gitignore resolution logic**: The findProjectRoot() function is critical for the config to work in consumer projects

### Git Hooks

Pre-commit hook runs:

- Prettier formatting on staged files
- TypeScript type checking on staged .js, .ts files

If pre-commit hook fails, fix the issues and re-stage files before committing.

## Trust These Instructions

These instructions have been validated by running all commands in sequence and observing their behavior. When working with this repository:

1. Follow the command sequences exactly as documented
2. Expect the output and timing mentioned
3. Only explore further if commands fail unexpectedly or instructions seem incorrect
4. The test workspace warnings about React and Pages directory are expected and harmless

## Quick Reference

```bash
# Initial setup
pnpm install --frozen-lockfile

# Validation (do this before committing)
pnpm run typecheck
pnpm run prettier
pnpm run -r print-config

# Fix formatting
pnpm run prettier-fix

# Test in consumer context
cd test && pnpm run lint

# Setup git hooks (optional)
pnpm exec simple-git-hooks
```
