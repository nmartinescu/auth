import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

class RabbitMQConnection {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.url = process.env.RABBITMQ_URL || 'amqp://localhost';
    }

    async connect() {
        while (!this.channel) {
            try {
                console.log('Connecting to RabbitMQ at:', this.url);
                this.connection = await amqp.connect(this.url);
                this.channel = await this.connection.createChannel();
                console.log('Successfully connected to RabbitMQ');

                this.connection.on('error', (err) => {
                    console.error('RabbitMQ connection error:', err);
                    this.channel = null;
                    setTimeout(() => this.connect(), 5000);
                });

                this.connection.on('close', () => {
                    console.warn('RabbitMQ connection closed. Reconnecting...');
                    this.channel = null;
                    setTimeout(() => this.connect(), 5000);
                });
                
            } catch (error) {
                console.error('Failed to connect to RabbitMQ:', error);
                this.channel = null;
                await new Promise(r => setTimeout(r, 5000));
            }
        }

        return this.channel;
    }

    async getChannel() {
        if (!this.channel) {
            await this.connect();
        }
        return this.channel;
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

const rabbitMQConnection = new RabbitMQConnection();

export default rabbitMQConnection;
