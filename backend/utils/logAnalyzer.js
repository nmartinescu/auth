import fs from 'fs';
import path from 'path';

const logsDir = path.join(process.cwd(), 'logs');

/**
 * Log Analysis Utilities
 * Use these functions to analyze your application logs
 */

// Parse log entries from a file
export const parseLogFile = (filename) => {
    const filePath = path.join(logsDir, filename);
    
    if (!fs.existsSync(filePath)) {
        console.log(`Log file ${filename} not found`);
        return [];
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split('\n').filter(line => line.trim());
};

// Get request statistics from access logs
export const getRequestStats = () => {
    const logs = parseLogFile('access.log');
    const stats = {
        totalRequests: logs.length,
        methods: {},
        statusCodes: {},
        topEndpoints: {},
        averageResponseTime: 0,
        slowestRequests: []
    };
    
    let totalResponseTime = 0;
    const responseTimes = [];
    
    logs.forEach(log => {
        // Parse log entry (simplified - adjust regex based on your format)
        const methodMatch = log.match(/"(GET|POST|PUT|DELETE|PATCH)/);
        const statusMatch = log.match(/HTTP\/\d\.\d" (\d{3})/);
        const urlMatch = log.match(/"[A-Z]+ ([^"]+)/);
        const timeMatch = log.match(/(\d+) ms/);
        
        if (methodMatch) {
            const method = methodMatch[1];
            stats.methods[method] = (stats.methods[method] || 0) + 1;
        }
        
        if (statusMatch) {
            const status = statusMatch[1];
            stats.statusCodes[status] = (stats.statusCodes[status] || 0) + 1;
        }
        
        if (urlMatch) {
            const url = urlMatch[1].split('?')[0]; // Remove query params
            stats.topEndpoints[url] = (stats.topEndpoints[url] || 0) + 1;
        }
        
        if (timeMatch) {
            const responseTime = parseInt(timeMatch[1]);
            totalResponseTime += responseTime;
            responseTimes.push({ log, responseTime });
        }
    });
    
    stats.averageResponseTime = logs.length > 0 ? Math.round(totalResponseTime / logs.length) : 0;
    stats.slowestRequests = responseTimes
        .sort((a, b) => b.responseTime - a.responseTime)
        .slice(0, 10)
        .map(item => ({ log: item.log, responseTime: `${item.responseTime}ms` }));
    
    return stats;
};

// Get error analysis from error logs
export const getErrorAnalysis = () => {
    const logs = parseLogFile('error.log');
    const analysis = {
        totalErrors: logs.length,
        errorsByStatus: {},
        errorsByEndpoint: {},
        recentErrors: logs.slice(-10)
    };
    
    logs.forEach(log => {
        const statusMatch = log.match(/HTTP\/\d\.\d" (\d{3})/);
        const urlMatch = log.match(/"[A-Z]+ ([^"]+)/);
        
        if (statusMatch) {
            const status = statusMatch[1];
            analysis.errorsByStatus[status] = (analysis.errorsByStatus[status] || 0) + 1;
        }
        
        if (urlMatch) {
            const url = urlMatch[1].split('?')[0];
            analysis.errorsByEndpoint[url] = (analysis.errorsByEndpoint[url] || 0) + 1;
        }
    });
    
    return analysis;
};

// Get security events from security logs
export const getSecurityEvents = () => {
    const logs = parseLogFile('security.log');
    const events = {
        totalSecurityEvents: logs.length,
        authAttempts: 0,
        failedLogins: 0,
        recentEvents: logs.slice(-20)
    };
    
    logs.forEach(log => {
        if (log.includes('/api/auth/login')) {
            events.authAttempts++;
            if (log.includes(' 401 ') || log.includes(' 400 ')) {
                events.failedLogins++;
            }
        }
    });
    
    return events;
};

// Get rate limiting events
export const getRateLimitEvents = () => {
    const logs = parseLogFile('rate-limit.log');
    const events = {
        totalRateLimitHits: logs.length,
        affectedIPs: {},
        recentEvents: logs.slice(-10)
    };
    
    logs.forEach(log => {
        const ipMatch = log.match(/^([^\s]+)/);
        if (ipMatch) {
            const ip = ipMatch[1];
            events.affectedIPs[ip] = (events.affectedIPs[ip] || 0) + 1;
        }
    });
    
    return events;
};

export const generateReport = () => {
    console.log('\n=== APPLICATION LOG ANALYSIS REPORT ===\n');
    
    // Request Statistics
    const requestStats = getRequestStats();
    console.log('REQUEST STATISTICS:');
    console.log(`   Total Requests: ${requestStats.totalRequests}`);
    console.log(`   Average Response Time: ${requestStats.averageResponseTime}ms`);
    console.log('   Methods:', requestStats.methods);
    console.log('   Status Codes:', requestStats.statusCodes);
    console.log('   Top Endpoints:', Object.entries(requestStats.topEndpoints)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .reduce((obj, [k, v]) => ({ ...obj, [k]: v }), {}));
    
    if (requestStats.slowestRequests.length > 0) {
        console.log('\n⏱️  SLOWEST REQUESTS:');
        requestStats.slowestRequests.slice(0, 3).forEach((req, i) => {
            console.log(`   ${i + 1}. ${req.responseTime} - ${req.log.substring(0, 100)}...`);
        });
    }
    
    // Error Analysis
    const errorAnalysis = getErrorAnalysis();
    if (errorAnalysis.totalErrors > 0) {
        console.log('\nERROR ANALYSIS:');
        console.log(`   Total Errors: ${errorAnalysis.totalErrors}`);
        console.log('   Errors by Status:', errorAnalysis.errorsByStatus);
        console.log('   Errors by Endpoint:', errorAnalysis.errorsByEndpoint);
    }
    
    // Security Events
    const securityEvents = getSecurityEvents();
    if (securityEvents.totalSecurityEvents > 0) {
        console.log('\nSECURITY EVENTS:');
        console.log(`   Total Security Events: ${securityEvents.totalSecurityEvents}`);
        console.log(`   Auth Attempts: ${securityEvents.authAttempts}`);
        console.log(`   Failed Logins: ${securityEvents.failedLogins}`);
    }
    
    // Rate Limiting
    const rateLimitEvents = getRateLimitEvents();
    if (rateLimitEvents.totalRateLimitHits > 0) {
        console.log('\nRATE LIMITING:');
        console.log(`   Total Rate Limit Hits: ${rateLimitEvents.totalRateLimitHits}`);
        console.log('   Most Affected IPs:', rateLimitEvents.affectedIPs);
    }
    
    console.log('\n=== END REPORT ===\n');
};

// Export for use in other files or CLI
export default {
    parseLogFile,
    getRequestStats,
    getErrorAnalysis,
    getSecurityEvents,
    getRateLimitEvents,
    generateReport
};