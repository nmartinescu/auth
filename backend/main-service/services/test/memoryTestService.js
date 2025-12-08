/**
 * Memory Management Test Generation Service
 * Generates test questions for memory management algorithms
 */

/**
 * Generate a random memory management test question
 */
function generateMemoryQuestion(difficulty = 'medium', algorithm = null) {
    const selectedAlgorithm = algorithm || getRandomMemoryAlgorithm();
    const { frameCount, pageCount } = getMemoryDifficultyParams(difficulty);
    const pageReferences = generatePageReferences(pageCount, frameCount, difficulty);
    
    const description = generateMemoryDescription(selectedAlgorithm, frameCount, pageReferences);
    
    return {
        question: {
            type: 'memory',
            difficulty,
            algorithm: selectedAlgorithm,
            frameCount,
            pageReferences,
            description
        },
        correctAnswer: {
            algorithm: selectedAlgorithm,
            frameCount,
            pageReferences
        }
    };
}

/**
 * Generate multiple memory test questions
 */
function generateMultipleMemoryQuestions(count, difficulty = 'medium') {
    const questions = [];
    
    for (let i = 0; i < count; i++) {
        const testQuestion = generateMemoryQuestion(difficulty);
        questions.push(testQuestion);
    }
    
    return questions;
}

function getMemoryDifficultyParams(difficulty) {
    switch (difficulty) {
        case 'easy':
            return { frameCount: randomBetween(3, 4), pageCount: randomBetween(8, 12) };
        case 'medium':
            return { frameCount: randomBetween(3, 5), pageCount: randomBetween(12, 16) };
        case 'hard':
            return { frameCount: randomBetween(4, 6), pageCount: randomBetween(16, 20) };
        default:
            return { frameCount: 3, pageCount: 10 };
    }
}

function generatePageReferences(pageCount, frameCount, difficulty) {
    const references = [];
    const maxPageNumber = frameCount + randomBetween(2, 5);
    
    for (let i = 0; i < pageCount; i++) {
        if (i === 0) {
            references.push(randomBetween(1, maxPageNumber));
        } else {
            // 30% chance to repeat recent page (locality of reference)
            if (Math.random() < 0.3 && i > 0) {
                const recentIndex = Math.max(0, i - randomBetween(1, 3));
                references.push(references[recentIndex]);
            } else {
                references.push(randomBetween(1, maxPageNumber));
            }
        }
    }
    
    return references;
}

function generateMemoryDescription(algorithm, frameCount, pageReferences) {
    const algorithmName = getMemoryAlgorithmFullName(algorithm);
    
    return `A virtual memory system is configured with ${frameCount} physical memory frames and uses the ${algorithmName} page replacement algorithm. The system receives a sequence of page references: ${pageReferences.join(', ')}.

When a process requests a page that is not currently in physical memory, a page fault occurs and the system must load the requested page. If all frames are occupied, the ${algorithmName} algorithm determines which existing page should be replaced to make room for the new page.

Your task is to simulate the page replacement process and determine the total number of page faults that occur during the execution of this reference sequence. Additionally, calculate the hit rate, which represents the percentage of page references that were successfully found in memory without causing a page fault.`;
}

function getRandomMemoryAlgorithm() {
    const algorithms = ['FIFO', 'LRU', 'OPT'];
    return algorithms[Math.floor(Math.random() * algorithms.length)];
}

function getMemoryAlgorithmFullName(algorithm) {
    switch (algorithm) {
        case 'FIFO':
            return 'First In First Out (FIFO)';
        case 'LRU':
            return 'Least Recently Used (LRU)';
        case 'OPT':
            return 'Optimal (OPT)';
        case 'LFU':
            return 'Least Frequently Used (LFU)';
        case 'MRU':
            return 'Most Recently Used (MRU)';
        default:
            return algorithm;
    }
}

function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export {
    generateMemoryQuestion,
    generateMultipleMemoryQuestions
};
