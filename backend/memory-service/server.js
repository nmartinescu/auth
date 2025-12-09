import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import rabbitMQConnection from "./config/rabbitmq.js";
import { startConsumer } from "./consumers/memoryConsumer.js";

dotenv.config();

const app = express();
const PORT = process.env.MEMORY_SERVICE_PORT || 5003;

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    frameguard: { action: 'deny' },
    noSniff: true,
    xssFilter: true,
    hidePoweredBy: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}));

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'memory-management' });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error("Unhandled error:", error);
    res.status(500).json({
        success: false,
        message: "Internal server error",
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found - Memory service now uses RabbitMQ for communication"
    });
});

async function initialize() {
    try {
        console.log('Initializing Memory Management Service...');
        await rabbitMQConnection.connect();
        await startConsumer();
        console.log('Memory Management Service initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Memory Management Service:', error);
        process.exit(1);
    }
}

app.listen(PORT, () => {
    console.log(`Memory Management Service HTTP server running on port ${PORT} (health checks only)`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('Memory Management Service using RabbitMQ for message processing');
    initialize();
});

process.on('SIGINT', async () => {
    console.log('Shutting down Memory Management Service...');
    await rabbitMQConnection.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Shutting down Memory Management Service...');
    await rabbitMQConnection.close();
    process.exit(0);
});

export default app;
