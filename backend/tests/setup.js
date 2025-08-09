// Test setup file for Jest
import { jest } from '@jest/globals';

// Global test configuration
global.console = {
  ...console,
  // Suppress console.log during tests unless needed
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock timers if needed
// jest.useFakeTimers();

// Global test utilities
global.testUtils = {
  createMockProcess: (overrides = {}) => ({
    arrivalTime: 0,
    burstTime: 5,
    io: [],
    ...overrides
  }),
  
  createMockProcesses: (count = 3) => {
    return Array.from({ length: count }, (_, i) => ({
      arrivalTime: i,
      burstTime: i + 2,
      io: []
    }));
  },
  
  createProcessWithIO: (ioOperations = []) => ({
    arrivalTime: 0,
    burstTime: 10,
    io: ioOperations
  })
};

// Setup and teardown
beforeEach(() => {
  // Reset any global state before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Clean up after each test
  jest.restoreAllMocks();
});

// Handle unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process in tests
});

// Increase timeout for integration tests
jest.setTimeout(10000);