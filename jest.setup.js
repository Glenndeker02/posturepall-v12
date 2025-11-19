// Jest setup file
// Add custom matchers, global test utilities, etc.

// Set test environment variables
process.env.NODE_ENV = 'test'
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000'
process.env.DATABASE_URL = 'file:./test.db'

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Keep console.error and console.warn for debugging
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
}

// Global test timeout
jest.setTimeout(10000)
