import express from "express";
import rabbitMQClient from "../services/rabbitMQClient.js";

const router = express.Router();

/**
 * POST /api/cpu-scheduling
 * CPU Scheduling Simulation via RabbitMQ
 */
router.post("/", async (req, res) => {
    try {
        const { algorithm = "FCFS", quantum, queues, quantums, allotment, processes } = req.body;

        console.log('Received CPU scheduling request:', { algorithm, processCount: processes?.length });

        // Send request to CPU service via RabbitMQ
        const response = await rabbitMQClient.requestCPUScheduling({
            algorithm,
            quantum,
            queues,
            quantums,
            allotment,
            processes
        });

        console.log('Received response from CPU service');

        // Return the response
        res.json(response);

    } catch (error) {
        console.error("CPU scheduling request error:", error);
        
        const errorMessage = error.response?.error || error.message || "Failed to process CPU scheduling request";
        const statusCode = error.response?.error ? 400 : 500;
        
        res.status(statusCode).json({
            success: false,
            error: errorMessage,
            details: error.response?.details || null
        });
    }
});

/**
 * POST /api/cpu-scheduling/test/generate
 * Generate CPU test question via RabbitMQ
 */
router.post("/test/generate", async (req, res) => {
    try {
        const { difficulty = 'medium', algorithm = null } = req.body;

        console.log('Received CPU test generation request:', { difficulty, algorithm });

        // Send request to CPU service via RabbitMQ
        const response = await rabbitMQClient.requestCPUTest({
            type: 'single',
            difficulty,
            algorithm
        });

        console.log('Received test generation response from CPU service');

        // Return the response
        res.json(response);

    } catch (error) {
        console.error("CPU test generation request error:", error);
        
        const errorMessage = error.response?.error || error.message || "Failed to generate CPU test question";
        const statusCode = error.response?.error ? 400 : 500;
        
        res.status(statusCode).json({
            success: false,
            error: errorMessage
        });
    }
});

/**
 * POST /api/cpu-scheduling/test/generate-multiple
 * Generate multiple CPU test questions via RabbitMQ
 */
router.post("/test/generate-multiple", async (req, res) => {
    try {
        const { count = 5, difficulty = 'medium' } = req.body;

        console.log('Received multiple CPU test generation request:', { count, difficulty });

        // Send request to CPU service via RabbitMQ
        const response = await rabbitMQClient.requestCPUTest({
            type: 'multiple',
            count,
            difficulty
        });

        console.log('Received multiple test generation response from CPU service');

        // Return the response
        res.json(response);

    } catch (error) {
        console.error("CPU multiple test generation request error:", error);
        
        const errorMessage = error.response?.error || error.message || "Failed to generate CPU test questions";
        const statusCode = error.response?.error ? 400 : 500;
        
        res.status(statusCode).json({
            success: false,
            error: errorMessage
        });
    }
});

export default router;
