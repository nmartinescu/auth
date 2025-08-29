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
import type { TestQuestion, TestSolution, MemoryTestSolution, ProcessResult, MemoryStepResult } from "../types/Test";

interface TestQuestionComponentProps {
    question: TestQuestion;
    questionNumber: number;
    totalQuestions: number;
    onSubmitAnswer: (solution: TestSolution | MemoryTestSolution) => void;
    onNextQuestion: () => void;
    onPreviousQuestion: () => void;
    onFinishTest: () => void;
    hasNext: boolean;
    hasPrevious: boolean;
    initialAnswer?: TestSolution | MemoryTestSolution;
    reviewMode?: boolean;
    correctSolution?: TestSolution | MemoryTestSolution;
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
    // Scheduling-specific state
    const [processResults, setProcessResults] = useState<ProcessResult[]>(() => {
        if (question.type === 'scheduling' && initialAnswer && 'processes' in initialAnswer) {
            return initialAnswer.processes;
        }
        if (question.type === 'scheduling' && question.processes) {
            return question.processes.map(p => ({
                pid: p.id,
                arrivalTime: p.arrivalTime,
                burstTime: p.burstTime,
                scheduledTime: 0,
                waitingTime: 0,
                turnaroundTime: 0,
                completionTime: 0
            }));
        }
        return [];
    });

    const [avgWaitingTime, setAvgWaitingTime] = useState(() => {
        if (initialAnswer && 'avgWaitingTime' in initialAnswer) {
            return initialAnswer.avgWaitingTime;
        }
        return 0;
    });
    
    const [avgTurnaroundTime, setAvgTurnaroundTime] = useState(() => {
        if (initialAnswer && 'avgTurnaroundTime' in initialAnswer) {
            return initialAnswer.avgTurnaroundTime;
        }
        return 0;
    });
    
    const [completionTime, setCompletionTime] = useState(() => {
        if (initialAnswer && 'completionTime' in initialAnswer) {
            return initialAnswer.completionTime;
        }
        return 0;
    });

    // Memory-specific state
    const [memorySteps, setMemorySteps] = useState<MemoryStepResult[]>(() => {
        if (initialAnswer && 'stepResults' in initialAnswer) {
            return initialAnswer.stepResults;
        }
        if (question.type === 'memory' && question.pageReferences && question.frameCount) {
            return question.pageReferences.map(pageRef => ({
                pageReference: pageRef,
                frameState: new Array(question.frameCount).fill(null),
                pageFault: false
            }));
        }
        return [];
    });

    // UI Colors
    const boxBg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const headerBg = useColorModeValue("gray.50", "gray.700");
    const textColor = useColorModeValue("gray.600", "gray.300");
    const progressBg = useColorModeValue("gray.200", "gray.600");
    const valueColor = useColorModeValue("blue.600", "blue.300");
    const primaryTextColor = useColorModeValue("gray.900", "white");
    const headerTextColor = useColorModeValue("gray.700", "gray.200");

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

    // Reset state when question changes
    useEffect(() => {
        if (question.type === 'memory' && question.pageReferences && question.frameCount) {
            // Reset memory steps for new question
            if (initialAnswer && 'stepResults' in initialAnswer) {
                setMemorySteps(initialAnswer.stepResults);
            } else {
                setMemorySteps(question.pageReferences.map(pageRef => ({
                    pageReference: pageRef,
                    frameState: new Array(question.frameCount).fill(null),
                    pageFault: false
                })));
            }
        } else if (question.type === 'scheduling' && question.processes) {
            // Reset scheduling data for new question
            if (initialAnswer && 'processes' in initialAnswer) {
                setProcessResults(initialAnswer.processes);
                setAvgWaitingTime(initialAnswer.avgWaitingTime);
                setAvgTurnaroundTime(initialAnswer.avgTurnaroundTime);
                setCompletionTime(initialAnswer.completionTime);
            } else {
                setProcessResults(question.processes.map(p => ({
                    pid: p.id,
                    arrivalTime: p.arrivalTime,
                    burstTime: p.burstTime,
                    scheduledTime: 0,
                    waitingTime: 0,
                    turnaroundTime: 0,
                    completionTime: 0
                })));
                setAvgWaitingTime(0);
                setAvgTurnaroundTime(0);
                setCompletionTime(0);
            }
        }
    }, [question, initialAnswer]);

    const handleProcessFieldChange = (pid: number, field: string, value: string) => {
        const numValue = parseFloat(value) || 0;
        setProcessResults(prev => prev.map(p => 
            p.pid === pid ? { ...p, [field]: numValue } : p
        ));
    };

    const handleMemoryFrameChange = (stepIndex: number, frameIndex: number, value: string) => {
        let numValue: number | null = null;
        if (value !== '') {
            const parsed = parseInt(value);
            if (!isNaN(parsed)) {
                numValue = parsed;
            }
        }
        
        setMemorySteps(prev => prev.map((step, idx) => 
            idx === stepIndex 
                ? { 
                    ...step, 
                    frameState: step.frameState.map((frame, fIdx) => 
                        fIdx === frameIndex ? numValue : frame
                    )
                }
                : step
        ));
    };

    const handlePageFaultChange = (stepIndex: number, isPageFault: boolean) => {
        setMemorySteps(prev => prev.map((step, idx) => 
            idx === stepIndex ? { ...step, pageFault: isPageFault } : step
        ));
    };

    const handleSubmit = () => {
        let solution: TestSolution | MemoryTestSolution;
        
        if (question.type === 'memory') {
            // Calculate total page faults from user's step results
            const totalPageFaults = memorySteps.filter(step => step.pageFault).length;
            
            solution = {
                algorithm: question.algorithm,
                frameCount: question.frameCount || 0,
                pageReferences: question.pageReferences || [],
                totalPageFaults,
                hitRate: 0, // Will be calculated by backend
                frames: [], // For simplicity, we'll let the backend calculate this
                customData: [], // For simplicity, we'll let the backend calculate this
                stepResults: memorySteps
            };
            
            console.log('=== USER MEMORY SUBMISSION DEBUG ===');
            console.log('User Memory Solution Being Submitted:', JSON.stringify(solution, null, 2));
            console.log('Memory Steps Details:');
            memorySteps.forEach((step, i) => {
                console.log(`  Step ${i}: Page ${step.pageReference}, Frames: [${step.frameState.join(', ')}], Page Fault: ${step.pageFault}`);
            });
            console.log('Total Page Faults:', totalPageFaults);
            console.log('=== END USER MEMORY SUBMISSION DEBUG ===');
        } else {
            solution = {
                processes: processResults,
                avgWaitingTime,
                avgTurnaroundTime,
                completionTime,
                ganttChart: [] // For simplicity, we'll let the backend calculate this
            };

            console.log('=== USER SCHEDULING SUBMISSION DEBUG ===');
            console.log('User Scheduling Solution Being Submitted:', JSON.stringify(solution, null, 2));
            console.log('Process Results:', processResults);
            console.log('Calculated averages - Waiting:', avgWaitingTime, 'Turnaround:', avgTurnaroundTime, 'Completion:', completionTime);
            console.log('=== END USER SCHEDULING SUBMISSION DEBUG ===');
        }

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
                    <Heading size="lg" color={primaryTextColor}>Question {questionNumber} of {totalQuestions}</Heading>
                    <Badge colorScheme={getDifficultyColor(question.difficulty)} fontSize="md" p={2}>
                        {question.difficulty.toUpperCase()}
                    </Badge>
                </Flex>
                <Box h="4px" bg={progressBg} borderRadius="md" mb={4}>
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
                        <Text fontSize="lg" fontWeight="semibold" mb={2} color={primaryTextColor}>
                            Algorithm: {question.algorithm}
                            {question.quantum && ` (Quantum = ${question.quantum})`}
                        </Text>
                        <Text color={textColor}>{question.description}</Text>
                    </Box>

                    {/* Process Information Grid - Only for scheduling questions */}
                    {question.type === 'scheduling' && question.processes && (
                        <Box w="100%">
                            <Text fontSize="md" fontWeight="semibold" mb={3} color={primaryTextColor}>Process Information:</Text>
                            <Box border="1px" borderColor={borderColor} borderRadius="md" overflow="hidden">
                                {/* Header */}
                                <Grid templateColumns="repeat(4, 1fr)" bg={headerBg}>
                                    <GridItem p={3} borderRight="1px" borderColor={borderColor}>
                                        <Text fontWeight="semibold" color={headerTextColor}>Process ID</Text>
                                    </GridItem>
                                    <GridItem p={3} borderRight="1px" borderColor={borderColor}>
                                        <Text fontWeight="semibold" color={headerTextColor}>Arrival Time</Text>
                                    </GridItem>
                                    <GridItem p={3} borderRight="1px" borderColor={borderColor}>
                                        <Text fontWeight="semibold" color={headerTextColor}>Burst Time</Text>
                                    </GridItem>
                                    <GridItem p={3}>
                                        <Text fontWeight="semibold" color={headerTextColor}>I/O Operations</Text>
                                    </GridItem>
                                </Grid>
                                {/* Rows */}
                                {question.processes.map((process, index) => (
                                    <Grid key={process.id} templateColumns="repeat(4, 1fr)" borderTop={index > 0 ? "1px" : "none"} borderColor={borderColor}>
                                        <GridItem p={3} borderRight="1px" borderColor={borderColor}>
                                            <Text color={primaryTextColor}>P{process.id}</Text>
                                        </GridItem>
                                        <GridItem p={3} borderRight="1px" borderColor={borderColor}>
                                            <Text color={primaryTextColor}>{process.arrivalTime}</Text>
                                        </GridItem>
                                        <GridItem p={3} borderRight="1px" borderColor={borderColor}>
                                            <Text color={primaryTextColor}>{process.burstTime}</Text>
                                        </GridItem>
                                        <GridItem p={3}>
                                            <Text color={primaryTextColor}>{formatIOOperations(process.io)}</Text>
                                        </GridItem>
                                    </Grid>
                                ))}
                            </Box>
                        </Box>
                    )}

                    {/* Memory Information - Only for memory questions */}
                    {question.type === 'memory' && (
                        <Box w="100%">
                            <Text fontSize="md" fontWeight="semibold" mb={3} color={primaryTextColor}>Memory Configuration:</Text>
                            <Box border="1px" borderColor={borderColor} borderRadius="md" p={4}>
                                <VStack align="start" gap={3}>
                                    <Text color={primaryTextColor}><strong>Frame Count:</strong> {question.frameCount}</Text>
                                    <Text color={primaryTextColor}><strong>Page Reference Sequence:</strong> {question.pageReferences?.join(', ')}</Text>
                                    <Text color={primaryTextColor}><strong>Algorithm:</strong> {question.algorithm}</Text>
                                </VStack>
                            </Box>
                        </Box>
                    )}
                </VStack>
            </Box>

            {/* Answer Section */}
            <Box 
                p={6} 
                borderWidth={1} 
                borderRadius="lg" 
                shadow="md" 
                bg={boxBg} 
                borderColor={borderColor}
            >
                <Text fontSize="lg" fontWeight="semibold" mb={4} color={primaryTextColor}>
                    {reviewMode ? "Your Answer vs Correct Answer:" : "Your Answer:"}
                </Text>
                
                {question.type === 'scheduling' ? (
                    <>
                        {/* Scheduling Answer Grid */}
                        <Box border="1px" borderColor={borderColor} borderRadius="md" overflow="hidden">
                            {/* Header */}
                            <Grid templateColumns="repeat(7, 1fr)" bg={headerBg}>
                                <GridItem p={3} borderRight="1px" borderColor={borderColor}>
                                    <Text fontWeight="semibold" color={headerTextColor}>Process ID</Text>
                                </GridItem>
                                <GridItem p={3} borderRight="1px" borderColor={borderColor}>
                                    <Text fontWeight="semibold" color={headerTextColor}>Arrival Time</Text>
                                </GridItem>
                                <GridItem p={3} borderRight="1px" borderColor={borderColor}>
                                    <Text fontWeight="semibold" color={headerTextColor}>Burst Time</Text>
                                </GridItem>
                                <GridItem p={3} borderRight="1px" borderColor={borderColor}>
                                    <Text fontWeight="semibold" color={headerTextColor}>Scheduled Time</Text>
                                </GridItem>
                                <GridItem p={3} borderRight="1px" borderColor={borderColor}>
                                    <Text fontWeight="semibold" color={headerTextColor}>Waiting Time</Text>
                                </GridItem>
                                <GridItem p={3} borderRight="1px" borderColor={borderColor}>
                                    <Text fontWeight="semibold" color={headerTextColor}>Turnaround Time</Text>
                                </GridItem>
                                <GridItem p={3}>
                                    <Text fontWeight="semibold" color={headerTextColor}>Completion Time</Text>
                                </GridItem>
                            </Grid>
                            {/* Rows */}
                            {processResults.map((process, index) => {
                                const correctProcess = reviewMode && correctSolution && 'processes' in correctSolution
                                    ? correctSolution.processes.find(p => p.pid === process.pid)
                                    : null;
                                
                                return (
                                    <Grid key={process.pid} templateColumns="repeat(7, 1fr)" borderTop={index > 0 ? "1px" : "none"} borderColor={borderColor}>
                                        <GridItem p={3} borderRight="1px" borderColor={borderColor} display="flex" alignItems="center">
                                            <Text color={primaryTextColor}>P{process.pid}</Text>
                                        </GridItem>
                                        <GridItem p={3} borderRight="1px" borderColor={borderColor} display="flex" alignItems="center">
                                            <Text color={primaryTextColor}>{process.arrivalTime}</Text>
                                        </GridItem>
                                        <GridItem p={3} borderRight="1px" borderColor={borderColor} display="flex" alignItems="center">
                                            <Text color={primaryTextColor}>{process.burstTime}</Text>
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
                                                        <Text color={textColor} fontSize="sm">
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
                                                    color={primaryTextColor}
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
                                                        <Text color={textColor} fontSize="sm">
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
                                                    color={primaryTextColor}
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
                                                        <Text color={textColor} fontSize="sm">
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
                                                    color={primaryTextColor}
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
                                                        <Text color={textColor} fontSize="sm">
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
                                                    color={primaryTextColor}
                                                />
                                            )}
                                        </GridItem>
                                    </Grid>
                                );
                            })}
                        </Box>

                        {/* Scheduling Summary Statistics */}
                        <Box mt={6} p={4} bg={headerBg} borderRadius="md">
                            <Flex gap={8} flexWrap="wrap">
                                <Box>
                                    <Text fontWeight="semibold" color={primaryTextColor}>Average Waiting Time:</Text>
                                    {reviewMode && correctSolution && 'avgWaitingTime' in correctSolution ? (
                                        <VStack align="start" gap={1}>
                                            <Text fontSize="lg" color={Math.abs(avgWaitingTime - correctSolution.avgWaitingTime) <= 0.1 ? "green.600" : "red.600"}>
                                                Your: {avgWaitingTime}
                                            </Text>
                                            <Text fontSize="sm" color={textColor}>
                                                Correct: {correctSolution.avgWaitingTime}
                                            </Text>
                                        </VStack>
                                    ) : (
                                        <Text fontSize="lg" color={valueColor}>{avgWaitingTime}</Text>
                                    )}
                                </Box>
                                <Box>
                                    <Text fontWeight="semibold" color={primaryTextColor}>Average Turnaround Time:</Text>
                                    {reviewMode && correctSolution && 'avgTurnaroundTime' in correctSolution ? (
                                        <VStack align="start" gap={1}>
                                            <Text fontSize="lg" color={Math.abs(avgTurnaroundTime - correctSolution.avgTurnaroundTime) <= 0.1 ? "green.600" : "red.600"}>
                                                Your: {avgTurnaroundTime}
                                            </Text>
                                            <Text fontSize="sm" color={textColor}>
                                                Correct: {correctSolution.avgTurnaroundTime}
                                            </Text>
                                        </VStack>
                                    ) : (
                                        <Text fontSize="lg" color={valueColor}>{avgTurnaroundTime}</Text>
                                    )}
                                </Box>
                                <Box>
                                    <Text fontWeight="semibold" color={primaryTextColor}>Total Completion Time:</Text>
                                    {reviewMode && correctSolution && 'completionTime' in correctSolution ? (
                                        <VStack align="start" gap={1}>
                                            <Text fontSize="lg" color={Math.abs(completionTime - correctSolution.completionTime) <= 0.1 ? "green.600" : "red.600"}>
                                                Your: {completionTime}
                                            </Text>
                                            <Text fontSize="sm" color={textColor}>
                                                Correct: {correctSolution.completionTime}
                                            </Text>
                                        </VStack>
                                    ) : (
                                        <Text fontSize="lg" color={valueColor}>{completionTime}</Text>
                                    )}
                                </Box>
                                {reviewMode && userScore !== undefined && (
                                    <Box>
                                        <Text fontWeight="semibold" color={primaryTextColor}>Your Score:</Text>
                                        <Text fontSize="lg" color={userScore >= 80 ? "green.600" : userScore >= 60 ? "yellow.600" : "red.600"}>
                                            {userScore}/100
                                        </Text>
                                    </Box>
                                )}
                            </Flex>
                        </Box>
                    </>
                ) : (
                    <>
                        {/* Memory Step-by-Step Table */}
                        <Box border="1px" borderColor={borderColor} borderRadius="md" overflow="hidden">
                            <Box overflowX="auto" maxW="100%">
                            {/* Header */}
                            <Grid templateColumns={`80px repeat(${question.frameCount || 3}, 1fr) 100px`} bg={headerBg} minW={`${180 + (question.frameCount || 3) * 80}px`}>
                                <GridItem p={3} borderRight="1px" borderColor={borderColor}>
                                    <Text fontWeight="semibold" color={headerTextColor}>Page Ref</Text>
                                </GridItem>
                                {Array.from({ length: question.frameCount || 3 }, (_, i) => (
                                    <GridItem key={i} p={3} borderRight="1px" borderColor={borderColor}>
                                        <Text fontWeight="semibold" color={headerTextColor}>Frame {i}</Text>
                                    </GridItem>
                                ))}
                                <GridItem p={3}>
                                    <Text fontWeight="semibold" color={headerTextColor}>Page Fault?</Text>
                                </GridItem>
                            </Grid>
                            
                            {/* Memory Steps */}
                            {memorySteps.map((step, stepIndex) => {
                                const correctStep = reviewMode && correctSolution && 'stepResults' in correctSolution
                                    ? correctSolution.stepResults[stepIndex]
                                    : null;
                                
                                return (
                                    <Grid 
                                        key={stepIndex} 
                                        templateColumns={`80px repeat(${question.frameCount || 3}, 1fr) 100px`} 
                                        borderTop="1px" 
                                        borderColor={borderColor}
                                        minW={`${180 + (question.frameCount || 3) * 80}px`}
                                    >
                                        <GridItem p={3} borderRight="1px" borderColor={borderColor} display="flex" alignItems="center">
                                            <Text fontWeight="semibold" color={primaryTextColor}>{step.pageReference}</Text>
                                        </GridItem>
                                        
                                        {step.frameState.map((frameValue, frameIndex) => (
                                            <GridItem key={frameIndex} p={3} borderRight="1px" borderColor={borderColor}>
                                                {reviewMode ? (
                                                    <VStack align="start" gap={1}>
                                                        <Text 
                                                            color={correctStep && (() => {
                                                                const userIsEmpty = frameValue === null || frameValue === undefined;
                                                                const correctIsEmpty = correctStep.frameState[frameIndex] === null || correctStep.frameState[frameIndex] === undefined;
                                                                return (frameValue === correctStep.frameState[frameIndex]) || (userIsEmpty && correctIsEmpty);
                                                            })() ? "green.600" : "red.600"}
                                                            fontWeight="semibold"
                                                        >
                                                            Your: {frameValue ?? '-'}
                                                        </Text>
                                                        {correctStep && (
                                                            <Text color={textColor} fontSize="sm">
                                                                Correct: {correctStep.frameState[frameIndex] ?? '-'}
                                                            </Text>
                                                        )}
                                                    </VStack>
                                                ) : (
                                                    <Input
                                                        type="number"
                                                        value={frameValue ?? ''}
                                                        onChange={(e) => handleMemoryFrameChange(stepIndex, frameIndex, e.target.value)}
                                                        size="sm"
                                                        w="60px"
                                                        min={1}
                                                        placeholder="-"
                                                        color={primaryTextColor}
                                                    />
                                                )}
                                            </GridItem>
                                        ))}
                                        
                                        <GridItem p={3} display="flex" alignItems="center" justifyContent="center">
                                            {reviewMode ? (
                                                <VStack align="center" gap={1}>
                                                    <Text 
                                                        color={correctStep && step.pageFault === correctStep.pageFault ? "green.600" : "red.600"}
                                                        fontWeight="semibold"
                                                    >
                                                        Your: {step.pageFault ? "Yes" : "No"}
                                                    </Text>
                                                    {correctStep && (
                                                        <Text color={textColor} fontSize="sm">
                                                            Correct: {correctStep.pageFault ? "Yes" : "No"}
                                                        </Text>
                                                    )}
                                                </VStack>
                                            ) : (
                                                <input
                                                    type="checkbox"
                                                    checked={step.pageFault}
                                                    onChange={(e) => handlePageFaultChange(stepIndex, e.target.checked)}
                                                    style={{ transform: 'scale(1.2)' }}
                                                />
                                            )}
                                        </GridItem>
                                    </Grid>
                                );
                            })}
                            </Box>
                        </Box>

                        {/* Memory Summary */}
                        <Box mt={6} p={4} bg={headerBg} borderRadius="md">
                            <Flex gap={8} flexWrap="wrap" align="center">
                                <Box>
                                    <Text fontWeight="semibold" color={primaryTextColor}>Total Page Faults:</Text>
                                    <Text fontSize="lg" color={valueColor}>
                                        {memorySteps.filter(step => step.pageFault).length}
                                    </Text>
                                </Box>
                                <Box>
                                    <Text fontWeight="semibold" color={primaryTextColor}>Total References:</Text>
                                    <Text fontSize="lg" color={valueColor}>
                                        {memorySteps.length}
                                    </Text>
                                </Box>
                                <Box>
                                    <Text fontWeight="semibold" color={primaryTextColor}>Hit Rate:</Text>
                                    <Text fontSize="lg" color={valueColor}>
                                        {memorySteps.length > 0 
                                            ? ((memorySteps.length - memorySteps.filter(step => step.pageFault).length) / memorySteps.length * 100).toFixed(1)
                                            : 0}%
                                    </Text>
                                </Box>
                                {reviewMode && userScore !== undefined && (
                                    <Box>
                                        <Text fontWeight="semibold" color={primaryTextColor}>Your Score:</Text>
                                        <Text fontSize="lg" color={userScore >= 80 ? "green.600" : userScore >= 60 ? "yellow.600" : "red.600"}>
                                            {userScore}/100
                                        </Text>
                                    </Box>
                                )}
                            </Flex>
                        </Box>
                    </>
                )}
            </Box>

            {/* Navigation Buttons */}
            <HStack justifyContent="space-between" mt={6}>
                <Button 
                    onClick={onPreviousQuestion}
                    disabled={!hasPrevious || reviewMode}
                    variant="outline"
                    color={primaryTextColor}
                    borderColor={borderColor}
                    _hover={{ bg: headerBg }}
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
