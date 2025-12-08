# CPU Scheduler Unit Tests

This directory contains comprehensive unit tests for the CPU scheduling system, covering all major components and algorithms.

## Test Structure

```
backend/tests/
├── unit/
│   ├── scheduler.test.js      # Tests for all scheduling algorithms (FCFS, SJF, RR)
│   ├── pcb.test.js           # Tests for Process Control Block Manager
│   ├── queue.test.js         # Tests for Queue and Ready Queue Managers
│   ├── cpu-api.test.js       # Tests for CPU API endpoint
│   └── timer.test.js         # Tests for Timer component
├── setup.js                  # Jest setup and global utilities
└── README.md                 # This file
```

## Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Only Unit Tests
```bash
npm run test:unit
```

### Run Tests with Verbose Output
```bash
npm run test:verbose
```

## Test Coverage

### Scheduling Algorithms (`scheduler.test.js`)
- **FCFS (First Come First Served)**
  - Basic scheduler creation and initialization
  - Process execution without I/O
  - Process execution with different arrival times
  - Non-preemptive behavior verification

- **SJF (Shortest Job First)**
  - Shortest job selection logic
  - Equal burst time handling
  - Non-preemptive behavior verification

- **RR (Round Robin)**
  - Quantum-based scheduling
  - Preemptive behavior verification
  - Different quantum value testing

- **I/O Operations**
  - All algorithms with I/O operations
  - Complex I/O timing scenarios

- **Edge Cases**
  - Single process scenarios
  - Zero arrival times
  - Large burst times
  - Empty I/O arrays

### Process Control Block (`pcb.test.js`)
- **Initialization**
  - PCB creation for all processes
  - PID assignment
  - State initialization
  - Property copying

- **State Management**
  - Process state transitions
  - Completion detection
  - Running process detection

- **CPU Time Management**
  - CPU time incrementation
  - Burst time decrementation
  - Process completion detection

- **I/O Operations**
  - I/O detection at specific CPU times
  - Wait queue management
  - I/O time handling
  - Multiple I/O operations per process

- **Timing and Scheduling**
  - Scheduled time tracking
  - Waiting time calculation
  - Turnaround time calculation

- **Quantum Management**
  - Quantum assignment
  - Quantum decrementation
  - Zero quantum handling

### Queue Management (`queue.test.js`)
- **QueueManager**
  - Basic queue operations (add, remove, get)
  - Element access by index
  - Queue replacement
  - Edge cases (empty queue, invalid indices)

- **ReadyQueuesManager**
  - Multiple queue initialization
  - Queue-specific operations
  - Quantum management per queue
  - Allotment management
  - Process removal from all queues

### CPU API Endpoint (`cpu-api.test.js`)
- **Successful Requests**
  - All algorithm support (FCFS, SJF, RR)
  - Default algorithm handling
  - Case-insensitive algorithm names

- **Input Validation**
  - Missing/empty processes validation
  - Invalid arrival/burst times
  - I/O operation validation
  - Quantum validation for RR
  - Unsupported algorithm rejection

- **Data Processing**
  - Default I/O array assignment
  - I/O operation sorting
  - Process data transformation

- **Response Format**
  - Correct response structure
  - Performance metrics inclusion
  - Error response format

- **Error Handling**
  - Scheduler error handling
  - Malformed JSON handling

### Timer Component (`timer.test.js`)
- **Basic Operations**
  - Timer initialization
  - Clock incrementation
  - Timer reset
  - Singleton pattern verification

- **State Management**
  - Multiple clock cycles
  - Reset after operations
  - Large cycle handling

## Test Utilities

The test suite includes global utilities available in all tests:

```javascript
// Create mock process with defaults
const process = testUtils.createMockProcess({
  arrivalTime: 2,
  burstTime: 10
});

// Create multiple mock processes
const processes = testUtils.createMockProcesses(5);

// Create process with I/O operations
const processWithIO = testUtils.createProcessWithIO([
  { start: 2, duration: 3 },
  { start: 5, duration: 1 }
]);
```

## Coverage Goals

- **Statements**: > 90%
- **Branches**: > 85%
- **Functions**: > 95%
- **Lines**: > 90%

## Test Patterns

### Unit Test Structure
```javascript
describe('Component Name', () => {
  let component;
  
  beforeEach(() => {
    // Setup before each test
    component = new Component();
  });
  
  describe('Feature Group', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test data';
      
      // Act
      const result = component.method(input);
      
      // Assert
      expect(result).toBe('expected output');
    });
  });
});
```

### API Test Structure
```javascript
describe('API Endpoint', () => {
  it('should handle valid request', async () => {
    const response = await request(app)
      .post('/api/endpoint')
      .send(validData);
      
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

## Configuration

Tests are configured via `jest.config.js`:
- ES modules support
- Coverage reporting
- Test timeout: 10 seconds
- Verbose output
- Mock clearing between tests

## Writing New Tests

When adding new tests:

1. **Follow naming conventions**: `*.test.js`
2. **Use descriptive test names**: `should do X when Y`
3. **Group related tests**: Use `describe` blocks
4. **Test edge cases**: Empty inputs, boundary values
5. **Mock external dependencies**: Use Jest mocks
6. **Assert specific behaviors**: Avoid generic assertions

## Debugging Tests

### Common Issues
- **ES Module errors**: Ensure proper import/export syntax
- **Async test failures**: Use proper async/await or return promises
- **Mock issues**: Clear mocks between tests
- **Timeout errors**: Increase timeout for slow tests

### Debug Commands
```bash
# Run specific test file
npm test scheduler.test.js

# Run tests matching pattern
npm test -- --testNamePattern="FCFS"

# Debug with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Continuous Integration

Tests should be run in CI/CD pipeline:
- On every pull request
- Before deployment
- With coverage reporting
- Fail build if coverage drops below threshold

## Future Improvements

- [ ] Integration tests for full scheduler workflows
- [ ] Performance benchmarking tests
- [ ] Stress tests with large process counts
- [ ] Property-based testing for edge cases
- [ ] Visual test reporting dashboard