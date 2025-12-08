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
  }),

  // Disk scheduling test utilities
  createDiskRequest: (overrides = {}) => ({
    maxDiskSize: 200,
    initialHeadPosition: 50,
    headDirection: 'right',
    algorithm: 'fcfs',
    requests: [98, 183, 37, 122, 14, 124, 65, 67],
    ...overrides
  }),

  createRandomRequests: (count = 10, maxDisk = 200) => {
    return Array.from({ length: count }, () => Math.floor(Math.random() * maxDisk));
  },

  createSequentialRequests: (start = 50, count = 10) => {
    return Array.from({ length: count }, (_, i) => start + i);
  },

  createAlternatingRequests: (low = 10, high = 190, count = 6) => {
    return Array.from({ length: count }, (_, i) => i % 2 === 0 ? low : high);
  },

  validateDiskResult: (result, expectedAlgorithm, expectedRequestCount) => {
    expect(result).toHaveProperty('sequence');
    expect(result).toHaveProperty('totalSeekTime');
    expect(result).toHaveProperty('averageSeekTime');
    expect(result).toHaveProperty('steps');
    expect(result).toHaveProperty('algorithm', expectedAlgorithm);
    expect(result.sequence).toHaveLength(expectedRequestCount + 1); // +1 for initial position
    expect(result.steps).toHaveLength(expectedRequestCount + 1);
    expect(result.totalSeekTime).toBeGreaterThanOrEqual(0);
    expect(result.averageSeekTime).toBeGreaterThanOrEqual(0);
  }
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