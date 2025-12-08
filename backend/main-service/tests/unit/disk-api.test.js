import { describe, it, beforeEach, expect } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import diskRoutes from '../../routes/disk.js';

// Create test app
const createTestApp = () => {
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use('/api', diskRoutes);
    return app;
};

describe('Disk Scheduling API', () => {
    let app;

    beforeEach(() => {
        app = createTestApp();
    });

    describe('POST /api/disk', () => {
        it('should successfully process FCFS algorithm', async () => {
            const requestData = {
                maxDiskSize: 200,
                initialHeadPosition: 50,
                headDirection: 'right',
                algorithm: 'fcfs',
                requests: [98, 183, 37, 122, 14, 124, 65, 67]
            };

            const response = await request(app)
                .post('/api/disk')
                .send(requestData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('sequence');
            expect(response.body.data).toHaveProperty('totalSeekTime');
            expect(response.body.data).toHaveProperty('averageSeekTime');
            expect(response.body.data).toHaveProperty('steps');
            expect(response.body.data.algorithm).toBe('fcfs');
            expect(response.body.data.initialHeadPosition).toBe(50);
        });

        it('should successfully process SSTF algorithm', async () => {
            const requestData = {
                maxDiskSize: 200,
                initialHeadPosition: 50,
                headDirection: 'right',
                algorithm: 'sstf',
                requests: [98, 183, 37, 122]
            };

            const response = await request(app)
                .post('/api/disk')
                .send(requestData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.algorithm).toBe('sstf');
            expect(response.body.data.steps).toBeDefined();
            expect(Array.isArray(response.body.data.steps)).toBe(true);
        });

        it('should successfully process SCAN algorithm', async () => {
            const requestData = {
                maxDiskSize: 200,
                initialHeadPosition: 50,
                headDirection: 'left',
                algorithm: 'scan',
                requests: [98, 183, 37, 122]
            };

            const response = await request(app)
                .post('/api/disk')
                .send(requestData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.algorithm).toBe('scan');
            expect(response.body.data.headDirection).toBe('left');
        });

        it('should successfully process C-SCAN algorithm', async () => {
            const requestData = {
                maxDiskSize: 200,
                initialHeadPosition: 50,
                headDirection: 'right',
                algorithm: 'cscan',
                requests: [98, 183, 37, 122]
            };

            const response = await request(app)
                .post('/api/disk')
                .send(requestData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.algorithm).toBe('cscan');
        });

        it('should successfully process LOOK algorithm', async () => {
            const requestData = {
                maxDiskSize: 200,
                initialHeadPosition: 50,
                headDirection: 'right',
                algorithm: 'look',
                requests: [98, 183, 37, 122]
            };

            const response = await request(app)
                .post('/api/disk')
                .send(requestData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.algorithm).toBe('look');
        });

        it('should successfully process C-LOOK algorithm', async () => {
            const requestData = {
                maxDiskSize: 200,
                initialHeadPosition: 50,
                headDirection: 'right',
                algorithm: 'clook',
                requests: [98, 183, 37, 122]
            };

            const response = await request(app)
                .post('/api/disk')
                .send(requestData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.algorithm).toBe('clook');
        });

        it('should handle missing required fields', async () => {
            const requestData = {
                maxDiskSize: 200,
                // Missing other required fields
            };

            const response = await request(app)
                .post('/api/disk')
                .send(requestData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('required');
        });

        it('should handle invalid algorithm', async () => {
            const requestData = {
                maxDiskSize: 200,
                initialHeadPosition: 50,
                headDirection: 'right',
                algorithm: 'invalid_algorithm',
                requests: [98, 183, 37, 122]
            };

            const response = await request(app)
                .post('/api/disk')
                .send(requestData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Unknown algorithm');
        });

        it('should handle empty requests array', async () => {
            const requestData = {
                maxDiskSize: 200,
                initialHeadPosition: 50,
                headDirection: 'right',
                algorithm: 'fcfs',
                requests: []
            };

            const response = await request(app)
                .post('/api/disk')
                .send(requestData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('non-empty array');
        });

        it('should handle invalid head position', async () => {
            const requestData = {
                maxDiskSize: 200,
                initialHeadPosition: 250, // Outside disk bounds
                headDirection: 'right',
                algorithm: 'fcfs',
                requests: [98, 183, 37, 122]
            };

            const response = await request(app)
                .post('/api/disk')
                .send(requestData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('within disk bounds');
        });

        it('should handle negative head position', async () => {
            const requestData = {
                maxDiskSize: 200,
                initialHeadPosition: -10,
                headDirection: 'right',
                algorithm: 'fcfs',
                requests: [98, 183, 37, 122]
            };

            const response = await request(app)
                .post('/api/disk')
                .send(requestData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('within disk bounds');
        });

        it('should filter out invalid requests and process valid ones', async () => {
            const requestData = {
                maxDiskSize: 200,
                initialHeadPosition: 50,
                headDirection: 'right',
                algorithm: 'fcfs',
                requests: [98, -5, 183, 250, 37, 122] // Mix of valid and invalid
            };

            const response = await request(app)
                .post('/api/disk')
                .send(requestData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.requests).toEqual([98, 183, 37, 122]);
            expect(response.body.data.requestCount).toBe(4);
        });

        it('should handle all invalid requests', async () => {
            const requestData = {
                maxDiskSize: 200,
                initialHeadPosition: 50,
                headDirection: 'right',
                algorithm: 'fcfs',
                requests: [-5, 250, 300, -10] // All invalid
            };

            const response = await request(app)
                .post('/api/disk')
                .send(requestData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('No valid requests');
        });

        it('should handle different head directions', async () => {
            const baseRequest = {
                maxDiskSize: 200,
                initialHeadPosition: 50,
                algorithm: 'scan',
                requests: [98, 183, 37, 122]
            };

            // Test right direction
            const rightResponse = await request(app)
                .post('/api/disk')
                .send({ ...baseRequest, headDirection: 'right' })
                .expect(200);

            // Test left direction
            const leftResponse = await request(app)
                .post('/api/disk')
                .send({ ...baseRequest, headDirection: 'left' })
                .expect(200);

            expect(rightResponse.body.data.headDirection).toBe('right');
            expect(leftResponse.body.data.headDirection).toBe('left');
            
            // Results should be different for different directions
            expect(rightResponse.body.data.sequence).not.toEqual(leftResponse.body.data.sequence);
        });

        it('should handle large disk sizes', async () => {
            const requestData = {
                maxDiskSize: 10000,
                initialHeadPosition: 5000,
                headDirection: 'right',
                algorithm: 'fcfs',
                requests: [1000, 8000, 3000, 7000]
            };

            const response = await request(app)
                .post('/api/disk')
                .send(requestData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.maxDiskSize).toBe(10000);
            expect(response.body.data.initialHeadPosition).toBe(5000);
        });

        it('should handle single request', async () => {
            const requestData = {
                maxDiskSize: 200,
                initialHeadPosition: 50,
                headDirection: 'right',
                algorithm: 'fcfs',
                requests: [100]
            };

            const response = await request(app)
                .post('/api/disk')
                .send(requestData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.sequence).toEqual([50, 100]);
            expect(response.body.data.totalSeekTime).toBe(50);
            expect(response.body.data.steps).toHaveLength(2);
        });

        it('should provide detailed step information', async () => {
            const requestData = {
                maxDiskSize: 200,
                initialHeadPosition: 50,
                headDirection: 'right',
                algorithm: 'fcfs',
                requests: [100, 150]
            };

            const response = await request(app)
                .post('/api/disk')
                .send(requestData)
                .expect(200);

            expect(response.body.data.steps).toHaveLength(3); // Initial + 2 requests
            
            response.body.data.steps.forEach((step, index) => {
                expect(step).toHaveProperty('step', index);
                expect(step).toHaveProperty('currentPosition');
                expect(step).toHaveProperty('seekDistance');
                expect(step).toHaveProperty('totalSeekTime');
                expect(step).toHaveProperty('explanation');
                expect(step).toHaveProperty('remainingRequests');
                
                if (index > 0) {
                    expect(step).toHaveProperty('targetRequest');
                }
            });
        });

        it('should handle duplicate requests', async () => {
            const requestData = {
                maxDiskSize: 200,
                initialHeadPosition: 50,
                headDirection: 'right',
                algorithm: 'fcfs',
                requests: [100, 100, 150, 150]
            };

            const response = await request(app)
                .post('/api/disk')
                .send(requestData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.sequence.filter(pos => pos === 100)).toHaveLength(2);
            expect(response.body.data.sequence.filter(pos => pos === 150)).toHaveLength(2);
        });

        it('should handle request at current head position', async () => {
            const requestData = {
                maxDiskSize: 200,
                initialHeadPosition: 50,
                headDirection: 'right',
                algorithm: 'fcfs',
                requests: [50, 100] // First request is at current position
            };

            const response = await request(app)
                .post('/api/disk')
                .send(requestData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.sequence[1]).toBe(50);
            expect(response.body.data.steps[1].seekDistance).toBe(0);
        });

        it('should return consistent results for same input', async () => {
            const requestData = {
                maxDiskSize: 200,
                initialHeadPosition: 50,
                headDirection: 'right',
                algorithm: 'fcfs',
                requests: [98, 183, 37, 122]
            };

            const response1 = await request(app)
                .post('/api/disk')
                .send(requestData)
                .expect(200);

            const response2 = await request(app)
                .post('/api/disk')
                .send(requestData)
                .expect(200);

            expect(response1.body.data.sequence).toEqual(response2.body.data.sequence);
            expect(response1.body.data.totalSeekTime).toBe(response2.body.data.totalSeekTime);
        });

        it('should handle malformed JSON', async () => {
            const response = await request(app)
                .post('/api/disk')
                .send('invalid json')
                .set('Content-Type', 'application/json')
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should validate numeric fields', async () => {
            const requestData = {
                maxDiskSize: 'not_a_number',
                initialHeadPosition: 50,
                headDirection: 'right',
                algorithm: 'fcfs',
                requests: [98, 183, 37, 122]
            };

            const response = await request(app)
                .post('/api/disk')
                .send(requestData)
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should handle boundary values', async () => {
            const requestData = {
                maxDiskSize: 1, // Minimum disk size
                initialHeadPosition: 0,
                headDirection: 'right',
                algorithm: 'fcfs',
                requests: [0] // Only valid request for disk size 1
            };

            const response = await request(app)
                .post('/api/disk')
                .send(requestData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.maxDiskSize).toBe(1);
            expect(response.body.data.totalSeekTime).toBe(0);
        });
    });

    describe('Error Handling', () => {
        it('should handle server errors gracefully', async () => {
            // This test would require mocking the service to throw an error
            // For now, we'll test with invalid data that causes an error
            const requestData = {
                maxDiskSize: null,
                initialHeadPosition: null,
                headDirection: null,
                algorithm: null,
                requests: null
            };

            const response = await request(app)
                .post('/api/disk')
                .send(requestData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBeDefined();
        });

        it('should handle missing Content-Type header', async () => {
            const response = await request(app)
                .post('/api/disk')
                .send('{"test": "data"}')
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('Performance Tests', () => {
        it('should handle large number of requests efficiently', async () => {
            const largeRequests = Array.from({ length: 1000 }, (_, i) => i);
            const requestData = {
                maxDiskSize: 1000,
                initialHeadPosition: 500,
                headDirection: 'right',
                algorithm: 'fcfs',
                requests: largeRequests
            };

            const startTime = Date.now();
            const response = await request(app)
                .post('/api/disk')
                .send(requestData)
                .expect(200);
            const endTime = Date.now();

            expect(response.body.success).toBe(true);
            expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
        });

        it('should handle complex SSTF calculation efficiently', async () => {
            const randomRequests = Array.from({ length: 100 }, () => Math.floor(Math.random() * 1000));
            const requestData = {
                maxDiskSize: 1000,
                initialHeadPosition: 500,
                headDirection: 'right',
                algorithm: 'sstf',
                requests: randomRequests
            };

            const startTime = Date.now();
            const response = await request(app)
                .post('/api/disk')
                .send(requestData)
                .expect(200);
            const endTime = Date.now();

            expect(response.body.success).toBe(true);
            expect(endTime - startTime).toBeLessThan(3000); // Should complete within 3 seconds
        });
    });
});