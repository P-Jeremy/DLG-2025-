import path from "path";

export default {
  testEnvironment: "jsdom",

  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "./tsconfig.jest.json" }],
  },

  moduleNameMapper: {
    "^react$": path.resolve("./node_modules/react"),
    "^react-dom$": path.resolve("./node_modules/react-dom"),
    "\\.(css|less|scss)$": "identity-obj-proxy",
  },

  setupFilesAfterEnv: ["<rootDir>/setupTests.ts"],
};
