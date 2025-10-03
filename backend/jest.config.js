module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Coverage configuration
  collectCoverageFrom: [
    '**/*.{js,cjs}',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/tests/**',
    '!**/__tests__/**',
    '!jest.config.js',
  ],
  
  // Coverage thresholds (optional - can be adjusted)
  coverageThreshold: {
    global: {
      branches: 15,
      functions: 15,
      lines: 20,
      statements: 20
    }
  },
  
  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.test.{js,cjs}',
    '**/*.test.{js,cjs}',
    '**/*.spec.{js,cjs}'
  ],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Module paths
  moduleDirectories: ['node_modules', '<rootDir>'],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/'
  ],
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks between tests
  restoreMocks: true,
  
  // Test timeout (30 seconds for integration tests)
  testTimeout: 30000,
  
  // Force exit after tests complete
  forceExit: true,
  
  // Detect open handles
  detectOpenHandles: false,
};
