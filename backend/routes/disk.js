import express from "express";
import { simulateDiskScheduling } from "../services/diskSchedulingService.js";
import diskTestRoutes from "./diskTest.js";

const router = express.Router();

// Mount test routes
router.use("/test", diskTestRoutes);

// POST /api/disk - Simulate disk scheduling
router.post("/", async (req, res) => {
    console.log("POST /api/disk called");
    console.log("Request body:", req.body);

    try {
        const {
            algorithm,
            requests,
            initialHeadPosition,
            maxDiskSize,
            headDirection
        } = req.body;

        // Validate required fields
        if (!algorithm) {
            return res.status(400).json({
                success: false,
                message: "Algorithm is required"
            });
        }

        if (!Array.isArray(requests) || requests.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Requests must be a non-empty array"
            });
        }

        if (initialHeadPosition === undefined || initialHeadPosition === null) {
            return res.status(400).json({
                success: false,
                message: "Initial head position is required"
            });
        }

        if (!maxDiskSize || maxDiskSize <= 0) {
            return res.status(400).json({
                success: false,
                message: "Max disk size must be a positive number"
            });
        }

        // Set default head direction if not provided
        const direction = headDirection || "right";

        console.log("Starting disk scheduling simulation...");
        console.log(`Algorithm: ${algorithm}`);
        console.log(`Initial Head Position: ${initialHeadPosition}`);
        console.log(`Max Disk Size: ${maxDiskSize}`);
        console.log(`Head Direction: ${direction}`);
        console.log(`Requests: [${requests.join(", ")}]`);

        // Run the simulation
        const result = simulateDiskScheduling(
            algorithm,
            requests,
            initialHeadPosition,
            maxDiskSize,
            direction
        );

        console.log("Disk scheduling simulation completed");
        console.log(`Total Seek Time: ${result.totalSeekTime}`);
        console.log(`Average Seek Time: ${result.averageSeekTime.toFixed(2)}`);
        console.log(`Sequence: [${result.sequence.join(" → ")}]`);

        res.status(200).json({
            success: true,
            message: "Disk scheduling simulation completed successfully",
            data: result
        });

    } catch (error) {
        console.error("Error in disk scheduling simulation:", error);
        
        res.status(400).json({
            success: false,
            message: error.message || "Error running disk scheduling simulation",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

export default router;