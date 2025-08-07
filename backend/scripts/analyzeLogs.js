#!/usr/bin/env node

/**
 * Log Analysis CLI Tool
 * 
 * Usage:
 *   node backend/scripts/analyzeLogs.js
 *   npm run analyze-logs (if you add it to package.json scripts)
 */

import logAnalyzer from '../utils/logAnalyzer.js';

console.log('🔍 Starting log analysis...\n');

try {
    logAnalyzer.generateReport();
} catch (error) {
    console.error('❌ Error analyzing logs:', error.message);
    console.log('\n💡 Make sure your server has been running and generating logs.');
    console.log('   Log files should be in the /logs directory.');
}

console.log('✅ Log analysis complete!');
console.log('\n💡 Tips:');
console.log('   - Run this regularly to monitor your application');
console.log('   - Watch for unusual patterns in failed logins or rate limits');
console.log('   - Monitor response times to identify performance issues');
console.log('   - Check error logs for recurring issues that need fixing');