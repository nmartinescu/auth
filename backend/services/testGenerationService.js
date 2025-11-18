/**
 * Unified Test Generation Service
 * Coordinates test generation for all algorithm types
 */

import { generateCPUSchedulingQuestion, generateMultipleCPUQuestions } from './cpuTestService.js';
import { generateMemoryQuestion, generateMultipleMemoryQuestions } from './memoryTestService.js';
import { generateDiskSchedulingQuestion, generateMultipleQuestions as generateMultipleDiskQuestions } from './diskTestService.js';

/**
 * Generate a test with mixed question types based on configuration
 */
function generateMixedTest(config) {
    const {
        numQuestions = 5,
        difficulty = 'medium',
        includeScheduling = true,
        includeMemory = true,
        includeDisk = true
    } = config;

    const questions = [];
    const questionTypes = [];
    
    if (includeScheduling) questionTypes.push('scheduling');
    if (includeMemory) questionTypes.push('memory');
    if (includeDisk) questionTypes.push('disk');
    
    if (questionTypes.length === 0) {
        throw new Error('At least one question type must be included');
    }
    
    for (let i = 0; i < numQuestions; i++) {
        const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
        
        let testData;
        if (questionType === 'scheduling') {
            testData = generateCPUSchedulingQuestion(difficulty);
        } else if (questionType === 'memory') {
            testData = generateMemoryQuestion(difficulty);
        } else {
            testData = generateDiskSchedulingQuestion(difficulty);
        }
        
        // Add unique ID for tracking
        testData.question.id = `test-${Date.now()}-${i}`;
        testData.correctAnswer.id = testData.question.id;
        
        questions.push(testData);
    }
    
    return questions;
}

/**
 * Generate questions of a specific type
 */
function generateTestByType(type, count, difficulty, algorithm = null) {
    switch (type) {
        case 'scheduling':
        case 'cpu':
            if (count === 1) {
                return [generateCPUSchedulingQuestion(difficulty, algorithm)];
            }
            return generateMultipleCPUQuestions(count, difficulty);
            
        case 'memory':
            if (count === 1) {
                return [generateMemoryQuestion(difficulty, algorithm)];
            }
            return generateMultipleMemoryQuestions(count, difficulty);
            
        case 'disk':
            if (count === 1) {
                return [generateDiskSchedulingQuestion(difficulty, algorithm)];
            }
            return generateMultipleDiskQuestions(count, difficulty);
            
        default:
            throw new Error(`Unsupported test type: ${type}`);
    }
}

/**
 * Generate a custom test with specific parameters
 */
function generateCustomTest(params) {
    const { type, difficulty, algorithm, ...customParams } = params;
    
    switch (type) {
        case 'scheduling':
        case 'cpu':
            return generateCPUSchedulingQuestion(difficulty, algorithm);
            
        case 'memory':
            return generateMemoryQuestion(difficulty, algorithm);
            
        case 'disk':
            // Use the existing disk custom test generation if custom params provided
            if (customParams.requests && customParams.initialHeadPosition !== undefined) {
                const { generateCustomTest: diskCustomTest } = require('./diskTestService.js');
                return {
                    question: diskCustomTest(customParams).question,
                    correctAnswer: diskCustomTest(customParams).correctAnswer
                };
            }
            return generateDiskSchedulingQuestion(difficulty, algorithm);
            
        default:
            throw new Error(`Unsupported test type: ${type}`);
    }
}

export {
    generateMixedTest,
    generateTestByType,
    generateCustomTest
};
