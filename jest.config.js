module.exports = {
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testMatch: ["<rootDir>/**/*.test.{js,ts}"],
  collectCoverageFrom: ["src/**/*.ts"],
  coveragePathIgnorePatterns: [
    "<rootDir>/src/index.ts",
    "<rootDir>/src/executionHandler.ts",
    "<rootDir>/src/veracode-client-js.d.ts",
  ],
  moduleFileExtensions: ["ts", "js"],
  testEnvironment: "node",
  clearMocks: true,
  collectCoverage: true,
  coverageThreshold: {
    global: {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
  },
};
