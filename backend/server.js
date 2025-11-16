import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import authRoutes from "./routes/auth/index.js";
import logsRoutes from "./routes/logs.js";
import cpuRoutes from "./routes/cpu.js";
import memoryRoutes from "./routes/memory.js";
import diskRoutes from "./routes/disk.js";
import { connectDB } from "./config/db.js";
import { generalLimiter } from "./middleware/rateLimiter.js";
import { loggers, requestTimer, requestId, cleanupOldLogs } from "./middleware/logger.js";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __dirname = path.resolve();


app.use(requestId);
app.use(requestTimer);


const currentLoggers = loggers[process.env.NODE_ENV] || loggers.development;
currentLoggers.forEach(logger => app.use(logger));


app.use(helmet({

    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            manifestSrc: ["'self'"],
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
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL || false 
        : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting to all requests
app.use(generalLimiter);



app.get("/api/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
});


app.use("/api/auth", authRoutes);


app.use("/api/cpu", cpuRoutes);


app.use("/api/memory", memoryRoutes);


app.use("/api/disk", diskRoutes);


import simulationRoutes from "./routes/simulations/index.js";
import testResultsRoutes from "./routes/testResults.js";


app.use("/api/simulations", simulationRoutes);


app.use("/api/test-results", testResultsRoutes);


app.use("/api/logs", logsRoutes);


app.use((error, req, res, next) => {
    console.error("Unhandled error:", error);
    res.status(500).json({
        success: false,
        message: "Internal server error",
    });
});

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "/frontend/dist")));
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
    });
}


app.listen(PORT, () => {
    connectDB();
    
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    
    if (process.env.NODE_ENV === 'production') {
        setInterval(cleanupOldLogs, 24 * 60 * 60 * 1000);
    }
});
