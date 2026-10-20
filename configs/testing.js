import jest from "eslint-plugin-jest";
import testingLibrary from "eslint-plugin-testing-library";
import { defineConfig } from "eslint/config";

export default defineConfig([
  jest.configs["flat/recommended"],
  jest.configs["flat/style"],
  testingLibrary.configs["flat/react"],
]);
