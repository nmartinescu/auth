import type { TestSession } from '../../types/Test.ts';
import { getAuthToken } from '../../utils/auth.ts';
import { API_ENDPOINTS } from '../../config/constants.ts';

class TestResultsService {
    private static instance: TestResultsService;
    
    static getInstance(): TestResultsService {
        if (!TestResultsService.instance) {
            TestResultsService.instance = new TestResultsService();
        }
        return TestResultsService.instance;
    }

    async saveTestResult(session: TestSession, summary: any): Promise<boolean> {
        try {
            const token = getAuthToken();
            if (!token) {
                console.log('No auth token found, skipping test result save');
                return false;
            }

            const duration = session.endTime && session.startTime
                ? (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60)
                : 0;

            const response = await fetch(API_ENDPOINTS.TEST_RESULTS.SAVE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    sessionId: session.id,
                    config: session.config,
                    questions: session.questions,
                    userAnswers: session.userAnswers,
                    score: session.score || 0,
                    startTime: session.startTime,
                    endTime: session.endTime,
                    duration: Math.round(duration * 100) / 100,
                    summary
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Failed to save test result:', errorData);
                return false;
            }

            const result = await response.json();
            console.log('Test result saved successfully:', result);
            return true;
        } catch (error) {
            console.error('Error saving test result:', error);
            return false;
        }
    }

    async getTestResults(options?: {
        limit?: number;
        skip?: number;
        sortBy?: string;
        order?: 'asc' | 'desc';
    }): Promise<any[]> {
        try {
            const token = getAuthToken();
            if (!token) {
                console.log('No auth token found');
                return [];
            }

            const params = new URLSearchParams();
            if (options?.limit) params.append('limit', options.limit.toString());
            if (options?.skip) params.append('skip', options.skip.toString());
            if (options?.sortBy) params.append('sortBy', options.sortBy);
            if (options?.order) params.append('order', options.order);

            const response = await fetch(`${API_ENDPOINTS.TEST_RESULTS.GET_ALL}?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch test results');
            }

            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error('Error fetching test results:', error);
            return [];
        }
    }

    async getTestResult(id: string): Promise<any | null> {
        try {
            const token = getAuthToken();
            if (!token) {
                console.log('No auth token found');
                return null;
            }

            const response = await fetch(`${API_ENDPOINTS.TEST_RESULTS.GET_BY_ID}/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch test result');
            }

            const result = await response.json();
            return result.data || null;
        } catch (error) {
            console.error('Error fetching test result:', error);
            return null;
        }
    }

    async deleteTestResult(id: string): Promise<boolean> {
        try {
            const token = getAuthToken();
            if (!token) {
                console.log('No auth token found');
                return false;
            }

            const response = await fetch(`${API_ENDPOINTS.TEST_RESULTS.GET_BY_ID}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete test result');
            }

            return true;
        } catch (error) {
            console.error('Error deleting test result:', error);
            return false;
        }
    }

    async getTestStatistics(): Promise<any> {
        try {
            const token = getAuthToken();
            if (!token) {
                console.log('No auth token found');
                return null;
            }

            const response = await fetch(`${API_ENDPOINTS.TEST_RESULTS.GET_ALL}/stats/summary`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch test statistics');
            }

            const result = await response.json();
            return result.data || null;
        } catch (error) {
            console.error('Error fetching test statistics:', error);
            return null;
        }
    }
}

export const testResultsService = TestResultsService.getInstance();
