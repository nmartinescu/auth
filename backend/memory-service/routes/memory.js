import express from "express";
import { simulateMemoryManagement } from "../services/memoryManagementService.js";

const router = express.Router();

/**
 * POST /api/memory
 * memory management simulation endpoint
 * 
 * expected request body:
 * {
 *   "selectedAlgorithm": ["fifo"], // supported: fifo, lru, lfu, optimal, mru
 *   "frameCount": 3,
 *   "pageReferences": [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5]
 * }
 */
router.post("/", async (req, res) => {
    try {
        const { selectedAlgorithm, frameCount, pageReferences } = req.body;

        // validate input
        if (!selectedAlgorithm || !Array.isArray(selectedAlgorithm) || selectedAlgorithm.length === 0) {
            return res.status(400).json({
                success: false,
                message: "selectedAlgorithm array is required and must not be empty"
            });
        }

        const algorithm = selectedAlgorithm[0];
        const supportedAlgorithms = ['fifo', 'lru', 'lfu', 'optimal', 'mru'];
        
        if (!supportedAlgorithms.includes(algorithm.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: `unsupported algorithm: ${algorithm}. supported algorithms: ${supportedAlgorithms.join(', ')}`
            });
        }

        if (typeof frameCount !== 'number' || frameCount <= 0 || frameCount > 20) {
            return res.status(400).json({
                success: false,
                message: "frameCount must be a positive number between 1 and 20"
            });
        }

        if (!pageReferences || !Array.isArray(pageReferences) || pageReferences.length === 0) {
            return res.status(400).json({
                success: false,
                message: "pageReferences array is required and must not be empty"
            });
        }

        // validate page references
        for (let i = 0; i < pageReferences.length; i++) {
            const page = pageReferences[i];
            if (typeof page !== 'number' || page < 0 || page > 100) {
                return res.status(400).json({
                    success: false,
                    message: `page reference ${i + 1}: must be a number between 0 and 100`
                });
            }
        }

        // run memory management simulation
        const result = simulateMemoryManagement(algorithm, pageReferences, frameCount);

        res.json({
            success: true,
            algorithm: result.algorithm,
            frameCount: result.frameCount,
            pageReferences: result.pageReferences,
            frames: result.frames,
            customData: result.customData,
            totalPageFaults: result.totalPageFaults,
            hitRate: Math.round(result.hitRate * 10000) / 100 // convert to percentage with 2 decimal places
        });

    } catch (error) {
        console.error("memory management error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "internal server error during memory management simulation"
        });
    }
});

export default router;