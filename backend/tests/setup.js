// Test setup file
// This file runs before each test suite

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.GEMINI_API_KEY = 'test_api_key_mock';
process.env.GEMINI_API_KEY_1 = 'test_api_key_1_mock';
process.env.PORT = '3001'; // Use different port for testing

// Global test timeout
jest.setTimeout(30000);

// Suppress console output during tests (optional)
global.console = {
  ...console,
  // Uncomment to suppress logs during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  error: jest.fn(), // Keep error logging
};
