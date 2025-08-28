import React, { useState, useEffect } from "react";
import {
    Box,
    Flex,
    Heading,
    Text,
    Button,
    Input,
    HStack,
    VStack,
    Badge,
    Grid,
    GridItem
} from "@chakra-ui/react";
import { useColorModeValue } from "./ui/color-mode";
import type { TestQuestion, TestSolution, ProcessResult } from "../types/Test";

interface TestQuestionComponentProps {
    question: TestQuestion;
    questionNumber: number;
    totalQuestions: number;
    onSubmitAnswer: (solution: TestSolution) => void;
    onNextQuestion: () => void;
    onPreviousQuestion: () => void;
    onFinishTest: () => void;
    hasNext: boolean;
    hasPrevious: boolean;
    initialAnswer?: TestSolution;
    reviewMode?: boolean;
    correctSolution?: TestSolution;
    userScore?: number;
}

const TestQuestionComponent: React.FC<TestQuestionComponentProps> = ({
    question,
    questionNumber,
    totalQuestions,
    onSubmitAnswer,
    onNextQuestion,
    onPreviousQuestion,
    onFinishTest,
    hasNext,
    hasPrevious,
    initialAnswer,
    reviewMode = false,
    correctSolution,
    userScore
}) => {
    const [processResults, setProcessResults] = useState<ProcessResult[]>(() => {
        if (initialAnswer) {
            return initialAnswer.processes;
        }
        return question.processes.map(p => ({
            pid: p.id,
            arrivalTime: p.arrivalTime,
            burstTime: p.burstTime,
            scheduledTime: 0,
            waitingTime: 0,
            turnaroundTime: 0,
            completionTime: 0
        }));
    });

    const [avgWaitingTime, setAvgWaitingTime] = useState(initialAnswer?.avgWaitingTime || 0);
    const [avgTurnaroundTime, setAvgTurnaroundTime] = useState(initialAnswer?.avgTurnaroundTime || 0);
    const [completionTime, setCompletionTime] = useState(initialAnswer?.completionTime || 0);

    // UI Colors
    const boxBg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const headerBg = useColorModeValue("gray.50", "gray.700");

    useEffect(() => {
        // Update averages when process results change
        if (processResults.length > 0) {
            const avgWT = processResults.reduce((sum, p) => sum + p.waitingTime, 0) / processResults.length;
            const avgTT = processResults.reduce((sum, p) => sum + p.turnaroundTime, 0) / processResults.length;
            const maxCompletion = Math.max(...processResults.map(p => p.completionTime));
            
            setAvgWaitingTime(Math.round(avgWT * 100) / 100);
            setAvgTurnaroundTime(Math.round(avgTT * 100) / 100);
            setCompletionTime(maxCompletion);
        }
    }, [processResults]);

    const handleProcessFieldChange = (pid: number, field: string, value: string) => {
        const numValue = parseFloat(value) || 0;
        setProcessResults(prev => prev.map(p => 
            p.pid === pid ? { ...p, [field]: numValue } : p
        ));
    };

    const handleSubmit = () => {
        const solution: TestSolution = {
            processes: processResults,
            avgWaitingTime,
            avgTurnaroundTime,
            completionTime,
            ganttChart: [] // For simplicity, we'll let the backend calculate this
        };

        console.log('=== USER SUBMISSION DEBUG ===');
        console.log('User Solution Being Submitted:', JSON.stringify(solution, null, 2));
        console.log('Process Results:', processResults);
        console.log('Calculated averages - Waiting:', avgWaitingTime, 'Turnaround:', avgTurnaroundTime, 'Completion:', completionTime);
        console.log('=== END USER SUBMISSION DEBUG ===');

        onSubmitAnswer(solution);
        
        // Automatically proceed to next question or finish test
        if (hasNext) {
            onNextQuestion();
        } else {
            onFinishTest();
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'green';
            case 'medium': return 'yellow';
            case 'hard': return 'red';
            default: return 'gray';
        }
    };

    const formatIOOperations = (io: Array<{start: number, duration: number}>) => {
        if (io.length === 0) return "None";
        return io.map(op => `I/O at ${op.start} for ${op.duration}ms`).join(", ");
    };

    const progress = (questionNumber / totalQuestions) * 100;

    return (
        <Flex
            maxW="1200px"
            w="90%"
            mx="auto"
            flexDirection="column"
            gap="6"
            mt="6"
        >
            {/* Header */}
            <Box>
                <Flex justifyContent="space-between" alignItems="center" mb={4}>
                    <Heading size="lg">Question {questionNumber} of {totalQuestions}</Heading>
                    <Badge colorScheme={getDifficultyColor(question.difficulty)} fontSize="md" p={2}>
                        {question.difficulty.toUpperCase()}
                    </Badge>
                </Flex>
                <Box h="4px" bg="gray.200" borderRadius="md" mb={4}>
                    <Box 
                        h="100%" 
                        bg="blue.500" 
                        borderRadius="md" 
                        width={`${progress}%`}
                        transition="width 0.3s"
                    />
                </Box>
            </Box>

            {/* Question Info */}
            <Box 
                p={6} 
                borderWidth={1} 
                borderRadius="lg" 
                shadow="md" 
                bg={boxBg} 
                borderColor={borderColor}
            >
                <VStack align="start" gap={4}>
                    <Box>
                        <Text fontSize="lg" fontWeight="semibold" mb={2}>
                            Algorithm: {question.algorithm}
                            {question.quantum && ` (Quantum = ${question.quantum})`}
                        </Text>
                        <Text color="gray.600">{question.description}</Text>
                    </Box>

                    {/* Process Information Grid */}
                    <Box w="100%">
                        <Text fontSize="md" fontWeight="semibold" mb={3}>Process Information:</Text>
                        <Box border="1px" borderColor={borderColor} borderRadius="md" overflow="hidden">
                            {/* Header */}
                            <Grid templateColumns="repeat(4, 1fr)" bg={headerBg}>
                                <GridItem p={3} borderRight="1px" borderColor={borderColor}>
                                    <Text fontWeight="semibold">Process ID</Text>
                                </GridItem>
                                <GridItem p={3} borderRight="1px" borderColor={borderColor}>
                                    <Text fontWeight="semibold">Arrival Time</Text>
                                </GridItem>
                                <GridItem p={3} borderRight="1px" borderColor={borderColor}>
                                    <Text fontWeight="semibold">Burst Time</Text>
                                </GridItem>
                                <GridItem p={3}>
                                    <Text fontWeight="semibold">I/O Operations</Text>
                                </GridItem>
                            </Grid>
                            {/* Rows */}
                            {question.processes.map((process, index) => (
                                <Grid key={process.id} templateColumns="repeat(4, 1fr)" borderTop={index > 0 ? "1px" : "none"} borderColor={borderColor}>
                                    <GridItem p={3} borderRight="1px" borderColor={borderColor}>
                                        <Text>P{process.id}</Text>
                                    </GridItem>
                                    <GridItem p={3} borderRight="1px" borderColor={borderColor}>
                                        <Text>{process.arrivalTime}</Text>
                                    </GridItem>
                                    <GridItem p={3} borderRight="1px" borderColor={borderColor}>
                                        <Text>{process.burstTime}</Text>
                                    </GridItem>
                                    <GridItem p={3}>
                                        <Text>{formatIOOperations(process.io)}</Text>
                                    </GridItem>
                                </Grid>
                            ))}
                        </Box>
                    </Box>
                </VStack>
            </Box>

            {/* Answer Grid */}
            <Box 
                p={6} 
                borderWidth={1} 
                borderRadius="lg" 
                shadow="md" 
                bg={boxBg} 
                borderColor={borderColor}
            >
                <Text fontSize="lg" fontWeight="semibold" mb={4}>
                    {reviewMode ? "Your Answer vs Correct Answer:" : "Your Answer:"}
                </Text>
                
                <Box border="1px" borderColor={borderColor} borderRadius="md" overflow="hidden">
                    {/* Header */}
                    <Grid templateColumns="repeat(7, 1fr)" bg={headerBg}>
                        <GridItem p={3} borderRight="1px" borderColor={borderColor}>
                            <Text fontWeight="semibold">Process ID</Text>
                        </GridItem>
                        <GridItem p={3} borderRight="1px" borderColor={borderColor}>
                            <Text fontWeight="semibold">Arrival Time</Text>
                        </GridItem>
                        <GridItem p={3} borderRight="1px" borderColor={borderColor}>
                            <Text fontWeight="semibold">Burst Time</Text>
                        </GridItem>
                        <GridItem p={3} borderRight="1px" borderColor={borderColor}>
                            <Text fontWeight="semibold">Scheduled Time</Text>
                        </GridItem>
                        <GridItem p={3} borderRight="1px" borderColor={borderColor}>
                            <Text fontWeight="semibold">Waiting Time</Text>
                        </GridItem>
                        <GridItem p={3} borderRight="1px" borderColor={borderColor}>
                            <Text fontWeight="semibold">Turnaround Time</Text>
                        </GridItem>
                        <GridItem p={3}>
                            <Text fontWeight="semibold">Completion Time</Text>
                        </GridItem>
                    </Grid>
                    {/* Rows */}
                    {processResults.map((process, index) => {
                        const correctProcess = reviewMode && correctSolution 
                            ? correctSolution.processes.find(p => p.pid === process.pid)
                            : null;
                        
                        return (
                            <Grid key={process.pid} templateColumns="repeat(7, 1fr)" borderTop={index > 0 ? "1px" : "none"} borderColor={borderColor}>
                                <GridItem p={3} borderRight="1px" borderColor={borderColor} display="flex" alignItems="center">
                                    <Text>P{process.pid}</Text>
                                </GridItem>
                                <GridItem p={3} borderRight="1px" borderColor={borderColor} display="flex" alignItems="center">
                                    <Text>{process.arrivalTime}</Text>
                                </GridItem>
                                <GridItem p={3} borderRight="1px" borderColor={borderColor} display="flex" alignItems="center">
                                    <Text>{process.burstTime}</Text>
                                </GridItem>
                                <GridItem p={3} borderRight="1px" borderColor={borderColor}>
                                    {reviewMode ? (
                                        <VStack align="start" gap={1}>
                                            <Text 
                                                color={correctProcess && Math.abs(process.scheduledTime - correctProcess.scheduledTime) <= 0.1 ? "green.600" : "red.600"}
                                                fontWeight="semibold"
                                            >
                                                Your: {process.scheduledTime}
                                            </Text>
                                            {correctProcess && (
                                                <Text color="gray.600" fontSize="sm">
                                                    Correct: {correctProcess.scheduledTime}
                                                </Text>
                                            )}
                                        </VStack>
                                    ) : (
                                        <Input
                                            type="number"
                                            value={process.scheduledTime}
                                            onChange={(e) => handleProcessFieldChange(process.pid, 'scheduledTime', e.target.value)}
                                            size="sm"
                                            w="80px"
                                            min={0}
                                            step={0.1}
                                        />
                                    )}
                                </GridItem>
                                <GridItem p={3} borderRight="1px" borderColor={borderColor}>
                                    {reviewMode ? (
                                        <VStack align="start" gap={1}>
                                            <Text 
                                                color={correctProcess && Math.abs(process.waitingTime - correctProcess.waitingTime) <= 0.1 ? "green.600" : "red.600"}
                                                fontWeight="semibold"
                                            >
                                                Your: {process.waitingTime}
                                            </Text>
                                            {correctProcess && (
                                                <Text color="gray.600" fontSize="sm">
                                                    Correct: {correctProcess.waitingTime}
                                                </Text>
                                            )}
                                        </VStack>
                                    ) : (
                                        <Input
                                            type="number"
                                            value={process.waitingTime}
                                            onChange={(e) => handleProcessFieldChange(process.pid, 'waitingTime', e.target.value)}
                                            size="sm"
                                            w="80px"
                                            min={0}
                                            step={0.1}
                                        />
                                    )}
                                </GridItem>
                                <GridItem p={3} borderRight="1px" borderColor={borderColor}>
                                    {reviewMode ? (
                                        <VStack align="start" gap={1}>
                                            <Text 
                                                color={correctProcess && Math.abs(process.turnaroundTime - correctProcess.turnaroundTime) <= 0.1 ? "green.600" : "red.600"}
                                                fontWeight="semibold"
                                            >
                                                Your: {process.turnaroundTime}
                                            </Text>
                                            {correctProcess && (
                                                <Text color="gray.600" fontSize="sm">
                                                    Correct: {correctProcess.turnaroundTime}
                                                </Text>
                                            )}
                                        </VStack>
                                    ) : (
                                        <Input
                                            type="number"
                                            value={process.turnaroundTime}
                                            onChange={(e) => handleProcessFieldChange(process.pid, 'turnaroundTime', e.target.value)}
                                            size="sm"
                                            w="80px"
                                            min={0}
                                            step={0.1}
                                        />
                                    )}
                                </GridItem>
                                <GridItem p={3}>
                                    {reviewMode ? (
                                        <VStack align="start" gap={1}>
                                            <Text 
                                                color={correctProcess && Math.abs(process.completionTime - correctProcess.completionTime) <= 0.1 ? "green.600" : "red.600"}
                                                fontWeight="semibold"
                                            >
                                                Your: {process.completionTime}
                                            </Text>
                                            {correctProcess && (
                                                <Text color="gray.600" fontSize="sm">
                                                    Correct: {correctProcess.completionTime}
                                                </Text>
                                            )}
                                        </VStack>
                                    ) : (
                                        <Input
                                            type="number"
                                            value={process.completionTime}
                                            onChange={(e) => handleProcessFieldChange(process.pid, 'completionTime', e.target.value)}
                                            size="sm"
                                            w="80px"
                                            min={0}
                                            step={0.1}
                                        />
                                    )}
                                </GridItem>
                            </Grid>
                        );
                    })}
                </Box>

                {/* Summary Statistics */}
                <Box mt={6} p={4} bg={headerBg} borderRadius="md">
                    <Flex gap={8} flexWrap="wrap">
                        <Box>
                            <Text fontWeight="semibold">Average Waiting Time:</Text>
                            {reviewMode && correctSolution ? (
                                <VStack align="start" gap={1}>
                                    <Text fontSize="lg" color={Math.abs(avgWaitingTime - correctSolution.avgWaitingTime) <= 0.1 ? "green.600" : "red.600"}>
                                        Your: {avgWaitingTime}
                                    </Text>
                                    <Text fontSize="sm" color="gray.600">
                                        Correct: {correctSolution.avgWaitingTime}
                                    </Text>
                                </VStack>
                            ) : (
                                <Text fontSize="lg" color="blue.600">{avgWaitingTime}</Text>
                            )}
                        </Box>
                        <Box>
                            <Text fontWeight="semibold">Average Turnaround Time:</Text>
                            {reviewMode && correctSolution ? (
                                <VStack align="start" gap={1}>
                                    <Text fontSize="lg" color={Math.abs(avgTurnaroundTime - correctSolution.avgTurnaroundTime) <= 0.1 ? "green.600" : "red.600"}>
                                        Your: {avgTurnaroundTime}
                                    </Text>
                                    <Text fontSize="sm" color="gray.600">
                                        Correct: {correctSolution.avgTurnaroundTime}
                                    </Text>
                                </VStack>
                            ) : (
                                <Text fontSize="lg" color="blue.600">{avgTurnaroundTime}</Text>
                            )}
                        </Box>
                        <Box>
                            <Text fontWeight="semibold">Total Completion Time:</Text>
                            {reviewMode && correctSolution ? (
                                <VStack align="start" gap={1}>
                                    <Text fontSize="lg" color={Math.abs(completionTime - correctSolution.completionTime) <= 0.1 ? "green.600" : "red.600"}>
                                        Your: {completionTime}
                                    </Text>
                                    <Text fontSize="sm" color="gray.600">
                                        Correct: {correctSolution.completionTime}
                                    </Text>
                                </VStack>
                            ) : (
                                <Text fontSize="lg" color="blue.600">{completionTime}</Text>
                            )}
                        </Box>
                        {reviewMode && userScore !== undefined && (
                            <Box>
                                <Text fontWeight="semibold">Your Score:</Text>
                                <Text fontSize="lg" color={userScore >= 80 ? "green.600" : userScore >= 60 ? "yellow.600" : "red.600"}>
                                    {userScore}/100
                                </Text>
                            </Box>
                        )}
                    </Flex>
                </Box>
            </Box>

            {/* Navigation Buttons */}
            <HStack justifyContent="space-between" mt={6}>
                <Button 
                    onClick={onPreviousQuestion}
                    disabled={!hasPrevious || reviewMode}
                    variant="outline"
                >
                    Previous
                </Button>

                <HStack gap={4}>
                    {!reviewMode && (
                        <Button 
                            colorScheme="blue" 
                            size="lg"
                            onClick={handleSubmit}
                        >
                            {hasNext ? "Submit & Next" : "Submit Test"}
                        </Button>
                    )}
                    
                    {reviewMode && hasNext && (
                        <Button 
                            size="lg" 
                            onClick={onNextQuestion}
                        >
                            Next Question
                        </Button>
                    )}
                    
                    {reviewMode && !hasNext && (
                        <Button 
                            colorScheme="green" 
                            size="lg" 
                            onClick={onFinishTest}
                        >
                            View Test Results
                        </Button>
                    )}
                </HStack>
            </HStack>
        </Flex>
    );
};

export default TestQuestionComponent;
