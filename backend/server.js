import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import authRoutes from "./routes/auth/index.js";
import logsRoutes from "./routes/logs.js";
import cpuRoutes from "./routes/cpu.js";
import { connectDB } from "./config/db.js";
import { generalLimiter } from "./middleware/rateLimiter.js";
import { loggers, requestTimer, requestId, cleanupOldLogs } from "./middleware/logger.js";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __dirname = path.resolve();

// Request tracking middleware - must be early
app.use(requestId);
app.use(requestTimer);

// Logging middleware - choose based on environment
const currentLoggers = loggers[process.env.NODE_ENV] || loggers.development;
currentLoggers.forEach(logger => app.use(logger));

// Security middleware - must be first
app.use(helmet({
    // Content Security Policy
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
    // HTTP Strict Transport Security
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
    },
    // Prevent clickjacking
    frameguard: { action: 'deny' },
    // Prevent MIME type sniffing
    noSniff: true,
    // Prevent XSS attacks
    xssFilter: true,
    // Hide X-Powered-By header
    hidePoweredBy: true,
    // Referrer Policy
    referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}));

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL || false 
        : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting to all requests
app.use(generalLimiter);

// // Routes
// app.get("/", (req, res) => {
//     res.json({ message: "Server is running!" });
// });

app.get("/api/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Auth routes
app.use("/api/auth", authRoutes);

// CPU scheduling routes
app.use("/api/cpu", cpuRoutes);

// Import simulation routes
import simulationRoutes from "./routes/simulations/index.js";

// Simulation routes
app.use("/api/simulations", simulationRoutes);

// Logs routes (development only)
app.use("/api/logs", logsRoutes);

// Error handling middleware
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

// Start server
app.listen(PORT, () => {
    connectDB();
    
    // Log startup information
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 Logging: ${process.env.NODE_ENV === 'production' ? 'File-based' : 'Console'}`);
    console.log(`🛡️  Security: Headers enabled, Rate limiting active`);
    
    // Schedule log cleanup (run daily at midnight)
    if (process.env.NODE_ENV === 'production') {
        setInterval(cleanupOldLogs, 24 * 60 * 60 * 1000); // 24 hours
        console.log(`🧹 Log cleanup scheduled (30-day retention)`);
    }
});
