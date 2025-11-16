import express from 'express';
import TestResult from '../models/TestResult.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Route to save a test result - requires authentication
router.post('/', authenticateToken, async (req, res) => {
    console.log("🔄 POST /api/test-results called");
    console.log("📋 Request body keys:", Object.keys(req.body));
    console.log("👤 User from token:", req.user);
    
    try {
        const { sessionId, config, questions, userAnswers, score, startTime, endTime, duration, summary } = req.body;
        
        // Validate required fields
        if (!sessionId || !config || !questions || !userAnswers || score === undefined || !startTime || !endTime || !summary) {
            console.log("❌ Missing required fields");
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        // Check if test result already exists
        const existingResult = await TestResult.findOne({ sessionId });
        if (existingResult) {
            console.log("⚠️ Test result already saved for session:", sessionId);
            return res.status(200).json({
                success: true,
                message: 'Test result already saved',
                data: existingResult
            });
        }
        
        // Create new test result
        const testResult = new TestResult({
            userId: req.user.id,
            sessionId,
            config,
            questions,
            userAnswers,
            score,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            duration,
            summary
        });
        
        console.log("💾 About to save test result");
        
        // Save to database
        await testResult.save();
        
        console.log("✅ Test result saved successfully with ID:", testResult._id);
        
        res.status(201).json({
            success: true,
            message: 'Test result saved successfully',
            data: testResult
        });
    } catch (error) {
        console.error("❌ Error saving test result:", error);
        res.status(500).json({
            success: false,
            message: 'Failed to save test result',
            error: error.message
        });
    }
});

// Route to get all test results for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
    console.log("🔄 GET /api/test-results called");
    console.log("👤 User from token:", req.user);
    
    try {
        const { limit = 50, skip = 0, sortBy = 'createdAt', order = 'desc' } = req.query;
        
        const testResults = await TestResult.find({ userId: req.user.id })
            .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip))
            .lean();
        
        const total = await TestResult.countDocuments({ userId: req.user.id });
        
        console.log(`✅ Found ${testResults.length} test results for user`);
        
        res.status(200).json({
            success: true,
            data: testResults,
            pagination: {
                total,
                limit: parseInt(limit),
                skip: parseInt(skip),
                hasMore: total > parseInt(skip) + testResults.length
            }
        });
    } catch (error) {
        console.error("❌ Error fetching test results:", error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch test results',
            error: error.message
        });
    }
});

// Route to get a specific test result by ID
router.get('/:id', authenticateToken, async (req, res) => {
    console.log("🔄 GET /api/test-results/:id called");
    console.log("📋 Test result ID:", req.params.id);
    console.log("👤 User from token:", req.user);
    
    try {
        const testResult = await TestResult.findOne({
            _id: req.params.id,
            userId: req.user.id // Ensure user can only access their own results
        }).lean();
        
        if (!testResult) {
            console.log("❌ Test result not found");
            return res.status(404).json({
                success: false,
                message: 'Test result not found'
            });
        }
        
        console.log("✅ Test result found");
        
        res.status(200).json({
            success: true,
            data: testResult
        });
    } catch (error) {
        console.error("❌ Error fetching test result:", error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch test result',
            error: error.message
        });
    }
});

// Route to delete a test result
router.delete('/:id', authenticateToken, async (req, res) => {
    console.log("🔄 DELETE /api/test-results/:id called");
    console.log("📋 Test result ID:", req.params.id);
    console.log("👤 User from token:", req.user);
    
    try {
        const testResult = await TestResult.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id // Ensure user can only delete their own results
        });
        
        if (!testResult) {
            console.log("❌ Test result not found");
            return res.status(404).json({
                success: false,
                message: 'Test result not found'
            });
        }
        
        console.log("✅ Test result deleted successfully");
        
        res.status(200).json({
            success: true,
            message: 'Test result deleted successfully'
        });
    } catch (error) {
        console.error("❌ Error deleting test result:", error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete test result',
            error: error.message
        });
    }
});

// Route to get test statistics for the authenticated user
router.get('/stats/summary', authenticateToken, async (req, res) => {
    console.log("🔄 GET /api/test-results/stats/summary called");
    console.log("👤 User from token:", req.user);
    
    try {
        const results = await TestResult.find({ userId: req.user.id }).lean();
        
        if (results.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    totalTests: 0,
                    averageScore: 0,
                    highestScore: 0,
                    lowestScore: 0,
                    totalQuestions: 0,
                    correctAnswers: 0,
                    averagePercentage: 0
                }
            });
        }
        
        const totalTests = results.length;
        const averageScore = results.reduce((sum, r) => sum + r.score, 0) / totalTests;
        const highestScore = Math.max(...results.map(r => r.score));
        const lowestScore = Math.min(...results.map(r => r.score));
        const totalQuestions = results.reduce((sum, r) => sum + r.summary.totalQuestions, 0);
        const correctAnswers = results.reduce((sum, r) => sum + r.summary.correctAnswers, 0);
        const averagePercentage = results.reduce((sum, r) => sum + r.summary.percentage, 0) / totalTests;
        
        res.status(200).json({
            success: true,
            data: {
                totalTests,
                averageScore: Math.round(averageScore),
                highestScore,
                lowestScore,
                totalQuestions,
                correctAnswers,
                averagePercentage: Math.round(averagePercentage)
            }
        });
    } catch (error) {
        console.error("❌ Error fetching test statistics:", error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch test statistics',
            error: error.message
        });
    }
});

export default router;
