module.exports = {
  env: { node: true },
  root: true,
  ignorePatterns: ["node_modules/", "dist/", "backend/dist/", "frontend/dist/"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  rules: {
    semi: ["error", "always"],
    // Désactive les règles ultra-strictes qui bloquent la CI sur les dépendances JS
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-return": "off",
  },
};
