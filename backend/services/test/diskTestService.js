/**
 * Disk Scheduling Test Generation Service
 * Generates test questions for disk scheduling algorithms
 */

import { simulateDiskScheduling } from './diskSchedulingService.js';

/**
 * Generate a random disk scheduling test question
 */
function generateDiskSchedulingQuestion(difficulty = 'medium') {
    const algorithms = ['fcfs', 'sstf', 'scan', 'cscan', 'look', 'clook'];
    const algorithm = algorithms[Math.floor(Math.random() * algorithms.length)];
    
    let maxDiskSize, requestCount, initialHeadPosition, requests;
    
    // Set parameters based on difficulty
    switch (difficulty) {
        case 'easy':
            maxDiskSize = 100;
            requestCount = Math.floor(Math.random() * 3) + 3; // 3-5 requests
            break;
        case 'medium':
            maxDiskSize = 200;
            requestCount = Math.floor(Math.random() * 4) + 5; // 5-8 requests
            break;
        case 'hard':
            maxDiskSize = 500;
            requestCount = Math.floor(Math.random() * 6) + 8; // 8-13 requests
            break;
        default:
            maxDiskSize = 200;
            requestCount = Math.floor(Math.random() * 4) + 5;
    }
    
    // Generate random initial head position
    initialHeadPosition = Math.floor(Math.random() * maxDiskSize);
    
    // Generate random requests
    requests = [];
    for (let i = 0; i < requestCount; i++) {
        let request;
        do {
            request = Math.floor(Math.random() * maxDiskSize);
        } while (requests.includes(request) || request === initialHeadPosition);
        requests.push(request);
    }
    
    // Random head direction for algorithms that need it
    const headDirection = Math.random() > 0.5 ? 'right' : 'left';
    
    // Generate the correct solution
    const solution = simulateDiskScheduling(
        algorithm,
        requests,
        initialHeadPosition,
        maxDiskSize,
        headDirection
    );
    
    return {
        question: {
            algorithm: algorithm.toUpperCase(),
            maxDiskSize,
            initialHeadPosition,
            headDirection,
            requests: [...requests],
            difficulty
        },
        correctAnswer: {
            sequence: solution.sequence,
            totalSeekTime: solution.totalSeekTime,
            averageSeekTime: solution.averageSeekTime,
            steps: solution.steps
        }
    };
}

/**
 * Generate multiple test questions
 */
function generateMultipleQuestions(count = 5, difficulty = 'medium') {
    const questions = [];
    
    for (let i = 0; i < count; i++) {
        questions.push(generateDiskSchedulingQuestion(difficulty));
    }
    
    return questions;
}

/**
 * Check user's answer against correct solution
 */
function checkAnswer(userAnswer, correctAnswer) {
    const feedback = {
        isCorrect: false,
        score: 0,
        feedback: [],
        correctAnswer
    };
    
    // Check sequence
    if (userAnswer.sequence && Array.isArray(userAnswer.sequence)) {
        const userSeq = userAnswer.sequence.map(n => parseInt(n));
        const correctSeq = correctAnswer.sequence;
        
        if (JSON.stringify(userSeq) === JSON.stringify(correctSeq)) {
            feedback.score += 50;
            feedback.feedback.push("Sequence is correct!");
        } else {
            feedback.feedback.push(`Sequence is incorrect. Expected: [${correctSeq.join(' → ')}], Got: [${userSeq.join(' → ')}]`);
        }
    } else {
        feedback.feedback.push("Sequence is missing or invalid");
    }
    
    // Check total seek time
    if (userAnswer.totalSeekTime !== undefined) {
        const userSeekTime = parseInt(userAnswer.totalSeekTime);
        const correctSeekTime = correctAnswer.totalSeekTime;
        
        if (userSeekTime === correctSeekTime) {
            feedback.score += 30;
            feedback.feedback.push("Total seek time is correct!");
        } else {
            feedback.feedback.push(`Total seek time is incorrect. Expected: ${correctSeekTime}, Got: ${userSeekTime}`);
        }
    } else {
        feedback.feedback.push("Total seek time is missing");
    }
    
    // Check average seek time (with tolerance for rounding)
    if (userAnswer.averageSeekTime !== undefined) {
        const userAvgSeekTime = parseFloat(userAnswer.averageSeekTime);
        const correctAvgSeekTime = correctAnswer.averageSeekTime;
        
        if (Math.abs(userAvgSeekTime - correctAvgSeekTime) < 0.01) {
            feedback.score += 20;
            feedback.feedback.push("Average seek time is correct!");
        } else {
            feedback.feedback.push(`Average seek time is incorrect. Expected: ${correctAvgSeekTime.toFixed(2)}, Got: ${userAvgSeekTime.toFixed(2)}`);
        }
    } else {
        feedback.feedback.push("Average seek time is missing");
    }
    
    // Determine if answer is correct (need at least 80% score)
    feedback.isCorrect = feedback.score >= 80;
    
    if (feedback.isCorrect) {
        feedback.feedback.unshift("Excellent work! Your answer is correct.");
    } else {
        feedback.feedback.unshift(`Your answer needs improvement. Score: ${feedback.score}/100`);
    }
    
    return feedback;
}

/**
 * Generate a test with specific parameters
 */
function generateCustomTest(params) {
    const {
        algorithm,
        maxDiskSize = 200,
        initialHeadPosition,
        headDirection = 'right',
        requests
    } = params;
    
    // Validate parameters
    if (!algorithm || !requests || !Array.isArray(requests) || requests.length === 0) {
        throw new Error('Invalid test parameters');
    }
    
    if (initialHeadPosition === undefined || initialHeadPosition < 0 || initialHeadPosition >= maxDiskSize) {
        throw new Error('Invalid initial head position');
    }
    
    // Generate the correct solution
    const solution = simulateDiskScheduling(
        algorithm.toLowerCase(),
        requests,
        initialHeadPosition,
        maxDiskSize,
        headDirection
    );
    
    return {
        question: {
            algorithm: algorithm.toUpperCase(),
            maxDiskSize,
            initialHeadPosition,
            headDirection,
            requests: [...requests]
        },
        correctAnswer: {
            sequence: solution.sequence,
            totalSeekTime: solution.totalSeekTime,
            averageSeekTime: solution.averageSeekTime,
            steps: solution.steps
        }
    };
}

export {
    generateDiskSchedulingQuestion,
    generateMultipleQuestions,
    checkAnswer,
    generateCustomTest
};