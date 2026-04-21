module.exports = {
  testEnvironment: "jsdom",

  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": "babel-jest",
  },

  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },

  setupFiles: ["<rootDir>/src/setupPolyfills.ts"],

  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],

  transformIgnorePatterns: [
    "/node_modules/(?!(firebase|@firebase)/)"
  ],
};