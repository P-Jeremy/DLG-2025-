import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-config-prettier";

export default [
  js.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: [
          "./tsconfig.json",
          "./backend/tsconfig.json",
          "./frontend/tsconfig.json",
        ],
        sourceType: "module",
        ecmaVersion: 2022,
        ecmaFeatures: { jsx: true },
      },
      globals: {
        process: "readonly",
        require: "readonly",
        module: "readonly",
        __dirname: "readonly",
        console: "readonly",
        fetch: "readonly",
      },
    },
    plugins: { "@typescript-eslint": tseslint },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...tseslint.configs["recommended-type-checked"].rules,
      // Allègement des règles trop strictes ou inutiles pour la productivité
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/no-unnecessary-type-assertion": "warn",
    },
  },
  {
    files: ["**/*.tsx", "**/*.jsx"],
    languageOptions: {
      globals: {
        React: "readonly",
        fetch: "readonly",
        document: "readonly",
      },
    },
    plugins: { react, "react-hooks": reactHooks },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      // Allègement React
      "react/react-in-jsx-scope": "off",
    },
    settings: {
      react: { version: "detect" },
    },
  },
  prettier,
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "**/setup*.ts", "**/global*.ts"],
    languageOptions: {
      globals: {
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        jest: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
    },
  },
  {
    ignores: ["dist/", "backend/dist/", "node_modules/", "**/*.d.ts"],
  },
];
