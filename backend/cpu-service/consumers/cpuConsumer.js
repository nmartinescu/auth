import rabbitMQConnection from '../config/rabbitmq.js';
import SchedulerFCFS from '../algorithms/algorithms/SchedulerFCFS.js';
import SchedulerSJF from '../algorithms/algorithms/SchedulerSJF.js';
import SchedulerRR from '../algorithms/algorithms/SchedulerRR.js';
import SchedulerSTCF from '../algorithms/algorithms/SchedulerSTCF.js';
import SchedulerMLFQ from '../algorithms/algorithms/SchedulerMLFQ.js';
import {
    generateCPUSchedulingQuestion,
    generateMultipleCPUQuestions
} from '../services/cpuTestService.js';

const CPU_SCHEDULING_QUEUE = 'cpu-scheduling';
const CPU_TEST_QUEUE = 'cpu-test';

/**
 * Process CPU scheduling simulation request
 */
async function processCPUScheduling(message, channel) {
    const { algorithm = "FCFS", quantum, queues, quantums, allotment, processes, correlationId, replyTo } = message;

    try {
        console.log('Processing CPU scheduling request:', { algorithm, processCount: processes?.length, correlationId });

        // Validate input
        if (!processes || !Array.isArray(processes) || processes.length === 0) {
            throw new Error("Processes array is required and must not be empty");
        }

        // Validate each process
        for (let i = 0; i < processes.length; i++) {
            const process = processes[i];
            
            if (typeof process.arrivalTime !== 'number' || process.arrivalTime < 0) {
                throw new Error(`Process ${i + 1}: arrivalTime must be a non-negative number`);
            }
            
            if (typeof process.burstTime !== 'number' || process.burstTime <= 0) {
                throw new Error(`Process ${i + 1}: burstTime must be a positive number`);
            }
            
            if (process.io && !Array.isArray(process.io)) {
                throw new Error(`Process ${i + 1}: io must be an array`);
            }
            
            if (!process.io) {
                process.io = [];
            }
            
            for (let j = 0; j < process.io.length; j++) {
                const io = process.io[j];
                
                if (typeof io.start !== 'number' || io.start < 0) {
                    throw new Error(`Process ${i + 1}, IO ${j + 1}: start must be a non-negative number`);
                }
                
                if (typeof io.duration !== 'number' || io.duration <= 0) {
                    throw new Error(`Process ${i + 1}, IO ${j + 1}: duration must be a positive number`);
                }
                
                if (io.start >= process.burstTime) {
                    throw new Error(`Process ${i + 1}, IO ${j + 1}: start time (${io.start}) must be less than burst time (${process.burstTime})`);
                }
            }
            
            process.io.sort((a, b) => a.start - b.start);
        }

        // Validate quantum for Round Robin
        if (algorithm.toUpperCase() === "RR") {
            if (typeof quantum !== 'number' || quantum <= 0) {
                throw new Error("Round Robin algorithm requires a positive quantum value");
            }
        }

        // Validate MLFQ parameters
        if (algorithm.toUpperCase() === "MLFQ") {
            if (typeof queues !== 'number' || queues <= 0) {
                throw new Error("MLFQ algorithm requires a positive number of queues");
            }
            
            if (!Array.isArray(quantums) || quantums.length !== queues) {
                throw new Error("MLFQ algorithm requires quantums array with length equal to number of queues");
            }
            
            for (let i = 0; i < quantums.length; i++) {
                if (typeof quantums[i] !== 'number' || quantums[i] <= 0) {
                    throw new Error(`MLFQ quantum at index ${i} must be a positive number`);
                }
            }
            
            if (typeof allotment !== 'number' || allotment <= 0) {
                throw new Error("MLFQ algorithm requires a positive allotment value");
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
                throw new Error(`Unsupported algorithm: ${algorithm}. Supported algorithms: FCFS, SJF, RR, STCF, MLFQ`);
        }

        // Run the simulation
        scheduler.start();
        
        // Get the results
        const solution = scheduler.getSolution();

        // Calculate additional metrics
        const metrics = calculateMetrics(solution.customData, processes);

        const response = {
            success: true,
            data: {
                algorithm: algorithm.toUpperCase(),
                processes: processes.length,
                solution: solution.customData,
                metrics
            }
        };

        // Send response back to reply queue
        if (replyTo && correlationId) {
            channel.sendToQueue(
                replyTo,
                Buffer.from(JSON.stringify(response)),
                { correlationId }
            );
            console.log('CPU scheduling response sent:', { correlationId, algorithm });
        }

    } catch (error) {
        console.error("CPU scheduling error:", error);
        
        const errorResponse = {
            success: false,
            message: error.message || "Internal server error during CPU scheduling simulation"
        };

        // Send error response back to reply queue
        if (message.replyTo && message.correlationId) {
            channel.sendToQueue(
                message.replyTo,
                Buffer.from(JSON.stringify(errorResponse)),
                { correlationId: message.correlationId }
            );
            console.log('CPU scheduling error response sent:', { correlationId: message.correlationId, error: error.message });
        }
    }
}

/**
 * Process test generation request
 */
async function processTestGeneration(message, channel) {
    const { type, difficulty = 'medium', algorithm = null, count = 1, correlationId, replyTo } = message;

    try {
        console.log('Processing test generation request:', { type, difficulty, algorithm, count, correlationId });

        // Validate difficulty
        const validDifficulties = ['easy', 'medium', 'hard'];
        if (!validDifficulties.includes(difficulty)) {
            throw new Error(`Invalid difficulty. Must be one of: ${validDifficulties.join(', ')}`);
        }

        let response;

        if (type === 'single') {
            const testQuestion = generateCPUSchedulingQuestion(difficulty, algorithm);
            response = {
                success: true,
                message: "Test question generated successfully",
                data: {
                    question: testQuestion.question,
                    questionId: Date.now()
                },
                _correctAnswer: testQuestion.correctAnswer
            };
        } else if (type === 'multiple') {
            // Validate count
            if (count < 1 || count > 20) {
                throw new Error("Count must be between 1 and 20");
            }

            const testQuestions = generateMultipleCPUQuestions(count, difficulty);
            response = {
                success: true,
                message: `${count} test questions generated successfully`,
                data: {
                    questions: testQuestions.map((q, index) => ({
                        questionId: Date.now() + index,
                        question: q.question
                    })),
                    count: testQuestions.length
                },
                _correctAnswers: testQuestions.map(q => q.correctAnswer)
            };
        } else {
            throw new Error("Invalid test generation type. Must be 'single' or 'multiple'");
        }

        // Send response back to reply queue
        if (replyTo && correlationId) {
            channel.sendToQueue(
                replyTo,
                Buffer.from(JSON.stringify(response)),
                { correlationId }
            );
            console.log('Test generation response sent:', { correlationId, type, count });
        }

    } catch (error) {
        console.error("Test generation error:", error);
        
        const errorResponse = {
            success: false,
            message: error.message || "Error generating test question"
        };

        // Send error response back to reply queue
        if (message.replyTo && message.correlationId) {
            channel.sendToQueue(
                message.replyTo,
                Buffer.from(JSON.stringify(errorResponse)),
                { correlationId: message.correlationId }
            );
            console.log('Test generation error response sent:', { correlationId: message.correlationId, error: error.message });
        }
    }
}

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
    
    const processData = [];
    
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

    const totalWaitingTime = processData.reduce((sum, p) => sum + Math.max(0, p.waitingTime), 0);
    const totalTurnaroundTime = processData.reduce((sum, p) => sum + p.turnaroundTime, 0);
    const totalBurstTime = originalProcesses.reduce((sum, p) => sum + p.burstTime, 0);

    const averageWaitingTime = totalWaitingTime / processData.length;
    const averageTurnaroundTime = totalTurnaroundTime / processData.length;
    const averageResponseTime = averageWaitingTime;
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

/**
 * Start consuming messages from RabbitMQ queues
 */
export async function startConsumer() {
    try {
        const channel = await rabbitMQConnection.getChannel();

        // Assert queues
        await channel.assertQueue(CPU_SCHEDULING_QUEUE, { durable: true });
        await channel.assertQueue(CPU_TEST_QUEUE, { durable: true });

        console.log(`Waiting for messages in queues: ${CPU_SCHEDULING_QUEUE}, ${CPU_TEST_QUEUE}`);

        // Set prefetch to 1 to handle one message at a time
        channel.prefetch(1);

        // Consume CPU scheduling messages
        channel.consume(CPU_SCHEDULING_QUEUE, async (msg) => {
            if (msg !== null) {
                try {
                    const messageContent = JSON.parse(msg.content.toString());
                    console.log('Received CPU scheduling message:', { correlationId: messageContent.correlationId });
                    
                    await processCPUScheduling(messageContent, channel);
                    
                    channel.ack(msg);
                } catch (error) {
                    console.error('Error processing CPU scheduling message:', error);
                    channel.nack(msg, false, false); // Don't requeue on error
                }
            }
        });

        // Consume test generation messages
        channel.consume(CPU_TEST_QUEUE, async (msg) => {
            if (msg !== null) {
                try {
                    const messageContent = JSON.parse(msg.content.toString());
                    console.log('Received test generation message:', { correlationId: messageContent.correlationId });
                    
                    await processTestGeneration(messageContent, channel);
                    
                    channel.ack(msg);
                } catch (error) {
                    console.error('Error processing test generation message:', error);
                    channel.nack(msg, false, false);
                }
            }
        });

        console.log('CPU service consumer started successfully');

    } catch (error) {
        console.error('Failed to start consumer:', error);
        throw error;
    }
}
