const { readFileSync } = require("fs");
const { resolve } = require("path");

const packageJsonPath = resolve(__dirname, "package.json");
let eslintPeerDependency;

try {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  eslintPeerDependency = packageJson.peerDependencies?.eslint;
  if (!eslintPeerDependency) {
    throw new Error("Missing eslint peer dependency in package.json");
  }
} catch (error) {
  throw new Error(
    `[.pnpmfile.cjs] Failed to read eslint peer dependency: ${error.message}`,
  );
}

module.exports = {
  hooks: {
    /**
     * Adjust dependency manifests pulled by pnpm.
     * Removes deprecated @types/eslint as dependency, adds peer dependency to eslint instead.
     */
    readPackage(pkg) {
      if (pkg.dependencies && pkg.dependencies["@types/eslint"]) {
        console.log("[.pnpmfile.cjs] Removing @types/eslint from", pkg.name);
        delete pkg.dependencies["@types/eslint"];

        pkg.peerDependencies = pkg.peerDependencies ?? {};
        pkg.peerDependencies.eslint = eslintPeerDependency;
      }
      return pkg;
    },
  },
};
