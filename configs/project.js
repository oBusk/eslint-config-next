import { defineConfig, includeIgnoreFile } from "eslint/config";
import fs from "node:fs";
import path from "node:path";

// Find the consumer project's root (nearest directory containing a package.json)
function findProjectRoot(start = process.cwd()) {
  let dir = start;
  while (true) {
    if (fs.existsSync(path.join(dir, "package.json"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return start; // Fallback: give up at filesystem root
    dir = parent;
  }
}

export const projectRoot = findProjectRoot();

const gitignorePath = path.join(projectRoot, ".gitignore");
// Only include if the consumer project actually has a .gitignore
const gitignore = fs.existsSync(gitignorePath)
  ? includeIgnoreFile(gitignorePath, "Project .gitignore patterns")
  : null;

export default defineConfig([
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
    ignores: ["eslint.config.mjs"],
  },
  ...(gitignore ? [gitignore] : []),
]);
