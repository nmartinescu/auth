import express from "express";
import rabbitMQClient from "../services/rabbitMQClient.js";

const router = express.Router();

/**
 * POST /api/disk-scheduling
 * Disk Scheduling Simulation via RabbitMQ
 */
router.post("/", async (req, res) => {
    try {
        const { algorithm, requests, initialHeadPosition, maxDiskSize, headDirection } = req.body;

        console.log('Received disk scheduling request:', { algorithm, requestsCount: requests?.length });

        const response = await rabbitMQClient.requestDiskScheduling({
            algorithm,
            requests,
            initialHeadPosition,
            maxDiskSize,
            headDirection
        });

        console.log('Received response from Disk service');
        res.json(response);

    } catch (error) {
        console.error("Disk scheduling request error:", error);
        
        // Check if error response from service contains structured error
        const errorMessage = error.response?.error || error.message || "Failed to process disk scheduling request";
        const statusCode = error.response?.error ? 400 : 500;
        
        res.status(statusCode).json({
            success: false,
            error: errorMessage,
            details: error.response?.details || null
        });
    }
});

/**
 * POST /api/disk-scheduling/test/generate
 * Generate Disk test question via RabbitMQ
 */
router.post("/test/generate", async (req, res) => {
    try {
        const { difficulty = 'medium' } = req.body;

        console.log('Received disk test generation request:', { difficulty });

        const response = await rabbitMQClient.requestDiskTest({
            type: 'single',
            difficulty
        });

        console.log('Received test generation response from Disk service');
        res.json(response);

    } catch (error) {
        console.error("Disk test generation request error:", error);
        
        const errorMessage = error.response?.error || error.message || "Failed to generate disk test question";
        const statusCode = error.response?.error ? 400 : 500;
        
        res.status(statusCode).json({
            success: false,
            error: errorMessage
        });
    }
});

/**
 * POST /api/disk-scheduling/test/generate-multiple
 * Generate multiple Disk test questions via RabbitMQ
 */
router.post("/test/generate-multiple", async (req, res) => {
    try {
        const { count = 5, difficulty = 'medium' } = req.body;

        console.log('Received multiple disk test generation request:', { count, difficulty });

        const response = await rabbitMQClient.requestDiskTest({
            type: 'multiple',
            count,
            difficulty
        });

        console.log('Received multiple test generation response from Disk service');
        res.json(response);

    } catch (error) {
        console.error("Disk multiple test generation request error:", error);
        
        const errorMessage = error.response?.error || error.message || "Failed to generate disk test questions";
        const statusCode = error.response?.error ? 400 : 500;
        
        res.status(statusCode).json({
            success: false,
            error: errorMessage
        });
    }
});

export default router;
