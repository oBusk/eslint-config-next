/**
 * Adjust dependency manifests pulled by pnpm.
 * Removes deprecated @types/eslint as dependency, adds peer dependency to eslint instead.
 */
module.exports = {
  hooks: {
    readPackage(pkg) {
      if (pkg.dependencies && pkg.dependencies["@types/eslint"]) {
        console.log("[.pnpmfile.cjs] Removing @types/eslint from", pkg.name);
        delete pkg.dependencies["@types/eslint"];

        pkg.peerDependencies = pkg.peerDependencies ?? {};
        if (!pkg.peerDependencies.eslint) {
          pkg.peerDependencies.eslint = "^9.0.0";
        }
      }
      return pkg;
    },
  },
};
