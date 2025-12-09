import express from "express";
import rabbitMQClient from "../services/rabbitMQClient.js";

const router = express.Router();

/**
 * POST /api/memory-management
 * Memory Management Simulation via RabbitMQ
 */
router.post("/", async (req, res) => {
    try {
        const { selectedAlgorithm, frameCount, pageReferences } = req.body;

        console.log('Received memory management request:', { algorithm: selectedAlgorithm?.[0], frameCount });

        const response = await rabbitMQClient.requestMemoryManagement({
            selectedAlgorithm,
            frameCount,
            pageReferences
        });

        console.log('Received response from Memory service');
        res.json(response);

    } catch (error) {
        console.error("Memory management request error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to process memory management request"
        });
    }
});

/**
 * POST /api/memory-management/test/generate
 * Generate a single memory test question
 */
router.post("/test/generate", async (req, res) => {
    try {
        const { difficulty = 'medium' } = req.body;

        console.log('Received memory test generation request:', { difficulty });

        const response = await rabbitMQClient.requestMemoryTest({
            type: 'single',
            difficulty
        });

        console.log('Received test response from Memory service');
        res.json(response);

    } catch (error) {
        console.error("Memory test generation error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to generate memory test"
        });
    }
});

/**
 * POST /api/memory-management/test/generate-multiple
 * Generate multiple memory test questions
 */
router.post("/test/generate-multiple", async (req, res) => {
    try {
        const { count = 5, difficulty = 'medium' } = req.body;

        console.log('Received memory multiple test generation request:', { count, difficulty });

        const response = await rabbitMQClient.requestMemoryTest({
            type: 'multiple',
            count,
            difficulty
        });

        console.log('Received multiple test response from Memory service');
        res.json(response);

    } catch (error) {
        console.error("Memory multiple test generation error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to generate memory tests"
        });
    }
});

export default router;
