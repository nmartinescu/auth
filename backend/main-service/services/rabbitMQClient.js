import amqp from 'amqplib';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

class RabbitMQClient {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.url = process.env.RABBITMQ_URL || 'amqp://localhost';
        this.responseQueues = new Map(); // Store pending requests
    }

    async connect() {
        try {
            console.log('Connecting to RabbitMQ at:', this.url);
            this.connection = await amqp.connect(this.url);
            this.channel = await this.connection.createChannel();
            
            console.log('Successfully connected to RabbitMQ');

            // Create reply queue for responses
            const replyQueue = await this.channel.assertQueue('', { exclusive: true });
            this.replyQueueName = replyQueue.queue;

            // Setup consumer for reply queue
            this.channel.consume(this.replyQueueName, (msg) => {
                if (msg !== null) {
                    const correlationId = msg.properties.correlationId;
                    const resolve = this.responseQueues.get(correlationId);
                    
                    if (resolve) {
                        const response = JSON.parse(msg.content.toString());
                        resolve(response);
                        this.responseQueues.delete(correlationId);
                    }
                    
                    this.channel.ack(msg);
                }
            }, { noAck: false });

            // Handle connection events
            this.connection.on('error', (err) => {
                console.error('RabbitMQ connection error:', err);
                setTimeout(() => this.connect(), 5000);
            });

            this.connection.on('close', () => {
                console.warn('RabbitMQ connection closed. Reconnecting...');
                setTimeout(() => this.connect(), 5000);
            });

            return this.channel;
        } catch (error) {
            console.error('Failed to connect to RabbitMQ:', error);
            setTimeout(() => this.connect(), 5000);
            throw error;
        }
    }

    async getChannel() {
        if (!this.channel) {
            await this.connect();
        }
        return this.channel;
    }

    /**
     * Send a request to a queue and wait for a response
     */
    async sendRequest(queue, message, timeout = 30000) {
        const channel = await this.getChannel();
        const correlationId = crypto.randomUUID();

        return new Promise((resolve, reject) => {
            // Set timeout
            const timeoutId = setTimeout(() => {
                this.responseQueues.delete(correlationId);
                reject(new Error(`Request timeout after ${timeout}ms`));
            }, timeout);

            // Store the resolver
            this.responseQueues.set(correlationId, (response) => {
                clearTimeout(timeoutId);
                resolve(response);
            });

            // Send the message
            const messageWithMetadata = {
                ...message,
                correlationId,
                replyTo: this.replyQueueName
            };

            channel.sendToQueue(
                queue,
                Buffer.from(JSON.stringify(messageWithMetadata)),
                {
                    correlationId,
                    replyTo: this.replyQueueName,
                    persistent: true
                }
            );

            console.log(`Message sent to queue ${queue} with correlationId ${correlationId}`);
        });
    }

    /**
     * Request CPU scheduling simulation
     */
    async requestCPUScheduling(data) {
        return this.sendRequest('cpu-scheduling', data);
    }

    /**
     * Request CPU test generation
     */
    async requestCPUTest(data) {
        return this.sendRequest('cpu-test', data);
    }

    /**
     * Request Disk scheduling simulation
     */
    async requestDiskScheduling(data) {
        return this.sendRequest('disk-scheduling', data);
    }

    /**
     * Request Disk test generation
     */
    async requestDiskTest(data) {
        return this.sendRequest('disk-test', data);
    }

    /**
     * Request Memory management simulation
     */
    async requestMemoryManagement(data) {
        return this.sendRequest('memory-management', data);
    }

    /**
     * Request Memory test generation
     */
    async requestMemoryTest(data) {
        return this.sendRequest('memory-test', data);
    }

    async close() {
        try {
            if (this.channel) {
                await this.channel.close();
            }
            if (this.connection) {
                await this.connection.close();
            }
            console.log('RabbitMQ connection closed');
        } catch (error) {
            console.error('Error closing RabbitMQ connection:', error);
        }
    }
}

const rabbitMQClient = new RabbitMQClient();

export default rabbitMQClient;
