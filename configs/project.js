import { defineConfig, includeIgnoreFile } from "eslint/config";
import fs from "node:fs";
import path from "node:path";

/**
 * Guess the consumer project's root: the nearest directory containing a
 * package.json, starting from where ESLint was started.
 */
export function findProjectRoot(start = process.cwd()) {
  let dir = start;
  while (true) {
    if (fs.existsSync(path.join(dir, "package.json"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return start; // Fallback: give up at filesystem root
    dir = parent;
  }
}

/**
 * Like git, find the .gitignore files from the project root up to the
 * repository root, so a package in a monorepo also gets the root's patterns.
 * Without a repository, only the project root's own .gitignore is used.
 * @param {string} root
 */
function findGitignores(root) {
  const gitignores = [];
  for (let dir = root; ; dir = path.dirname(dir)) {
    const gitignorePath = path.join(dir, ".gitignore");
    if (fs.existsSync(gitignorePath)) gitignores.push(gitignorePath);
    if (fs.existsSync(path.join(dir, ".git"))) return gitignores;
    if (path.dirname(dir) === dir) break; // Reached filesystem root
  }
  const ownGitignore = path.join(root, ".gitignore");
  return fs.existsSync(ownGitignore) ? [ownGitignore] : [];
}

/**
 * @param {string} root The project root
 */
export default function project(root) {
  const gitignores = findGitignores(root);

  return defineConfig([
    {
      // Define some guaranteed ignores to avoid unnecessary linting
      ignores: [
        "**/.next/**",
        "**/.vercel/**",
        "**/.turbo/**",
        "**/.claude/worktrees/**",
        "dist/**",
        "out/**",
        "coverage/**",
      ],
    },
    {
      // Avoid linting the config file itself to avoid headaches
      ignores: ["eslint.config.{js,mjs,cjs,ts,mts,cts}"],
    },
    ...(gitignores.length > 0
      ? includeIgnoreFile(gitignores, {
          name: "Project .gitignore patterns",
          // Patterns are relative to their .gitignore, not the ESLint config
          gitignoreResolution: true,
        })
      : []),
  ]);
}
