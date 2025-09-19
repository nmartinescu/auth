import express from 'express';
import logAnalyzer from '../utils/logAnalyzer.js';

const router = express.Router();

// Only enable in development mode for security
if (process.env.NODE_ENV === 'development') {
    

    router.get('/analysis', (req, res) => {
        try {
            const analysis = {
                requests: logAnalyzer.getRequestStats(),
                errors: logAnalyzer.getErrorAnalysis(),
                security: logAnalyzer.getSecurityEvents(),
                rateLimits: logAnalyzer.getRateLimitEvents()
            };
            
            res.json({
                success: true,
                data: analysis,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error analyzing logs',
                error: error.message
            });
        }
    });
    
    // Get recent access logs
    router.get('/access', (req, res) => {
        try {
            const logs = logAnalyzer.parseLogFile('access.log');
            const limit = parseInt(req.query.limit) || 50;
            
            res.json({
                success: true,
                data: {
                    total: logs.length,
                    recent: logs.slice(-limit).reverse()
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error reading access logs',
                error: error.message
            });
        }
    });
    
    // Get recent error logs
    router.get('/errors', (req, res) => {
        try {
            const logs = logAnalyzer.parseLogFile('error.log');
            const limit = parseInt(req.query.limit) || 20;
            
            res.json({
                success: true,
                data: {
                    total: logs.length,
                    recent: logs.slice(-limit).reverse()
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error reading error logs',
                error: error.message
            });
        }
    });
    
} else {
    // In production, return 404 for all log endpoints
    router.use('*', (req, res) => {
        res.status(404).json({
            success: false,
            message: 'Log endpoints not available in production'
        });
    });
}

export default router;