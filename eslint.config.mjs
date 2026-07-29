import { defineConfig, includeIgnoreFile } from "@eslint/config-helpers";
import noJqueryPlugin from "eslint-plugin-no-jquery";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, ".gitignore");

export default defineConfig([
  {
    ignores: [
      "dist/**",
      "*.mjs",
    ],
  },
  includeIgnoreFile(gitignorePath),
  {
    plugins: {
      "no-jquery": noJqueryPlugin
    },
    rules: {
      indent: [2, 4],
      "vars-on-top": "off",
      "no-restricted-syntax": "off",
      "guard-for-in": "off",
      "no-useless-concat": "off",
      "operator-linebreak": "off",
      "no-plusplus": "off",
      "block-scoped-var": "off",
      "func-names": "off",
      "no-continue": "off",
      "no-bitwise": "warn",
      "no-mixed-operators": "warn",
      "one-var": "off",
      "one-var-declaration-per-line": "off",
      "max-len": ["error", { code: 180 }],
      "no-param-reassign": "warn",
      "no-else-return": "warn",
      "no-underscore-dangle": "off",
      "no-unneeded-ternary": "off",
      "no-jquery/variable-pattern": "error"
    },
  }
]);
