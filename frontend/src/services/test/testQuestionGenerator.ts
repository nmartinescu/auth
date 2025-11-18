import type { 
    TestQuestion, 
    TestConfig
} from '../../types/Test.ts';
import { apiClient } from '../apiClient.ts';

class TestQuestionGenerator {
    private static instance: TestQuestionGenerator;
    
    static getInstance(): TestQuestionGenerator {
        if (!TestQuestionGenerator.instance) {
            TestQuestionGenerator.instance = new TestQuestionGenerator();
        }
        return TestQuestionGenerator.instance;
    }

    async generateQuestions(config: TestConfig): Promise<{ sessionId: string; questions: TestQuestion[] }> {
        try {
            const response = await apiClient.post('/api/test-generation/generate', config);
            
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to generate test');
            }
            
            return {
                sessionId: response.data.data.sessionId,
                questions: response.data.data.questions
            };
        } catch (error: any) {
            console.error('Error generating test questions:', error);
            throw new Error(error.response?.data?.message || 'Failed to generate test questions');
        }
    }

    async getCorrectAnswers(sessionId: string): Promise<any[]> {
        try {
            const response = await apiClient.get(`/api/test-generation/verify/${sessionId}`);
            
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to retrieve answers');
            }
            
            return response.data.data.answers;
        } catch (error: any) {
            console.error('Error retrieving correct answers:', error);
            throw new Error(error.response?.data?.message || 'Failed to retrieve correct answers');
        }
    }

    async cleanupSession(sessionId: string): Promise<void> {
        try {
            await apiClient.delete(`/api/test-generation/session/${sessionId}`);
        } catch (error) {
            console.error('Error cleaning up test session:', error);
            // Non-critical error, don't throw
        }
    }
}

export const testQuestionGenerator = TestQuestionGenerator.getInstance();
