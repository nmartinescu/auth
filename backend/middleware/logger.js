import morgan from 'morgan';
import fs from 'fs';
import path from 'path';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Create write streams for different log files
const accessLogStream = fs.createWriteStream(
    path.join(logsDir, 'access.log'), 
    { flags: 'a' }
);

const errorLogStream = fs.createWriteStream(
    path.join(logsDir, 'error.log'), 
    { flags: 'a' }
);

// Custom token for response time in milliseconds
morgan.token('response-time-ms', (req, res) => {
    const responseTime = res.getHeader('X-Response-Time');
    return responseTime ? `${responseTime}ms` : '-';
});

// Custom token for request ID (useful for tracing)
morgan.token('request-id', (req) => {
    return req.id || 'no-id';
});

// Custom token for user ID (if authenticated)
morgan.token('user-id', (req) => {
    return req.user?.id || 'anonymous';
});

// Custom token for request body size
morgan.token('req-size', (req) => {
    return req.get('content-length') || '0';
});

// Custom token for IP address (handles proxies)
morgan.token('real-ip', (req) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
});

// Development format - colorful and detailed
const devFormat = morgan('dev');

// Production format - structured and comprehensive
const prodFormat = morgan(
    ':real-ip - :user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms',
    {
        stream: accessLogStream
    }
);

// Error logging format - only log 4xx and 5xx responses
const errorFormat = morgan(
    ':real-ip - :user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms - ERROR',
    {
        skip: (req, res) => res.statusCode < 400,
        stream: errorLogStream
    }
);

// Security logging format - log sensitive endpoints
const securityFormat = morgan(
    ':real-ip - :user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":user-agent" :response-time ms - SECURITY',
    {
        skip: (req, res) => {
            // Only log auth endpoints and admin actions
            const sensitiveEndpoints = ['/api/auth/', '/api/admin/', '/api/user/delete'];
            return !sensitiveEndpoints.some(endpoint => req.url.includes(endpoint));
        },
        stream: fs.createWriteStream(path.join(logsDir, 'security.log'), { flags: 'a' })
    }
);

// Rate limit logging format - log when rate limits are hit
const rateLimitFormat = morgan(
    ':real-ip - [:date[clf]] ":method :url" RATE_LIMITED - ":user-agent"',
    {
        skip: (req, res) => res.statusCode !== 429,
        stream: fs.createWriteStream(path.join(logsDir, 'rate-limit.log'), { flags: 'a' })
    }
);

// Request timing middleware
export const requestTimer = (req, res, next) => {
    const start = Date.now();
    
    // Store start time on request object
    req.startTime = start;
    
    // Override res.end to capture timing before response is sent
    const originalEnd = res.end;
    res.end = function(...args) {
        const duration = Date.now() - start;
        
        // Store duration on response object for morgan to access
        res.responseTime = duration;
        
        // Try to set header only if headers haven't been sent
        if (!res.headersSent) {
            res.setHeader('X-Response-Time', duration);
        }
        
        // Call original end method
        originalEnd.apply(this, args);
    };
    
    next();
};

// Request ID middleware for tracing
export const requestId = (req, res, next) => {
    req.id = Math.random().toString(36).substr(2, 9);
    res.setHeader('X-Request-ID', req.id);
    next();
};

// Export different logging configurations
export const loggers = {
    // Development - console output with colors
    development: [devFormat],
    
    // Production - file logging with multiple streams
    production: [prodFormat, errorFormat, securityFormat, rateLimitFormat],
    
    // Combined - both console and file (useful for staging)
    combined: [devFormat, prodFormat, errorFormat, securityFormat, rateLimitFormat]
};

// Log rotation helper (optional - for production)
export const rotateLog = (logPath) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const rotatedPath = `${logPath}.${timestamp}`;
    
    if (fs.existsSync(logPath)) {
        fs.renameSync(logPath, rotatedPath);
    }
};

// Cleanup old logs (keep last 30 days)
export const cleanupOldLogs = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    fs.readdir(logsDir, (err, files) => {
        if (err) return;
        
        files.forEach(file => {
            const filePath = path.join(logsDir, file);
            fs.stat(filePath, (err, stats) => {
                if (err) return;
                
                if (stats.mtime < thirtyDaysAgo) {
                    fs.unlink(filePath, (err) => {
                        if (!err) console.log(`Cleaned up old log: ${file}`);
                    });
                }
            });
        });
    });
};