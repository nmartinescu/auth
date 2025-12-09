import rabbitMQConnection from '../config/rabbitmq.js';
import { simulateDiskScheduling } from '../services/diskSchedulingService.js';
import {
    generateDiskSchedulingQuestion,
    generateMultipleQuestions
} from '../services/test/diskTestService.js';

const DISK_SCHEDULING_QUEUE = 'disk-scheduling';
const DISK_TEST_QUEUE = 'disk-test';

async function processDiskScheduling(message, channel) {
    const { algorithm, requests, initialHeadPosition, maxDiskSize, headDirection, correlationId, replyTo } = message;

    try {
        console.log('Processing disk scheduling request:', { algorithm, correlationId });

        if (!algorithm) {
            throw new Error("Algorithm is required");
        }

        if (!Array.isArray(requests) || requests.length === 0) {
            throw new Error("Requests must be a non-empty array");
        }

        if (initialHeadPosition === undefined || initialHeadPosition === null) {
            throw new Error("Initial head position is required");
        }

        if (!maxDiskSize || maxDiskSize <= 0) {
            throw new Error("Max disk size must be a positive number");
        }

        const direction = headDirection || "right";

        const result = simulateDiskScheduling(
            algorithm,
            requests,
            initialHeadPosition,
            maxDiskSize,
            direction
        );

        const response = {
            success: true,
            message: "Disk scheduling simulation completed successfully",
            data: result
        };

        if (replyTo && correlationId) {
            channel.sendToQueue(
                replyTo,
                Buffer.from(JSON.stringify(response)),
                { correlationId }
            );
            console.log('Disk scheduling response sent:', { correlationId, algorithm });
        }

    } catch (error) {
        console.error("Disk scheduling error:", error);
        
        const errorResponse = {
            success: false,
            message: error.message || "Error running disk scheduling simulation"
        };

        if (message.replyTo && message.correlationId) {
            channel.sendToQueue(
                message.replyTo,
                Buffer.from(JSON.stringify(errorResponse)),
                { correlationId: message.correlationId }
            );
            console.log('Disk scheduling error response sent:', { correlationId: message.correlationId });
        }
    }
}

async function processDiskTestGeneration(message, channel) {
    const { type, difficulty = 'medium', count = 1, correlationId, replyTo } = message;

    try {
        console.log('Processing disk test generation:', { type, difficulty, count, correlationId });

        const validDifficulties = ['easy', 'medium', 'hard'];
        if (!validDifficulties.includes(difficulty)) {
            throw new Error(`Invalid difficulty. Must be one of: ${validDifficulties.join(', ')}`);
        }

        let response;

        if (type === 'single') {
            const testQuestion = generateDiskSchedulingQuestion(difficulty);
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
            if (count < 1 || count > 20) {
                throw new Error("Count must be between 1 and 20");
            }

            const testQuestions = generateMultipleQuestions(count, difficulty);
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

        if (replyTo && correlationId) {
            channel.sendToQueue(
                replyTo,
                Buffer.from(JSON.stringify(response)),
                { correlationId }
            );
            console.log('Disk test generation response sent:', { correlationId, type });
        }

    } catch (error) {
        console.error("Disk test generation error:", error);
        
        const errorResponse = {
            success: false,
            message: error.message || "Error generating test question"
        };

        if (message.replyTo && message.correlationId) {
            channel.sendToQueue(
                message.replyTo,
                Buffer.from(JSON.stringify(errorResponse)),
                { correlationId: message.correlationId }
            );
        }
    }
}

export async function startConsumer() {
    try {
        const channel = await rabbitMQConnection.getChannel();

        await channel.assertQueue(DISK_SCHEDULING_QUEUE, { durable: true });
        await channel.assertQueue(DISK_TEST_QUEUE, { durable: true });

        console.log(`Waiting for messages in queues: ${DISK_SCHEDULING_QUEUE}, ${DISK_TEST_QUEUE}`);

        channel.prefetch(1);

        channel.consume(DISK_SCHEDULING_QUEUE, async (msg) => {
            if (msg !== null) {
                try {
                    const messageContent = JSON.parse(msg.content.toString());
                    await processDiskScheduling(messageContent, channel);
                    channel.ack(msg);
                } catch (error) {
                    console.error('Error processing disk scheduling message:', error);
                    channel.nack(msg, false, false);
                }
            }
        });

        channel.consume(DISK_TEST_QUEUE, async (msg) => {
            if (msg !== null) {
                try {
                    const messageContent = JSON.parse(msg.content.toString());
                    await processDiskTestGeneration(messageContent, channel);
                    channel.ack(msg);
                } catch (error) {
                    console.error('Error processing disk test message:', error);
                    channel.nack(msg, false, false);
                }
            }
        });

        console.log('Disk service consumer started successfully');

    } catch (error) {
        console.error('Failed to start consumer:', error);
        throw error;
    }
}
