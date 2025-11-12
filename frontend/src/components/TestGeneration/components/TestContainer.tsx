import { useState, useEffect } from "react";
import { Box, Text, Spinner, Flex } from "@chakra-ui/react";
import { useColorModeValue } from "../../ui/color-mode";
import TestPage from "./TestPage";
import TestQuestionComponent from "./TestQuestionComponent";
import TestResults from "./TestResults";
import { testSessionManager } from "../../../services/testSessionManager";
import type { TestSession, TestQuestion, TestSolution, MemoryTestSolution, DiskTestSolution, TestState } from "../types.ts";

const TestContainer = () => {
    const [testState, setTestState] = useState<TestState>('config');
    const [currentSession, setCurrentSession] = useState<TestSession | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState<TestQuestion | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Color mode values
    const spinnerColor = useColorModeValue("blue.500", "blue.300");
    const errorColor = useColorModeValue("red.500", "red.300");

    useEffect(() => {
        // Update current question when session changes
        if (currentSession) {
            const question = testSessionManager.getCurrentQuestion();
            setCurrentQuestion(question);
        }
    }, [currentSession]);

    const handleTestStart = async (_sessionId: string) => {
        setIsLoading(true);
        setError(null);
        
        try {
            const session = testSessionManager.getCurrentSession();
            if (session) {
                setCurrentSession(session);
                setTestState('taking');
            } else {
                setError('Failed to start test session');
            }
        } catch (err) {
            console.error('Error starting test:', err);
            setError('Failed to start test. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitAnswer = (solution: TestSolution | MemoryTestSolution | DiskTestSolution) => {
        if (!currentQuestion) return;
        
        try {
            testSessionManager.submitAnswer(currentQuestion.id, solution);
            // Update session to trigger re-render
            setCurrentSession({ ...testSessionManager.getCurrentSession()! });
        } catch (err) {
            console.error('Error submitting answer:', err);
            setError('Failed to submit answer. Please try again.');
        }
    };

    const handleNextQuestion = () => {
        try {
            const nextQuestion = testSessionManager.nextQuestion();
            setCurrentQuestion(nextQuestion);
            // Update session
            setCurrentSession({ ...testSessionManager.getCurrentSession()! });
        } catch (err) {
            console.error('Error going to next question:', err);
            setError('Failed to load next question.');
        }
    };

    const handlePreviousQuestion = () => {
        try {
            const prevQuestion = testSessionManager.previousQuestion();
            setCurrentQuestion(prevQuestion);
            // Update session
            setCurrentSession({ ...testSessionManager.getCurrentSession()! });
        } catch (err) {
            console.error('Error going to previous question:', err);
            setError('Failed to load previous question.');
        }
    };

    const handleFinishTest = () => {
        try {
            testSessionManager.finishTest();
            setTestState('review');
            // Go to first question for review
            const firstQuestion = testSessionManager.goToQuestion(0);
            setCurrentQuestion(firstQuestion);
            // Update session
            setCurrentSession({ ...testSessionManager.getCurrentSession()! });
        } catch (err) {
            console.error('Error finishing test:', err);
            setError('Failed to finish test.');
        }
    };

    const handleCompleteReview = () => {
        setTestState('results');
    };

    const handleRestart = () => {
        testSessionManager.resetSession();
        setCurrentSession(null);
        setCurrentQuestion(null);
        setTestState('config');
        setError(null);
    };

    const handleViewQuestion = (index: number) => {
        try {
            const question = testSessionManager.goToQuestion(index);
            setCurrentQuestion(question);
            setTestState('review'); // Set to review mode, not taking mode
            // Update session
            setCurrentSession({ ...testSessionManager.getCurrentSession()! });
        } catch (err) {
            console.error('Error viewing question:', err);
            setError('Failed to load question.');
        }
    };

    const getProgressInfo = () => {
        if (!currentSession) return { current: 0, total: 0, percentage: 0 };
        return testSessionManager.getQuestionProgress();
    };

    const getUserAnswer = (questionId: string) => {
        return testSessionManager.getUserAnswer(questionId);
    };

    if (isLoading) {
        return (
            <Flex
                height="50vh"
                alignItems="center"
                justifyContent="center"
                flexDirection="column"
                gap={4}
            >
                <Spinner size="xl" color={spinnerColor} />
                <Text>Preparing your test...</Text>
            </Flex>
        );
    }

    if (error) {
        return (
            <Box p={6} textAlign="center">
                <Text color={errorColor} fontSize="lg" mb={4}>
                    {error}
                </Text>
                <button onClick={handleRestart}>
                    Try Again
                </button>
            </Box>
        );
    }

    switch (testState) {
        case 'config':
            return <TestPage onTestStart={handleTestStart} />;
            
        case 'taking':
            if (!currentSession || !currentQuestion) {
                return (
                    <Box p={6} textAlign="center">
                        <Text>No active test session found.</Text>
                        <button onClick={handleRestart}>
                            Start New Test
                        </button>
                    </Box>
                );
            }
            
            const progress = getProgressInfo();
            const userAnswer = getUserAnswer(currentQuestion.id);
            
            return (
                <TestQuestionComponent
                    question={currentQuestion}
                    questionNumber={progress.current}
                    totalQuestions={progress.total}
                    onSubmitAnswer={handleSubmitAnswer}
                    onNextQuestion={handleNextQuestion}
                    onPreviousQuestion={handlePreviousQuestion}
                    onFinishTest={handleFinishTest}
                    hasNext={testSessionManager.hasNextQuestion()}
                    hasPrevious={testSessionManager.hasPreviousQuestion()}
                    initialAnswer={userAnswer?.userSolution}
                />
            );

        case 'review':
            if (!currentSession || !currentQuestion) {
                return (
                    <Box p={6} textAlign="center">
                        <Text>No active test session found.</Text>
                        <button onClick={handleRestart}>
                            Start New Test
                        </button>
                    </Box>
                );
            }
            
            const reviewProgress = getProgressInfo();
            const reviewUserAnswer = getUserAnswer(currentQuestion.id);
            
            return (
                <TestQuestionComponent
                    question={currentQuestion}
                    questionNumber={reviewProgress.current}
                    totalQuestions={reviewProgress.total}
                    onSubmitAnswer={() => {}} // No submission in review mode
                    onNextQuestion={handleNextQuestion}
                    onPreviousQuestion={handlePreviousQuestion}
                    onFinishTest={handleCompleteReview}
                    hasNext={testSessionManager.hasNextQuestion()}
                    hasPrevious={testSessionManager.hasPreviousQuestion()}
                    initialAnswer={reviewUserAnswer?.userSolution}
                    reviewMode={true}
                    correctSolution={reviewUserAnswer?.correctSolution}
                    userScore={reviewUserAnswer?.score}
                />
            );
            
        case 'results':
            if (!currentSession) {
                return (
                    <Box p={6} textAlign="center">
                        <Text>No test results found.</Text>
                        <button onClick={handleRestart}>
                            Start New Test
                        </button>
                    </Box>
                );
            }
            
            const results = testSessionManager.getTestResults();
            if (!results) {
                return (
                    <Box p={6} textAlign="center">
                        <Text>Unable to load test results.</Text>
                        <button onClick={handleRestart}>
                            Start New Test
                        </button>
                    </Box>
                );
            }
            
            return (
                <TestResults
                    session={results.session}
                    summary={results.summary}
                    onRestart={handleRestart}
                    onViewQuestion={handleViewQuestion}
                />
            );
            
        default:
            return (
                <Box p={6} textAlign="center">
                    <Text>Unknown test state.</Text>
                    <button onClick={handleRestart}>
                        Start New Test
                    </button>
                </Box>
            );
    }
};

export default TestContainer;
