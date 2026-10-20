// Check the package as it is published, not as the workspace links it: pack it,
// install the tarball into a copy of the test fixture outside the workspace,
// and lint that. Catches files missing from `files` or a broken `exports` map.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const fixtureDir = path.join(repoRoot, "test");
const workDir = fs.mkdtempSync(path.join(os.tmpdir(), "eslint-config-next-"));
const projectDir = path.join(workDir, "project");

/**
 * Run a command, printing it first.
 * @param {string} cwd The directory to run in
 * @param {string} command The command
 * @param {string[]} args Its arguments
 */
function run(cwd, command, args) {
  console.log(`$ ${command} ${args.join(" ")}`);
  execFileSync(command, args, { cwd, stdio: "inherit" });
}

/**
 * Run the pnpm that runs this script (`pnpm test:pack`), without a shell.
 * @param {string} cwd The directory to run in
 * @param {string[]} args pnpm's arguments
 */
function pnpm(cwd, args) {
  const pnpmPath = process.env.npm_execpath;
  if (!pnpmPath) throw new Error("Run this through pnpm: pnpm test:pack");
  if (/\.[cm]?js$/.test(pnpmPath)) {
    run(cwd, process.execPath, [pnpmPath, ...args]);
  } else {
    run(cwd, pnpmPath, args);
  }
}

try {
  pnpm(repoRoot, ["pack", "--pack-destination", workDir]);
  const tarball = fs.readdirSync(workDir).find((f) => f.endsWith(".tgz"));
  if (!tarball) throw new Error("pnpm pack did not produce a tarball");

  // The fixture, minus anything only the workspace setup needs
  fs.mkdirSync(projectDir);
  for (const entry of ["app", "src", "eslint.config.mjs", "tsconfig.json"]) {
    fs.cpSync(path.join(fixtureDir, entry), path.join(projectDir, entry), {
      recursive: true,
    });
  }
  const pkg = JSON.parse(
    fs.readFileSync(path.join(fixtureDir, "package.json"), "utf8"),
  );
  pkg.devDependencies["@obusk/eslint-config-next"] = `file:../${tarball}`;
  fs.writeFileSync(
    path.join(projectDir, "package.json"),
    JSON.stringify(pkg, null, 2),
  );

  // Same build-script approvals as this repo's pnpm-workspace.yaml
  fs.writeFileSync(
    path.join(projectDir, "pnpm-workspace.yaml"),
    [
      "allowBuilds:",
      '  "@parcel/watcher": true',
      "  sharp: false",
      "  unrs-resolver: true",
      "",
    ].join("\n"),
  );

  pnpm(projectDir, ["install"]);
  pnpm(projectDir, ["exec", "eslint", "--max-warnings", "0"]);

  // The types file the exports map points at was published
  const installed = path.join(
    projectDir,
    "node_modules",
    "@obusk",
    "eslint-config-next",
  );
  const installedPkg = JSON.parse(
    fs.readFileSync(path.join(installed, "package.json"), "utf8"),
  );
  const types = installedPkg.exports["."].types;
  if (!fs.existsSync(path.join(installed, types))) {
    throw new Error(`${types} is referenced by exports but not published`);
  }

  // Both exports resolve
  fs.writeFileSync(
    path.join(projectDir, "check-exports.mjs"),
    [
      'import obuskNext, { createConfig } from "@obusk/eslint-config-next";',
      'if (!Array.isArray(obuskNext)) throw new Error("default export is not a config array");',
      'if (typeof createConfig !== "function") throw new Error("createConfig is not exported");',
      "",
    ].join("\n"),
  );
  run(projectDir, process.execPath, ["check-exports.mjs"]);

  console.log("The packed package works.");
} finally {
  fs.rmSync(workDir, { recursive: true, force: true });
}
