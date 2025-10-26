import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // ABACO Platform - Enhanced code quality rules
      "prefer-const": "error",
      "no-unused-vars": "error",
      "no-duplicate-imports": "error",

      // String literal duplication prevention
      "no-duplicate-string": "off", // Handled by SonarLint

      // Import organization
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],

      // TypeScript specific rules for ABACO - with fallbacks
      
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }], // Allow unused parameters prefixed with underscore
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/no-explicit-any": "warn",

      // Next.js specific optimizations
      "@next/next/no-img-element": "error",
      "@next/next/no-page-custom-font": "warn",
      
      // ABACO specific rules for financial platform
      "no-console": ["warn", { "allow": ["warn", "error"] }],
      "no-debugger": "error",
      "no-alert": "error",
    },
  },
  {
    // Additional configuration for ABACO financial components
    files: ["**/*.tsx", "**/*.ts"],
    rules: {
      // Enforce proper naming for ABACO components
      "react/jsx-pascal-case": "error",
      "react/prop-types": "off", // Using TypeScript instead
    },
  },
];

export default eslintConfig;
