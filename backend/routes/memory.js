import express from "express";
import MemoryManager from "../memory/MemoryManager.js";

const router = express.Router();

/**
 * POST /api/memory
 * Memory Management Simulation Endpoint
 * 
 * Expected request body:
 * {
 *   "selectedAlgorithm": ["fifo"], // Supported: fifo, lru, lfu, optimal, mru
 *   "frameCount": 3,
 *   "pageReferences": [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5]
 * }
 */
router.post("/", async (req, res) => {
    try {
        const { selectedAlgorithm, frameCount, pageReferences } = req.body;

        // Validate input
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
                message: `Unsupported algorithm: ${algorithm}. Supported algorithms: ${supportedAlgorithms.join(', ')}`
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

        // Validate page references
        for (let i = 0; i < pageReferences.length; i++) {
            const page = pageReferences[i];
            if (typeof page !== 'number' || page < 0 || page > 100) {
                return res.status(400).json({
                    success: false,
                    message: `Page reference ${i + 1}: must be a number between 0 and 100`
                });
            }
        }

        // Create memory manager and run simulation
        const memoryManager = new MemoryManager(frameCount, pageReferences, algorithm);
        const result = memoryManager.simulate();

        res.json({
            success: true,
            algorithm: algorithm.toUpperCase(),
            frameCount,
            pageReferences,
            frames: result.frames,
            customData: result.customData,
            totalPageFaults: result.totalPageFaults,
            hitRate: Math.round(result.hitRate * 10000) / 100 // Convert to percentage with 2 decimal places
        });

    } catch (error) {
        console.error("Memory management error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error during memory management simulation"
        });
    }
});

export default router;