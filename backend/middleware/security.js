/**
 * Security Middleware Configuration
 *
 * This file documents the security headers and configurations
 * implemented via Helmet middleware in server.js
 */

export const securityConfig = {
    // Content Security Policy - Prevents XSS attacks
    csp: {
        purpose:
            "Prevents code injection attacks by controlling resource loading",
        protection: ["XSS", "Code Injection", "Data Injection"],
    },

    // HTTP Strict Transport Security - Forces HTTPS
    hsts: {
        purpose:
            "Forces HTTPS connections and prevents protocol downgrade attacks",
        protection: [
            "Man-in-the-middle",
            "Protocol downgrade",
            "Cookie hijacking",
        ],
    },

    // X-Frame-Options - Prevents clickjacking
    frameguard: {
        purpose: "Prevents the site from being embedded in frames/iframes",
        protection: ["Clickjacking", "UI redressing attacks"],
    },

    // X-Content-Type-Options - Prevents MIME sniffing
    noSniff: {
        purpose: "Prevents browsers from MIME-sniffing responses",
        protection: ["MIME confusion attacks", "Content type confusion"],
    },

    // X-XSS-Protection - XSS filtering
    xssFilter: {
        purpose: "Enables browser's built-in XSS protection",
        protection: ["Reflected XSS attacks"],
    },

    // Hide X-Powered-By - Information disclosure
    hidePoweredBy: {
        purpose: "Hides server technology information",
        protection: ["Information disclosure", "Targeted attacks"],
    },

    // Referrer Policy - Controls referrer information
    referrerPolicy: {
        purpose: "Controls how much referrer information is shared",
        protection: ["Information leakage", "Privacy violations"],
    },
};

// Security headers that are now automatically applied:
export const appliedHeaders = [
    "Content-Security-Policy",
    "Strict-Transport-Security",
    "X-Frame-Options",
    "X-Content-Type-Options",
    "X-XSS-Protection",
    "Referrer-Policy",
];

// CORS configuration protects against:
export const corsProtection = [
    "Cross-Origin Request Forgery (CSRF)",
    "Unauthorized cross-origin requests",
    "Data exfiltration attacks",
];
