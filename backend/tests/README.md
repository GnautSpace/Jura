# Backend Testing Guide

This document explains how to run and write tests for the Jura backend application.

## Overview

The backend uses **Jest** as the test runner and **Supertest** for HTTP endpoint testing. Tests are organized into:

- **Unit Tests**: Test individual functions and utilities
- **Integration Tests**: Test API endpoints and request/response cycles

## Test Structure

```
backend/
├── tests/
│   ├── setup.js                    # Test environment setup
│   ├── unit/                       # Unit tests
│   │   └── utils.test.js          # Utility function tests
│   ├── integration/                # Integration tests
│   │   └── api.test.js            # API endpoint tests
│   └── mocks/                      # Mock implementations
│       └── gemini.mock.js         # Gemini API mock
├── jest.config.js                  # Jest configuration
└── package.json                    # Test scripts
```

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (re-runs on file changes)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests Only
```bash
npm run test:integration
```

## Test Coverage

After running `npm run test:coverage`, view the coverage report:

- **Terminal**: Summary displayed in console
- **HTML Report**: Open `coverage/index.html` in a browser

### Coverage Thresholds

Current thresholds (can be adjusted in `jest.config.js`):
- Branches: 50%
- Functions: 50%
- Lines: 50%
- Statements: 50%

## Writing Tests

### Unit Test Example

```javascript
const { describe, test, expect } = require('@jest/globals');

describe('MyFunction', () => {
  test('should return expected result', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });
});
```

### Integration Test Example

```javascript
const request = require('supertest');
const app = require('../server.cjs');

describe('POST /endpoint', () => {
  test('should return 200 for valid request', async () => {
    const response = await request(app)
      .post('/endpoint')
      .send({ data: 'value' })
      .expect(200);
    
    expect(response.body).toHaveProperty('success', true);
  });
});
```

## Mocking External Services

The Gemini API is mocked to avoid requiring real API keys during testing:

```javascript
jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: () => ({
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => 'Mocked response'
          }
        })
      })
    }))
  };
});
```

## Test Environment

Tests run in a separate environment with:
- `NODE_ENV=test`
- Mock API keys
- Different port (3001) to avoid conflicts
- Suppressed console output (optional)

Configuration is in `tests/setup.js`.

## Continuous Integration

Tests should be run in CI/CD pipelines before deployment:

```yaml
# Example GitHub Actions
- name: Run tests
  run: |
    cd backend
    npm install
    npm test
```

## Common Issues

### Port Already in Use
Tests use port 3001. If it's in use:
```bash
# Linux/Mac
lsof -ti:3001 | xargs kill -9

# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Tests Hanging
If tests don't exit:
- Check for open handles: `npm test -- --detectOpenHandles`
- Ensure all async operations complete
- Verify `forceExit: true` in `jest.config.js`

### Import/Require Issues
The backend uses CommonJS (`require`). Ensure:
- Use `module.exports` not `export`
- Use `require()` not `import`

## Best Practices

1. **Test Coverage**: Aim for >70% coverage
2. **Isolation**: Each test should be independent
3. **Mocking**: Mock external services (APIs, databases)
4. **Assertions**: Use clear, specific assertions
5. **Naming**: Use descriptive test names
6. **Speed**: Keep tests fast (<5s per test suite)
7. **Documentation**: Comment complex test logic

## Adding New Tests

1. Create test file in appropriate directory:
   - Unit tests: `tests/unit/`
   - Integration tests: `tests/integration/`

2. Follow naming convention: `*.test.js`

3. Use Jest matchers:
   - `expect(value).toBe(expected)`
   - `expect(value).toEqual(expected)`
   - `expect(value).toHaveProperty('key')`
   - `expect(fn).toThrow()`
   - And more: https://jestjs.io/docs/expect

4. Run tests to verify: `npm test`

## Testing Checklist

Before committing:
- [ ] All tests pass: `npm test`
- [ ] Coverage meets thresholds
- [ ] No console errors or warnings
- [ ] Tests are documented
- [ ] Mocks are used for external services

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Jest Matchers](https://jestjs.io/docs/expect)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

## Support

For questions or issues with tests:
1. Check this guide
2. Review existing tests for examples
3. Check Jest/Supertest documentation
4. Open an issue on GitHub
