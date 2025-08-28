import type { 
    TestSession, 
    TestConfig, 
    TestQuestion, 
    UserAnswer, 
    TestSolution 
} from '../types/Test';
import { testQuestionGenerator } from './testQuestionGenerator';
import { testSolutionService } from './testSolutionService';

class TestSessionManager {
    private static instance: TestSessionManager;
    private currentSession: TestSession | null = null;
    
    static getInstance(): TestSessionManager {
        if (!TestSessionManager.instance) {
            TestSessionManager.instance = new TestSessionManager();
        }
        return TestSessionManager.instance;
    }

    async startTest(config: TestConfig): Promise<TestSession> {
        // Generate questions
        const questions = testQuestionGenerator.generateQuestions(config);
        
        // Calculate correct solutions for all questions
        for (const question of questions) {
            try {
                question.expectedSolution = await testSolutionService.calculateSolution(question);
            } catch (error) {
                console.error(`Failed to calculate solution for question ${question.id}:`, error);
            }
        }

        // Create test session
        this.currentSession = {
            id: `test-${Date.now()}`,
            config,
            questions,
            currentQuestionIndex: 0,
            userAnswers: [],
            startTime: new Date()
        };

        return this.currentSession;
    }

    getCurrentSession(): TestSession | null {
        return this.currentSession;
    }

    getCurrentQuestion(): TestQuestion | null {
        if (!this.currentSession) return null;
        return this.currentSession.questions[this.currentSession.currentQuestionIndex] || null;
    }

    hasNextQuestion(): boolean {
        if (!this.currentSession) return false;
        return this.currentSession.currentQuestionIndex < this.currentSession.questions.length - 1;
    }

    hasPreviousQuestion(): boolean {
        if (!this.currentSession) return false;
        return this.currentSession.currentQuestionIndex > 0;
    }

    nextQuestion(): TestQuestion | null {
        if (!this.currentSession || !this.hasNextQuestion()) return null;
        this.currentSession.currentQuestionIndex++;
        return this.getCurrentQuestion();
    }

    previousQuestion(): TestQuestion | null {
        if (!this.currentSession || !this.hasPreviousQuestion()) return null;
        this.currentSession.currentQuestionIndex--;
        return this.getCurrentQuestion();
    }

    goToQuestion(index: number): TestQuestion | null {
        if (!this.currentSession || index < 0 || index >= this.currentSession.questions.length) {
            return null;
        }
        this.currentSession.currentQuestionIndex = index;
        return this.getCurrentQuestion();
    }

    submitAnswer(questionId: string, userSolution: TestSolution): UserAnswer | null {
        if (!this.currentSession) return null;

        const question = this.currentSession.questions.find(q => q.id === questionId);
        if (!question || !question.expectedSolution) return null;

        console.log('=== SUBMIT ANSWER DEBUG ===');
        console.log('Question ID:', questionId);
        console.log('Question:', question);
        console.log('Expected Solution:', question.expectedSolution);
        console.log('User Solution:', userSolution);

        // Compare user answer with correct solution
        const comparison = testSolutionService.compareAnswers(
            userSolution, 
            question.expectedSolution
        );

        console.log('Comparison Result:', comparison);

        const userAnswer: UserAnswer = {
            questionId,
            userSolution,
            correctSolution: question.expectedSolution,
            isCorrect: comparison.isCorrect,
            score: comparison.score,
            maxScore: comparison.maxScore
        };

        console.log('Final User Answer:', userAnswer);
        console.log('=== END SUBMIT ANSWER DEBUG ===');

        // Update or add the answer
        const existingAnswerIndex = this.currentSession.userAnswers.findIndex(
            answer => answer.questionId === questionId
        );

        if (existingAnswerIndex >= 0) {
            this.currentSession.userAnswers[existingAnswerIndex] = userAnswer;
        } else {
            this.currentSession.userAnswers.push(userAnswer);
        }

        return userAnswer;
    }

    getUserAnswer(questionId: string): UserAnswer | null {
        if (!this.currentSession) return null;
        return this.currentSession.userAnswers.find(answer => answer.questionId === questionId) || null;
    }

    finishTest(): TestSession | null {
        if (!this.currentSession) return null;

        this.currentSession.endTime = new Date();
        
        // Calculate total score
        const totalScore = this.currentSession.userAnswers.reduce(
            (sum, answer) => sum + answer.score, 0
        );
        const maxPossibleScore = this.currentSession.questions.length * 100;
        this.currentSession.score = maxPossibleScore > 0 ? 
            Math.round((totalScore / maxPossibleScore) * 100) : 0;

        return this.currentSession;
    }

    getTestResults(): {
        session: TestSession;
        summary: {
            totalQuestions: number;
            answeredQuestions: number;
            correctAnswers: number;
            totalScore: number;
            percentage: number;
            duration: number; // in minutes
        };
    } | null {
        if (!this.currentSession) return null;

        const answeredQuestions = this.currentSession.userAnswers.length;
        const correctAnswers = this.currentSession.userAnswers.filter(answer => answer.isCorrect).length;
        const totalScore = this.currentSession.userAnswers.reduce((sum, answer) => sum + answer.score, 0);
        const maxPossibleScore = answeredQuestions * 100;
        const percentage = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
        
        const duration = this.currentSession.endTime 
            ? (this.currentSession.endTime.getTime() - this.currentSession.startTime.getTime()) / (1000 * 60)
            : 0;

        return {
            session: this.currentSession,
            summary: {
                totalQuestions: this.currentSession.questions.length,
                answeredQuestions,
                correctAnswers,
                totalScore,
                percentage,
                duration: Math.round(duration * 100) / 100
            }
        };
    }

    resetSession(): void {
        this.currentSession = null;
    }

    getQuestionProgress(): {
        current: number;
        total: number;
        percentage: number;
    } {
        if (!this.currentSession) {
            return { current: 0, total: 0, percentage: 0 };
        }

        const current = this.currentSession.currentQuestionIndex + 1;
        const total = this.currentSession.questions.length;
        const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

        return { current, total, percentage };
    }
}

export const testSessionManager = TestSessionManager.getInstance();
