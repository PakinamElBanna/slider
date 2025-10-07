module.exports = {
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.(js|jsx|ts|tsx)",
    "<rootDir>/src/**/?(*.)(test|spec).(js|jsx|ts|tsx)",
  ],
  collectCoverageFrom: [
    "src/**/*.(js|jsx|ts|tsx)",
    "!src/**/*.d.ts",
    "!src/__tests__/**/*",
    "!src/**/node_modules/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  verbose: true,
  clearMocks: true,
  restoreMocks: true,
  transform: {
    "^.+\\.js$": "babel-jest",
  },
};
