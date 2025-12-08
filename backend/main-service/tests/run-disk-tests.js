#!/usr/bin/env node

/**
 * Disk Scheduling Test Runner
 * Runs all disk scheduling related tests with detailed reporting
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function colorize(text, color) {
    return `${colors[color]}${text}${colors.reset}`;
}

function printHeader(title) {
    console.log('\n' + '='.repeat(60));
    console.log(colorize(title, 'cyan'));
    console.log('='.repeat(60));
}

function printSubHeader(title) {
    console.log('\n' + colorize(title, 'yellow'));
    console.log('-'.repeat(40));
}

async function runTests(testPattern, description) {
    return new Promise((resolve, reject) => {
        printSubHeader(description);
        
        const jest = spawn('npx', ['jest', testPattern, '--verbose'], {
            stdio: 'inherit',
            cwd: join(__dirname, '..')
        });

        jest.on('close', (code) => {
            if (code === 0) {
                console.log(colorize(`${description} - PASSED`, 'green'));
                resolve(true);
            } else {
                console.log(colorize(`${description} - FAILED`, 'red'));
                resolve(false);
            }
        });

        jest.on('error', (error) => {
            console.error(colorize(`Error running ${description}: ${error.message}`, 'red'));
            reject(error);
        });
    });
}

async function runCoverage() {
    return new Promise((resolve, reject) => {
        printSubHeader('Running Coverage Analysis');
        
        const jest = spawn('npx', ['jest', 'diskScheduling', '--coverage', '--collectCoverageFrom=services/diskSchedulingService.js'], {
            stdio: 'inherit',
            cwd: join(__dirname, '..')
        });

        jest.on('close', (code) => {
            if (code === 0) {
                console.log(colorize('Coverage Analysis - COMPLETED', 'green'));
                resolve(true);
            } else {
                console.log(colorize('Coverage Analysis - FAILED', 'red'));
                resolve(false);
            }
        });

        jest.on('error', (error) => {
            console.error(colorize(`Error running coverage: ${error.message}`, 'red'));
            reject(error);
        });
    });
}

async function main() {
    printHeader('DISK SCHEDULING TEST SUITE');
    
    console.log(colorize('Running comprehensive disk scheduling tests...', 'bright'));
    console.log('This includes unit tests, integration tests, API tests, and edge cases.\n');

    const testSuites = [
        {
            pattern: 'diskScheduling.test.js',
            description: 'Core Disk Scheduling Algorithm Tests'
        },
        {
            pattern: 'disk-api.test.js',
            description: 'Disk Scheduling API Endpoint Tests'
        },
        {
            pattern: 'diskScheduling.integration.test.js',
            description: 'Disk Scheduling Integration Tests'
        },
        {
            pattern: 'diskScheduling.edge-cases.test.js',
            description: 'Disk Scheduling Edge Cases and Boundary Tests'
        }
    ];

    const results = [];
    let totalTests = 0;
    let passedSuites = 0;

    try {
        // Run each test suite
        for (const suite of testSuites) {
            const result = await runTests(suite.pattern, suite.description);
            results.push({ ...suite, passed: result });
            totalTests++;
            if (result) passedSuites++;
        }

        // Run coverage analysis
        printHeader('COVERAGE ANALYSIS');
        await runCoverage();

        // Print summary
        printHeader('TEST SUMMARY');
        
        console.log(`\nTotal Test Suites: ${totalTests}`);
        console.log(`Passed: ${colorize(passedSuites, 'green')}`);
        console.log(`Failed: ${colorize(totalTests - passedSuites, totalTests - passedSuites > 0 ? 'red' : 'green')}`);
        
        console.log('\nDetailed Results:');
        results.forEach(result => {
            const status = result.passed ? colorize('PASSED', 'green') : colorize('FAILED', 'red');
            console.log(`  ${result.description}: ${status}`);
        });

        if (passedSuites === totalTests) {
            console.log(colorize('\nAll disk scheduling tests passed!', 'green'));
            console.log(colorize('The disk scheduling implementation is ready for production.', 'bright'));
        } else {
            console.log(colorize('\nSome tests failed. Please review the output above.', 'yellow'));
        }

        // Additional recommendations
        printHeader('RECOMMENDATIONS');
        console.log('1. Review test coverage report in the coverage/ directory');
        console.log('2. Run individual test suites for detailed debugging if needed');
        console.log('3. Consider performance testing with larger datasets');
        console.log('4. Validate against real-world disk access patterns');

        process.exit(passedSuites === totalTests ? 0 : 1);

    } catch (error) {
        console.error(colorize(`\nFatal error running tests: ${error.message}`, 'red'));
        process.exit(1);
    }
}

// Handle process termination
process.on('SIGINT', () => {
    console.log(colorize('\n\nTest execution interrupted by user.', 'yellow'));
    process.exit(1);
});

process.on('SIGTERM', () => {
    console.log(colorize('\n\nTest execution terminated.', 'yellow'));
    process.exit(1);
});

// Run the test suite
main().catch(error => {
    console.error(colorize(`Unexpected error: ${error.message}`, 'red'));
    process.exit(1);
});