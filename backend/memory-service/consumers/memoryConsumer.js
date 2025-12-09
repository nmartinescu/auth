import rabbitMQConnection from '../config/rabbitmq.js';
import { simulateMemoryManagement } from '../services/memoryManagementService.js';
import { generateMemoryQuestion, generateMultipleMemoryQuestions } from '../services/test/memoryTestService.js';

const MEMORY_MANAGEMENT_QUEUE = 'memory-management';
const MEMORY_TEST_QUEUE = 'memory-test';

async function processMemoryManagement(message, channel) {
    const { selectedAlgorithm, frameCount, pageReferences, correlationId, replyTo } = message;

    try {
        console.log('Processing memory management request:', { algorithm: selectedAlgorithm?.[0], correlationId });

        if (!selectedAlgorithm || !Array.isArray(selectedAlgorithm) || selectedAlgorithm.length === 0) {
            throw new Error("selectedAlgorithm array is required and must not be empty");
        }

        const algorithm = selectedAlgorithm[0];
        const supportedAlgorithms = ['fifo', 'lru', 'lfu', 'optimal', 'mru'];
        
        if (!supportedAlgorithms.includes(algorithm.toLowerCase())) {
            throw new Error(`unsupported algorithm: ${algorithm}. supported algorithms: ${supportedAlgorithms.join(', ')}`);
        }

        if (typeof frameCount !== 'number' || frameCount <= 0 || frameCount > 20) {
            throw new Error("frameCount must be a positive number between 1 and 20");
        }

        if (!pageReferences || !Array.isArray(pageReferences) || pageReferences.length === 0) {
            throw new Error("pageReferences array is required and must not be empty");
        }

        for (let i = 0; i < pageReferences.length; i++) {
            const page = pageReferences[i];
            if (typeof page !== 'number' || page < 0 || page > 100) {
                throw new Error(`page reference ${i + 1}: must be a number between 0 and 100`);
            }
        }

        const result = simulateMemoryManagement(algorithm, pageReferences, frameCount);

        const response = {
            success: true,
            algorithm: result.algorithm,
            frameCount: result.frameCount,
            pageReferences: result.pageReferences,
            frames: result.frames,
            customData: result.customData,
            totalPageFaults: result.totalPageFaults,
            hitRate: Math.round(result.hitRate * 10000) / 100
        };

        if (replyTo && correlationId) {
            channel.sendToQueue(
                replyTo,
                Buffer.from(JSON.stringify(response)),
                { correlationId }
            );
            console.log('Memory management response sent:', { correlationId, algorithm });
        }

    } catch (error) {
        console.error("Memory management error:", error);
        
        let errorMessage = error.message || "An error occurred during memory management simulation";
        let errorDetails = null;
        
        // Provide more user-friendly error messages
        if (error.message?.includes("selectedAlgorithm array is required")) {
            errorMessage = "Invalid input: Please select a valid algorithm";
        } else if (error.message?.includes("unsupported algorithm")) {
            errorMessage = "Invalid algorithm: Please choose from FIFO, LRU, LFU, Optimal, or MRU";
        } else if (error.message?.includes("frameCount must be")) {
            errorMessage = "Invalid input: Frame count must be between 1 and 20";
        } else if (error.message?.includes("pageReferences array")) {
            errorMessage = "Invalid input: Please provide a valid array of page references";
        } else if (error.message?.includes("page reference")) {
            errorMessage = error.message; // Keep detailed page validation errors
        } else if (error.message?.includes("non empty array")) {
            errorMessage = "Invalid input: Page references cannot be empty";
        } else if (error.message?.includes("frame count cannot exceed")) {
            errorMessage = "Invalid input: Frame count cannot be greater than the number of page references";
        } else if (error.message?.includes("non negative integers")) {
            errorMessage = "Invalid input: All page references must be non-negative integers";
        }
        
        const errorResponse = {
            success: false,
            error: errorMessage,
            details: errorDetails
        };

        if (message.replyTo && message.correlationId) {
            channel.sendToQueue(
                message.replyTo,
                Buffer.from(JSON.stringify(errorResponse)),
                { correlationId: message.correlationId }
            );
            console.log('Memory management error response sent:', { correlationId: message.correlationId, error: errorMessage });
        }
    }
}

async function processTestGeneration(message, channel) {
    const { type, count, difficulty, correlationId, replyTo } = message;

    try {
        console.log('Processing memory test generation request:', { type, count, difficulty, correlationId });

        let response;

        if (type === 'single') {
            const question = generateMemoryQuestion(difficulty);
            response = {
                success: true,
                question: question.question,
                correctAnswer: question.correctAnswer
            };
        } else if (type === 'multiple') {
            const questions = generateMultipleMemoryQuestions(count || 5, difficulty);
            response = {
                success: true,
                questions: questions.map(q => q.question),
                correctAnswers: questions.map(q => q.correctAnswer)
            };
        } else {
            throw new Error('Invalid test type. Use "single" or "multiple"');
        }

        if (replyTo && correlationId) {
            channel.sendToQueue(
                replyTo,
                Buffer.from(JSON.stringify(response)),
                { correlationId }
            );
            console.log('Memory test response sent:', { correlationId, type });
        }

    } catch (error) {
        console.error('Memory test generation error:', error);
        
        let errorMessage = error.message || 'An error occurred while generating memory test';
        
        if (error.message?.includes("difficulty")) {
            errorMessage = "Invalid difficulty level. Please choose: easy, medium, or hard";
        }
        
        const errorResponse = {
            success: false,
            error: errorMessage
        };

        if (message.replyTo && message.correlationId) {
            channel.sendToQueue(
                message.replyTo,
                Buffer.from(JSON.stringify(errorResponse)),
                { correlationId: message.correlationId }
            );
            console.log('Memory test generation error response sent:', { correlationId: message.correlationId, error: errorMessage });
        }
    }
}

export async function startConsumer() {
    try {
        const channel = await rabbitMQConnection.getChannel();

        await channel.assertQueue(MEMORY_MANAGEMENT_QUEUE, { durable: true });
        await channel.assertQueue(MEMORY_TEST_QUEUE, { durable: true });

        console.log(`Waiting for messages in queues: ${MEMORY_MANAGEMENT_QUEUE}, ${MEMORY_TEST_QUEUE}`);

        channel.prefetch(1);

        channel.consume(MEMORY_MANAGEMENT_QUEUE, async (msg) => {
            if (msg !== null) {
                try {
                    const messageContent = JSON.parse(msg.content.toString());
                    await processMemoryManagement(messageContent, channel);
                    channel.ack(msg);
                } catch (error) {
                    console.error('Error processing memory management message:', error);
                    channel.nack(msg, false, false);
                }
            }
        });

        channel.consume(MEMORY_TEST_QUEUE, async (msg) => {
            if (msg !== null) {
                try {
                    const messageContent = JSON.parse(msg.content.toString());
                    await processTestGeneration(messageContent, channel);
                    channel.ack(msg);
                } catch (error) {
                    console.error('Error processing memory test message:', error);
                    channel.nack(msg, false, false);
                }
            }
        });

        console.log('Memory service consumer started successfully');

    } catch (error) {
        console.error('Failed to start consumer:', error);
        throw error;
    }
}
