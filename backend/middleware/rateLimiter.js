import rateLimit from "express-rate-limit";

// General API rate limiter - 100 requests per 15 minutes
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: "Too many requests from this IP, please try again later.",
        retryAfter: "15 minutes",
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict rate limiter for auth endpoints - 5 requests per 15 minutes
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: "Too many authentication attempts, please try again later.",
        retryAfter: "15 minutes",
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip successful requests (only count failed attempts)
    skipSuccessfulRequests: true,
});

// Very strict limiter for password reset - 3 requests per hour
export const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 requests per hour
    message: {
        success: false,
        message: "Too many password reset attempts, please try again later.",
        retryAfter: "1 hour",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Account creation limiter - 3 accounts per hour per IP
export const createAccountLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 account creations per hour
    message: {
        success: false,
        message:
            "Too many accounts created from this IP, please try again later.",
        retryAfter: "1 hour",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
