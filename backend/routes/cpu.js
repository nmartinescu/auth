import express from "express";
import SchedulerFCFS from "../algorithms/scheduler/algorithms/SchedulerFCFS.js";
import SchedulerSJF from "../algorithms/scheduler/algorithms/SchedulerSJF.js";
import SchedulerRR from "../algorithms/scheduler/algorithms/SchedulerRR.js";
import SchedulerSTCF from "../algorithms/scheduler/algorithms/SchedulerSTCF.js";
import SchedulerMLFQ from "../algorithms/scheduler/algorithms/SchedulerMLFQ.js";

const router = express.Router();

/**
 * POST /api/cpu
 * CPU Scheduling Simulation Endpoint
 * 
 * Expected request body:
 * {
 *   "algorithm": "FCFS", // Supported: FCFS, SJF, RR, STCF, MLFQ
 *   "quantum": 2, // Required for RR algorithm
 *   "queues": 3, // Required for MLFQ - number of priority queues
 *   "quantums": [2, 4, 8], // Required for MLFQ - quantum for each queue
 *   "allotment": 20, // Required for MLFQ - allotment time before reset
 *   "processes": [
 *     {
 *       "arrivalTime": 0,
 *       "burstTime": 5,
 *       "io": [
 *         { "start": 2, "duration": 3 },
 *         { "start": 4, "duration": 1 }
 *       ]
 *     }
 *   ]
 * }
 */
router.post("/", async (req, res) => {
    try {
        const { algorithm = "FCFS", quantum, queues, quantums, allotment, processes } = req.body;

        // Validate input
        if (!processes || !Array.isArray(processes) || processes.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Processes array is required and must not be empty"
            });
        }

        // Validate each process
        for (let i = 0; i < processes.length; i++) {
            const process = processes[i];
            
            if (typeof process.arrivalTime !== 'number' || process.arrivalTime < 0) {
                return res.status(400).json({
                    success: false,
                    message: `Process ${i + 1}: arrivalTime must be a non-negative number`
                });
            }
            
            if (typeof process.burstTime !== 'number' || process.burstTime <= 0) {
                return res.status(400).json({
                    success: false,
                    message: `Process ${i + 1}: burstTime must be a positive number`
                });
            }
            
            // Validate IO array if provided
            if (process.io && !Array.isArray(process.io)) {
                return res.status(400).json({
                    success: false,
                    message: `Process ${i + 1}: io must be an array`
                });
            }
            
            // Set default empty IO array if not provided
            if (!process.io) {
                process.io = [];
            }
            
            // Validate each IO operation
            for (let j = 0; j < process.io.length; j++) {
                const io = process.io[j];
                
                if (typeof io.start !== 'number' || io.start < 0) {
                    return res.status(400).json({
                        success: false,
                        message: `Process ${i + 1}, IO ${j + 1}: start must be a non-negative number`
                    });
                }
                
                if (typeof io.duration !== 'number' || io.duration <= 0) {
                    return res.status(400).json({
                        success: false,
                        message: `Process ${i + 1}, IO ${j + 1}: duration must be a positive number`
                    });
                }
                
                if (io.start >= process.burstTime) {
                    return res.status(400).json({
                        success: false,
                        message: `Process ${i + 1}, IO ${j + 1}: start time (${io.start}) must be less than burst time (${process.burstTime})`
                    });
                }
            }
            
            // Sort IO operations by start time
            process.io.sort((a, b) => a.start - b.start);
        }

        // Validate quantum for Round Robin
        if (algorithm.toUpperCase() === "RR") {
            if (typeof quantum !== 'number' || quantum <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Round Robin algorithm requires a positive quantum value"
                });
            }
        }

        // Validate MLFQ parameters
        if (algorithm.toUpperCase() === "MLFQ") {
            if (typeof queues !== 'number' || queues <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "MLFQ algorithm requires a positive number of queues"
                });
            }
            
            if (!Array.isArray(quantums) || quantums.length !== queues) {
                return res.status(400).json({
                    success: false,
                    message: "MLFQ algorithm requires quantums array with length equal to number of queues"
                });
            }
            
            for (let i = 0; i < quantums.length; i++) {
                if (typeof quantums[i] !== 'number' || quantums[i] <= 0) {
                    return res.status(400).json({
                        success: false,
                        message: `MLFQ quantum at index ${i} must be a positive number`
                    });
                }
            }
            
            if (typeof allotment !== 'number' || allotment <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "MLFQ algorithm requires a positive allotment value"
                });
            }
        }

        // Create scheduler based on algorithm
        let scheduler;
        switch (algorithm.toUpperCase()) {
            case "FCFS":
                scheduler = new SchedulerFCFS(processes);
                break;
            case "SJF":
                scheduler = new SchedulerSJF(processes);
                break;
            case "RR":
                scheduler = new SchedulerRR(processes, { quantum });
                break;
            case "STCF":
                scheduler = new SchedulerSTCF(processes);
                break;
            case "MLFQ":
                scheduler = new SchedulerMLFQ(processes, { queues, quantums, allotment });
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: `Unsupported algorithm: ${algorithm}. Supported algorithms: FCFS, SJF, RR, STCF, MLFQ`
                });
        }

        // Run the simulation
        try {
            scheduler.start();
        } catch (simulationError) {
            console.error("Simulation error:", simulationError);
            console.error("Error stack:", simulationError.stack);
            return res.status(500).json({
                success: false,
                message: `Simulation failed: ${simulationError.message}`
            });
        }
        
        // Get the results
        const solution = scheduler.getSolution();

        // Calculate additional metrics
        const metrics = calculateMetrics(solution.customData, processes);

        res.json({
            success: true,
            data: {
                algorithm: algorithm.toUpperCase(),
                processes: processes.length,
                solution: solution.customData,
                metrics
            }
        });

    } catch (error) {
        console.error("CPU scheduling error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error during CPU scheduling simulation"
        });
    }
});

/**
 * Calculate performance metrics from the simulation results
 */
function calculateMetrics(customData, originalProcesses) {
    if (!customData || customData.length === 0) {
        return {
            averageWaitingTime: 0,
            averageTurnaroundTime: 0,
            averageResponseTime: 0,
            cpuUtilization: 0,
            throughput: 0
        };
    }

    const lastStep = customData[customData.length - 1];
    const totalTime = lastStep.timer;
    
    // Extract process completion data from the last step
    const processData = [];
    
    // Find process completion information from the simulation steps
    for (let i = 0; i < customData.length; i++) {
        const step = customData[i];
        if (step.explaination && step.explaination.length > 0) {
            for (let j = 0; j < step.explaination.length; j++) {
                const explanation = step.explaination[j];
                if (explanation.includes("finished")) {
                    const pidMatch = explanation.match(/Process (\d+) finished/);
                    if (pidMatch) {
                        const pid = parseInt(pidMatch[1]);
                        const process = originalProcesses[pid - 1];
                        if (process) {
                            processData.push({
                                pid,
                                arrivalTime: process.arrivalTime,
                                burstTime: process.burstTime,
                                completionTime: step.timer,
                                turnaroundTime: step.timer - process.arrivalTime,
                                waitingTime: (step.timer - process.arrivalTime) - process.burstTime
                            });
                        }
                    }
                }
            }
        }
    }

    if (processData.length === 0) {
        return {
            averageWaitingTime: 0,
            averageTurnaroundTime: 0,
            averageResponseTime: 0,
            cpuUtilization: 0,
            throughput: 0
        };
    }

    // Calculate averages
    const totalWaitingTime = processData.reduce((sum, p) => sum + Math.max(0, p.waitingTime), 0);
    const totalTurnaroundTime = processData.reduce((sum, p) => sum + p.turnaroundTime, 0);
    const totalBurstTime = originalProcesses.reduce((sum, p) => sum + p.burstTime, 0);

    const averageWaitingTime = totalWaitingTime / processData.length;
    const averageTurnaroundTime = totalTurnaroundTime / processData.length;
    const averageResponseTime = averageWaitingTime; // For FCFS, response time = waiting time
    const cpuUtilization = totalTime > 0 ? (totalBurstTime / totalTime) * 100 : 0;
    const throughput = totalTime > 0 ? processData.length / totalTime : 0;

    return {
        averageWaitingTime: Math.round(averageWaitingTime * 100) / 100,
        averageTurnaroundTime: Math.round(averageTurnaroundTime * 100) / 100,
        averageResponseTime: Math.round(averageResponseTime * 100) / 100,
        cpuUtilization: Math.round(cpuUtilization * 100) / 100,
        throughput: Math.round(throughput * 1000) / 1000
    };
}

export default router;