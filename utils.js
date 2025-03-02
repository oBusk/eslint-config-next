import { readFileSync } from "fs";

// Get jest version from the consuming project
export const getJestVersion = () => {
  try {
    const pkg = JSON.parse(
      readFileSync(
        new URL("jest/package.json", import.meta.resolve("jest")),
        "utf8",
      ),
    );
    return pkg.version;
  } catch {
    return "29.7.0";
  }
};
