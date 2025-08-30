import { describe, it, beforeEach, expect } from '@jest/globals';
import { simulateDiskScheduling } from '../../services/diskSchedulingService.js';

describe('Disk Scheduling Integration Tests', () => {
    describe('Real-world Scenarios', () => {
        it('should handle typical web server disk access pattern', () => {
            // Simulating web server accessing log files, database files, and cache
            const requests = [45, 132, 67, 89, 156, 23, 178, 91, 44, 123];
            const result = simulateDiskScheduling('sstf', requests, 75, 200, 'right');
            
            expect(result.totalSeekTime).toBeGreaterThan(0);
            expect(result.averageSeekTime).toBe(result.totalSeekTime / requests.length);
            expect(result.sequence).toHaveLength(requests.length + 1);
            expect(result.steps).toHaveLength(requests.length + 1);
        });

        it('should handle database transaction log pattern', () => {
            // Sequential writes to transaction log with occasional random reads
            const requests = [100, 101, 102, 103, 45, 104, 105, 106, 78, 107];
            const fcfsResult = simulateDiskScheduling('fcfs', requests, 99, 200, 'right');
            const sstfResult = simulateDiskScheduling('sstf', requests, 99, 200, 'right');
            
            // FCFS should be efficient for sequential access
            expect(fcfsResult.totalSeekTime).toBeDefined();
            expect(sstfResult.totalSeekTime).toBeDefined();
            
            // Both should complete successfully
            expect(fcfsResult.sequence).toHaveLength(requests.length + 1);
            expect(sstfResult.sequence).toHaveLength(requests.length + 1);
        });

        it('should handle video streaming scenario', () => {
            // Large sequential reads with some random access
            const requests = [50, 51, 52, 53, 54, 55, 120, 56, 57, 58, 59, 60];
            const scanResult = simulateDiskScheduling('scan', requests, 49, 200, 'right');
            
            expect(scanResult.algorithm).toBe('scan');
            expect(scanResult.sequence[0]).toBe(49);
            expect(scanResult.totalSeekTime).toBeGreaterThan(0);
        });

        it('should handle file system defragmentation pattern', () => {
            // Scattered file blocks being reorganized
            const requests = [10, 150, 25, 175, 40, 160, 55, 145, 70, 130];
            const clookResult = simulateDiskScheduling('clook', requests, 80, 200, 'right');
            
            expect(clookResult.algorithm).toBe('clook');
            expect(clookResult.sequence).not.toContain(0); // Should not go to disk boundaries
            expect(clookResult.sequence).not.toContain(199);
        });
    });

    describe('Performance Comparison', () => {
        let heavyWorkload;

        beforeEach(() => {
            // Create a heavy workload with mixed access patterns
            heavyWorkload = [
                // Sequential block
                50, 51, 52, 53, 54,
                // Random access
                120, 30, 180, 15, 165,
                // Another sequential block
                70, 71, 72, 73, 74,
                // More random access
                140, 25, 190, 10, 175
            ];
        });

        it('should compare all algorithms on same workload', () => {
            const algorithms = ['fcfs', 'sstf', 'scan', 'cscan', 'look', 'clook'];
            const results = {};

            algorithms.forEach(algorithm => {
                results[algorithm] = simulateDiskScheduling(
                    algorithm, 
                    heavyWorkload, 
                    100, 
                    200, 
                    'right'
                );
            });

            // All algorithms should complete successfully
            algorithms.forEach(algorithm => {
                expect(results[algorithm].sequence).toHaveLength(heavyWorkload.length + 1);
                expect(results[algorithm].totalSeekTime).toBeGreaterThan(0);
                expect(results[algorithm].steps).toHaveLength(heavyWorkload.length + 1);
            });

            // SSTF should generally perform better than FCFS
            expect(results.sstf.totalSeekTime).toBeLessThanOrEqual(results.fcfs.totalSeekTime);

            // SCAN algorithms should be consistent
            expect(results.scan.totalSeekTime).toBeGreaterThan(0);
            expect(results.cscan.totalSeekTime).toBeGreaterThan(0);
            expect(results.look.totalSeekTime).toBeGreaterThan(0);
            expect(results.clook.totalSeekTime).toBeGreaterThan(0);
        });

        it('should show different performance characteristics', () => {
            const workload = [10, 190, 20, 180, 30, 170, 40, 160];
            
            const fcfsResult = simulateDiskScheduling('fcfs', workload, 100, 200, 'right');
            const sstfResult = simulateDiskScheduling('sstf', workload, 100, 200, 'right');
            const scanResult = simulateDiskScheduling('scan', workload, 100, 200, 'right');

            // FCFS follows request order exactly
            expect(fcfsResult.sequence[1]).toBe(workload[0]);
            expect(fcfsResult.sequence[2]).toBe(workload[1]);

            // SSTF should optimize for shortest seek time
            expect(sstfResult.totalSeekTime).toBeLessThanOrEqual(fcfsResult.totalSeekTime);

            // SCAN should visit requests in a sweep pattern
            expect(scanResult.sequence).toContain(199); // Should reach disk end
        });
    });

    describe('Stress Testing', () => {
        it('should handle maximum disk size efficiently', () => {
            const maxDisk = 10000;
            const requests = [1000, 5000, 9000, 2000, 8000, 3000, 7000, 4000, 6000];
            
            const result = simulateDiskScheduling('sstf', requests, 5000, maxDisk, 'right');
            
            expect(result.maxDiskSize).toBe(maxDisk);
            expect(result.sequence).toHaveLength(requests.length + 1);
            expect(result.totalSeekTime).toBeGreaterThan(0);
        });

        it('should handle many small requests', () => {
            const manyRequests = Array.from({ length: 50 }, (_, i) => i * 2);
            
            const result = simulateDiskScheduling('scan', manyRequests, 50, 200, 'right');
            
            expect(result.sequence).toHaveLength(manyRequests.length + 1);
            expect(result.steps).toHaveLength(manyRequests.length + 1);
            expect(result.totalSeekTime).toBeGreaterThan(0);
        });

        it('should handle worst-case FCFS scenario', () => {
            // Alternating between disk extremes
            const worstCase = [0, 199, 1, 198, 2, 197, 3, 196];
            
            const result = simulateDiskScheduling('fcfs', worstCase, 100, 200, 'right');
            
            expect(result.totalSeekTime).toBeGreaterThan(1000); // Should be very high
            expect(result.sequence).toHaveLength(worstCase.length + 1);
        });

        it('should handle best-case sequential scenario', () => {
            // Sequential requests
            const bestCase = [101, 102, 103, 104, 105, 106, 107, 108];
            
            const result = simulateDiskScheduling('fcfs', bestCase, 100, 200, 'right');
            
            expect(result.totalSeekTime).toBe(8); // Should be minimal
            expect(result.averageSeekTime).toBe(1);
        });
    });

    describe('Edge Case Integration', () => {
        it('should handle mixed valid and invalid requests in real scenario', () => {
            // Simulating a scenario where some requests are out of bounds
            const mixedRequests = [50, -10, 100, 250, 75, 300, 125, -5, 150];
            
            const result = simulateDiskScheduling('sstf', mixedRequests, 80, 200, 'right');
            
            expect(result.requests).toEqual([50, 100, 75, 125, 150]);
            expect(result.requestCount).toBe(5);
            expect(result.sequence).toHaveLength(6); // Initial + 5 valid requests
        });

        it('should handle disk fragmentation scenario', () => {
            // Simulating fragmented file system
            const fragmentedAccess = [10, 50, 15, 55, 20, 60, 25, 65, 30, 70];
            
            const lookResult = simulateDiskScheduling('look', fragmentedAccess, 40, 100, 'right');
            const clookResult = simulateDiskScheduling('clook', fragmentedAccess, 40, 100, 'right');
            
            // Both should handle fragmentation efficiently
            expect(lookResult.totalSeekTime).toBeGreaterThan(0);
            expect(clookResult.totalSeekTime).toBeGreaterThan(0);
            
            // C-LOOK might be more efficient for this pattern
            expect(clookResult.sequence).not.toContain(0);
            expect(clookResult.sequence).not.toContain(99);
        });

        it('should handle real-time system requirements', () => {
            // Simulating real-time system with time-critical requests
            const criticalRequests = [45, 55, 35, 65, 25, 75, 15, 85];
            
            const scanResult = simulateDiskScheduling('scan', criticalRequests, 50, 100, 'right');
            
            // SCAN should provide predictable service times
            expect(scanResult.steps.every(step => step.explanation.length > 0)).toBe(true);
            expect(scanResult.sequence).toHaveLength(criticalRequests.length + 1);
        });
    });

    describe('Data Consistency', () => {
        it('should maintain data integrity across all algorithms', () => {
            const testRequests = [30, 80, 20, 90, 40, 70, 10, 100];
            const algorithms = ['fcfs', 'sstf', 'scan', 'cscan', 'look', 'clook'];
            
            algorithms.forEach(algorithm => {
                const result = simulateDiskScheduling(algorithm, testRequests, 50, 150, 'right');
                
                // Verify all requests are serviced
                testRequests.forEach(request => {
                    expect(result.sequence).toContain(request);
                });
                
                // Verify initial position is preserved
                expect(result.sequence[0]).toBe(50);
                expect(result.initialHeadPosition).toBe(50);
                
                // Verify step consistency
                expect(result.steps[0].currentPosition).toBe(50);
                expect(result.steps[0].totalSeekTime).toBe(0);
                
                // Verify final seek time matches
                const lastStep = result.steps[result.steps.length - 1];
                expect(lastStep.totalSeekTime).toBe(result.totalSeekTime);
            });
        });

        it('should maintain step-by-step consistency', () => {
            const requests = [60, 40, 80, 20];
            const result = simulateDiskScheduling('fcfs', requests, 50, 100, 'right');
            
            // Verify step progression
            for (let i = 1; i < result.steps.length; i++) {
                const prevStep = result.steps[i - 1];
                const currentStep = result.steps[i];
                
                // Current step's seek distance should match position difference
                const expectedSeekDistance = Math.abs(currentStep.currentPosition - prevStep.currentPosition);
                expect(currentStep.seekDistance).toBe(expectedSeekDistance);
                
                // Total seek time should be cumulative
                expect(currentStep.totalSeekTime).toBe(prevStep.totalSeekTime + currentStep.seekDistance);
                
                // Remaining requests should decrease
                expect(currentStep.remainingRequests.length).toBeLessThanOrEqual(prevStep.remainingRequests.length);
            }
        });
    });

    describe('Algorithm-Specific Integration', () => {
        it('should verify SCAN elevator behavior', () => {
            const requests = [40, 60, 80, 20, 100, 30];
            const rightResult = simulateDiskScheduling('scan', requests, 50, 150, 'right');
            const leftResult = simulateDiskScheduling('scan', requests, 50, 150, 'left');
            
            // Right scan should service 60, 80, 100 first
            const rightSequence = rightResult.sequence;
            expect(rightSequence.indexOf(60)).toBeLessThan(rightSequence.indexOf(40));
            expect(rightSequence.indexOf(80)).toBeLessThan(rightSequence.indexOf(30));
            
            // Left scan should service 40, 30, 20 first
            const leftSequence = leftResult.sequence;
            expect(leftSequence.indexOf(40)).toBeLessThan(leftSequence.indexOf(60));
            expect(leftSequence.indexOf(30)).toBeLessThan(leftSequence.indexOf(80));
        });

        it('should verify C-SCAN circular behavior', () => {
            const requests = [40, 60, 80, 20, 100, 30];
            const result = simulateDiskScheduling('cscan', requests, 50, 150, 'right');
            
            // Should contain both disk boundaries
            expect(result.sequence).toContain(149); // End of disk
            expect(result.sequence).toContain(0);   // Beginning of disk
            
            // Should service right requests first, then jump and service left requests
            const sequence = result.sequence;
            const endIndex = sequence.indexOf(149);
            const startIndex = sequence.indexOf(0);
            expect(startIndex).toBeGreaterThan(endIndex);
        });

        it('should verify LOOK optimization', () => {
            const requests = [60, 80, 40, 30]; // No requests at disk boundaries
            const result = simulateDiskScheduling('look', requests, 50, 150, 'right');
            
            // Should NOT visit disk boundaries
            expect(result.sequence).not.toContain(0);
            expect(result.sequence).not.toContain(149);
            
            // Should only go as far as the furthest request
            const maxRequest = Math.max(...requests);
            const minRequest = Math.min(...requests);
            const maxPosition = Math.max(...result.sequence);
            const minPosition = Math.min(...result.sequence);
            
            expect(maxPosition).toBeLessThanOrEqual(Math.max(maxRequest, 50));
            expect(minPosition).toBeGreaterThanOrEqual(Math.min(minRequest, 50));
        });
    });
});