export default {
    // Test environment
    testEnvironment: "node",

    // Use ES modules
    preset: null,

    // Transform configuration (empty for ES modules)
    transform: {},

    // Module file extensions
    moduleFileExtensions: ["js", "json"],


    testMatch: ["**/tests/**/*.test.js", "**/?(*.)+(spec|test).js"],


    collectCoverage: false, // Set to true when running coverage
    coverageDirectory: "coverage",
    coverageReporters: ["text", "lcov", "html"],
    collectCoverageFrom: [
        "Scheduler/**/*.js",
        "routes/**/*.js",
        "services/**/*.js",
        "!**/node_modules/**",
        "!**/tests/**",
        "!coverage/**",
    ],

    // Setup files
    setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],

    // Test timeout
    testTimeout: 10000,

    // Verbose output
    verbose: true,

    // Clear mocks between tests
    clearMocks: true,
};
