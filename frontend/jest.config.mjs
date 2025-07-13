import path from "path";

export default {
  preset: "ts-jest",
  testEnvironment: "jsdom",

  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "./tsconfig.json",
      },
    ],
  },

  extensionsToTreatAsEsm: [".ts", ".tsx"],

  moduleNameMapper: {
    "^react$": path.resolve("./node_modules/react"),
    "^react-dom$": path.resolve("./node_modules/react-dom"),
    "\\.(css|less|scss)$": "identity-obj-proxy",
  },

  setupFilesAfterEnv: ["<rootDir>/setupTests.ts"],

  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
};
