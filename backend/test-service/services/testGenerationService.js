/**
 * Unified Test Generation Service
 * Coordinates test generation for all algorithm types
 */

import fetch from 'node-fetch';

const CPU_SERVICE_URL = process.env.CPU_SERVICE_URL || 'http://localhost:5001';
const MEMORY_SERVICE_URL = process.env.MEMORY_SERVICE_URL || 'http://localhost:5003';
const DISK_SERVICE_URL = process.env.DISK_SERVICE_URL || 'http://localhost:5002';

/**
 * Generate a CPU scheduling question from the CPU service
 */
async function generateCPUSchedulingQuestion(difficulty = 'medium') {
    const response = await fetch(`${CPU_SERVICE_URL}/api/cpu/test/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty })
    });
    
    if (!response.ok) {
        throw new Error(`CPU service error: ${response.statusText}`);
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
    // Memory service doesn't have a test endpoint yet, so we'll generate locally
    // This would call the memory service once it has a test generation endpoint
    const algorithms = ['FIFO', 'LRU', 'LFU', 'OPTIMAL', 'MRU'];
    const algorithm = algorithms[Math.floor(Math.random() * algorithms.length)];
    
    // For now, return a placeholder structure
    // TODO: Implement proper memory test generation endpoint in memory-service
    return {
        question: {
            type: 'memory',
            algorithm,
            difficulty,
            description: `Memory test question for ${algorithm} algorithm`
        },
        correctAnswer: {
            algorithm,
            pageFrames: [],
            pageFaults: 0
        }
    };
}

/**
 * Generate a disk scheduling question from the disk service
 */
async function generateDiskSchedulingQuestion(difficulty = 'medium') {
    const response = await fetch(`${DISK_SERVICE_URL}/api/disk/test/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty })
    });
    
    if (!response.ok) {
        throw new Error(`Disk service error: ${response.statusText}`);
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
