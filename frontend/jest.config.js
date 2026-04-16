// jest.config.js
export default {
  // Use 'babel-jest' to transpile both JavaScript and TypeScript files
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest'
  },
  // Set the test environment to jsdom for all tests
  testEnvironment: 'jsdom',
  // Configure Jest to handle CSS imports by mocking them with an empty object
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
  },
  // Look for test files in `__tests__` or with `.test.js`, `.spec.js`, etc.
  testMatch: [
    '**/__tests__/**/*.?(m)[jt]s?(x)',
    '**/?(*.)+(spec|test).?(m)[jt]s?(x)'
  ],
  // Ignore the 'dist' directory
  testPathIgnorePatterns: [
    '<rootDir>/dist/'
  ],
  // Set up module name mapping to handle file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // Make sure the setup files run before tests
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
