import { Linter } from "eslint";

export interface ConfigOptions {
  /**
   * The project root: the directory containing your `eslint.config.*`, which
   * is usually `import.meta.dirname`. Used to find `.gitignore` files, the
   * Tailwind CSS entry point and Next.js `app`/`pages` directories.
   *
   * Defaults to the nearest directory containing a `package.json`, starting
   * from where ESLint was started.
   */
  root?: string;
}

/**
 * Create the config for a project.
 */
export declare function createConfig(options?: ConfigOptions): Linter.Config[];

/**
 * The config, with the project root guessed from where ESLint was started.
 * Use {@link createConfig} to pass the root explicitly.
 */
declare const eslintConfig: Linter.Config[];

export default eslintConfig;
