import express from 'express';
import { generateMixedTest, generateTestByType, generateCustomTest } from '../services/test/testGenerationService.js';

const router = express.Router();

// Store generated tests temporarily (in production, use Redis or database)
const testStore = new Map();

/**
 * POST /api/test-generation/generate
 * Generate a mixed test with multiple question types
 * 
 * Body: {
 *   numQuestions: 5,
 *   difficulty: 'medium',
 *   includeScheduling: true,
 *   includeMemory: true,
 *   includeDisk: true
 * }
 */
router.post('/generate', (req, res) => {
    try {
        const config = req.body;
        
        // Validate configuration
        if (config.numQuestions && (config.numQuestions < 1 || config.numQuestions > 50)) {
            return res.status(400).json({
                success: false,
                message: 'Number of questions must be between 1 and 50'
            });
        }
        
        const validDifficulties = ['easy', 'medium', 'hard'];
        if (config.difficulty && !validDifficulties.includes(config.difficulty)) {
            return res.status(400).json({
                success: false,
                message: `Invalid difficulty. Must be one of: ${validDifficulties.join(', ')}`
            });
        }
        
        // Generate test
        const testData = generateMixedTest(config);
        
        // Create session ID
        const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Store correct answers server-side
        testStore.set(sessionId, {
            answers: testData.map(t => t.correctAnswer),
            createdAt: Date.now(),
            config
        });
        
        // Clean up old sessions (older than 1 hour)
        cleanupOldSessions();
        
        // Return only questions to frontend
        res.json({
            success: true,
            data: {
                sessionId,
                questions: testData.map(t => t.question),
                count: testData.length
            }
        });
        
    } catch (error) {
        console.error('Error generating mixed test:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error generating test'
        });
    }
});

/**
 * POST /api/test-generation/generate-by-type
 * Generate questions of a specific type
 * 
 * Body: {
 *   type: 'scheduling' | 'memory' | 'disk',
 *   count: 5,
 *   difficulty: 'medium',
 *   algorithm?: 'FCFS' | 'SJF' | ...
 * }
 */
router.post('/generate-by-type', (req, res) => {
    try {
        const { type, count = 1, difficulty = 'medium', algorithm } = req.body;
        
        if (!type) {
            return res.status(400).json({
                success: false,
                message: 'Type is required (scheduling, memory, or disk)'
            });
        }
        
        if (count < 1 || count > 50) {
            return res.status(400).json({
                success: false,
                message: 'Count must be between 1 and 50'
            });
        }
        
        const validDifficulties = ['easy', 'medium', 'hard'];
        if (!validDifficulties.includes(difficulty)) {
            return res.status(400).json({
                success: false,
                message: `Invalid difficulty. Must be one of: ${validDifficulties.join(', ')}`
            });
        }
        
        // Generate test
        const testData = generateTestByType(type, count, difficulty, algorithm);
        
        // Create session ID
        const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Store correct answers server-side
        testStore.set(sessionId, {
            answers: testData.map(t => t.correctAnswer),
            createdAt: Date.now(),
            type,
            difficulty,
            algorithm
        });
        
        cleanupOldSessions();
        
        // Return only questions to frontend
        res.json({
            success: true,
            data: {
                sessionId,
                questions: testData.map(t => t.question),
                count: testData.length
            }
        });
        
    } catch (error) {
        console.error('Error generating test by type:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error generating test'
        });
    }
});

/**
 * POST /api/test-generation/custom
 * Generate a custom test with specific parameters
 * 
 * Body: {
 *   type: 'scheduling' | 'memory' | 'disk',
 *   difficulty: 'medium',
 *   algorithm?: string,
 *   ...customParams (type-specific)
 * }
 */
router.post('/custom', (req, res) => {
    try {
        const params = req.body;
        
        if (!params.type) {
            return res.status(400).json({
                success: false,
                message: 'Type is required'
            });
        }
        
        // Generate custom test
        const testData = generateCustomTest(params);
        
        // Create session ID
        const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Store correct answer server-side
        testStore.set(sessionId, {
            answers: [testData.correctAnswer],
            createdAt: Date.now(),
            params
        });
        
        cleanupOldSessions();
        
        // Return only question to frontend
        res.json({
            success: true,
            data: {
                sessionId,
                question: testData.question
            }
        });
        
    } catch (error) {
        console.error('Error generating custom test:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Error generating custom test'
        });
    }
});

/**
 * GET /api/test-generation/verify/:sessionId
 * Get correct answers for verification (should be called after user completes test)
 */
router.get('/verify/:sessionId', (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const testData = testStore.get(sessionId);
        
        if (!testData) {
            return res.status(404).json({
                success: false,
                message: 'Test session not found or expired'
            });
        }
        
        res.json({
            success: true,
            data: {
                answers: testData.answers
            }
        });
        
    } catch (error) {
        console.error('Error retrieving test answers:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving test answers'
        });
    }
});

/**
 * DELETE /api/test-generation/session/:sessionId
 * Clean up a test session after completion
 */
router.delete('/session/:sessionId', (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const deleted = testStore.delete(sessionId);
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Test session not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Test session deleted'
        });
        
    } catch (error) {
        console.error('Error deleting test session:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting test session'
        });
    }
});

/**
 * Clean up test sessions older than 1 hour
 */
function cleanupOldSessions() {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    for (const [sessionId, data] of testStore.entries()) {
        if (data.createdAt < oneHourAgo) {
            testStore.delete(sessionId);
        }
    }
}

// Run cleanup every 10 minutes
setInterval(cleanupOldSessions, 10 * 60 * 1000);

export default router;
