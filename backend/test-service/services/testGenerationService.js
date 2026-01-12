/**
 * Unified Test Generation Service
 * Coordinates test generation for all algorithm types
 */

import fetch from 'node-fetch';

const MAIN_SERVICE_URL = process.env.MAIN_SERVICE_URL || 'http://main-service:3000';

/**
 * Generate a CPU scheduling question from the main service (which uses RabbitMQ)
 */
async function generateCPUSchedulingQuestion(difficulty = 'medium') {
    const response = await fetch(`${MAIN_SERVICE_URL}/api/cpu-scheduling/test/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty })
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Main service error: ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    return {
        question: data.data.question,
        correctAnswer: data._correctAnswer
    };
}

/**
 * Generate a memory question from the memory service
 */
async function generateMemoryQuestion(difficulty = 'medium') {
    const response = await fetch(`${MAIN_SERVICE_URL}/api/memory-management/test/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty })
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Main service error: ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    return {
        question: data.question,
        correctAnswer: data.correctAnswer
    };
}

/**
 * Generate a disk scheduling question from the disk service via main service
 */
async function generateDiskSchedulingQuestion(difficulty = 'medium') {
    const response = await fetch(`${MAIN_SERVICE_URL}/api/disk-scheduling/test/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty })
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Main service error: ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    return {
        question: data.data.question,
        correctAnswer: data._correctAnswer
    };
}

/**
 * Generate a test with mixed question types based on configuration
 */
async function generateMixedTest(config) {
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
            testData = await generateCPUSchedulingQuestion(difficulty);
        } else if (questionType === 'memory') {
            testData = await generateMemoryQuestion(difficulty);
        } else {
            testData = await generateDiskSchedulingQuestion(difficulty);
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
async function generateTestByType(type, count, difficulty, algorithm = null) {
    const questions = [];
    
    for (let i = 0; i < count; i++) {
        let testData;
        
        switch (type) {
            case 'scheduling':
            case 'cpu':
                testData = await generateCPUSchedulingQuestion(difficulty);
                break;
                
            case 'memory':
                testData = await generateMemoryQuestion(difficulty);
                break;
                
            case 'disk':
                testData = await generateDiskSchedulingQuestion(difficulty);
                break;
                
            default:
                throw new Error(`Unsupported test type: ${type}`);
        }
        
        testData.question.id = `test-${Date.now()}-${i}`;
        testData.correctAnswer.id = testData.question.id;
        questions.push(testData);
    }
    
    return questions;
}

/**
 * Generate a custom test with specific parameters
 */
async function generateCustomTest(params) {
    const { type, difficulty, algorithm, ...customParams } = params;
    
    let testData;
    
    switch (type) {
        case 'scheduling':
        case 'cpu':
            testData = await generateCPUSchedulingQuestion(difficulty);
            break;
            
        case 'memory':
            testData = await generateMemoryQuestion(difficulty);
            break;
            
        case 'disk':
            testData = await generateDiskSchedulingQuestion(difficulty);
            break;
            
        default:
            throw new Error(`Unsupported test type: ${type}`);
    }
    
    return testData;
}

export {
    generateMixedTest,
    generateTestByType,
    generateCustomTest
};
