import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import rabbitMQConnection from "./config/rabbitmq.js";
import { startConsumer } from "./consumers/cpuConsumer.js";

dotenv.config();

const app = express();
const PORT = process.env.CPU_SERVICE_PORT || 5001;

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
    res.json({ status: 'ok', service: 'cpu-scheduling' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: "Internal server error"
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found - CPU service now uses RabbitMQ for communication"
    });
});

// Initialize RabbitMQ connection and start consumer
async function initialize() {
    try {
        console.log('Initializing CPU Scheduling Service...');
        
        // Connect to RabbitMQ
        await rabbitMQConnection.connect();
        
        // Start consuming messages
        await startConsumer();
        
        console.log('CPU Scheduling Service initialized successfully');
    } catch (error) {
        console.error('Failed to initialize CPU Scheduling Service:', error);
        process.exit(1);
    }
}

// Start the HTTP server for health checks
app.listen(PORT, () => {
    console.log(`CPU Scheduling Service HTTP server running on port ${PORT} (health checks only)`);
    console.log('CPU Scheduling Service using RabbitMQ for message processing');
    
    // Initialize RabbitMQ after HTTP server starts
    initialize();
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down CPU Scheduling Service...');
    await rabbitMQConnection.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Shutting down CPU Scheduling Service...');
    await rabbitMQConnection.close();
    process.exit(0);
});

export default app;

