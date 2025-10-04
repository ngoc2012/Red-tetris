export default {
  testEnvironment: "jsdom", // needed for DOM APIs
  transform: {
    "^.+\\.jsx?$": "babel-jest"
  },
  moduleFileExtensions: ["js", "jsx"],
  setupFilesAfterEnv: [
    "@testing-library/jest-dom",
    "<rootDir>/jest.setup.js"
]
};
