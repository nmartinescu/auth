import { useState, useEffect } from "react";
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
import { useColorModeValue } from "../../ui/color-mode";
import type { TestSolution, MemoryTestSolution, DiskTestSolution, ProcessResult, MemoryStepResult, TestQuestionComponentProps } from "../types.ts";

const TestQuestionComponent = ({
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
}: TestQuestionComponentProps) => {
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
                frameState: new Array(question.frameCount).fill(0),
                pageFault: false
            }));
        }
        return [];
    });

    // Disk-specific state
    const [diskSequence, setDiskSequence] = useState<number[]>(() => {
        if (initialAnswer && 'sequence' in initialAnswer) {
            console.log('Initializing disk sequence from initial answer:', initialAnswer.sequence);
            return initialAnswer.sequence;
        }
        if (question.type === 'disk' && question.initialHeadPosition !== undefined) {
            console.log('Initializing disk sequence with initial head position:', question.initialHeadPosition);
            // Initialize with initial head position + placeholders for all requests
            const initialSequence = [question.initialHeadPosition];
            if (question.requests) {
                for (let i = 0; i < question.requests.length; i++) {
                    initialSequence.push(0);
                }
            }
            return initialSequence;
        }
        console.log('Initializing empty disk sequence');
        return [];
    });

    const [totalSeekTime, setTotalSeekTime] = useState(() => {
        if (initialAnswer && 'totalSeekTime' in initialAnswer) {
            return initialAnswer.totalSeekTime;
        }
        return 0;
    });

    const [averageSeekTime, setAverageSeekTime] = useState(() => {
        if (initialAnswer && 'averageSeekTime' in initialAnswer) {
            return initialAnswer.averageSeekTime;
        }
        return 0;
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
                    frameState: new Array(question.frameCount).fill(0),
                    pageFault: false
                })));
            }
        } else if (question.type === 'disk' && question.initialHeadPosition !== undefined) {
            // Reset disk data for new question
            if (initialAnswer && 'sequence' in initialAnswer) {
                setDiskSequence(initialAnswer.sequence);
                setTotalSeekTime(initialAnswer.totalSeekTime);
                setAverageSeekTime(initialAnswer.averageSeekTime);
            } else {
                // Initialize with initial head position + placeholders for all requests
                const initialSequence = [question.initialHeadPosition || 0];
                // Add placeholders for each request (user needs to fill these in)
                if (question.requests) {
                    for (let i = 0; i < question.requests.length; i++) {
                        initialSequence.push(0);
                    }
                }
                setDiskSequence(initialSequence);
                setTotalSeekTime(0);
                setAverageSeekTime(0);
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
        // Default to 0 if empty or invalid, don't allow null values
        let numValue: number = 0;
        if (value !== '') {
            const parsed = parseInt(value);
            if (!isNaN(parsed) && parsed >= 0) {
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

    const handleSequenceChange = (index: number, value: string) => {
        const numValue = parseInt(value) || 0;
        setDiskSequence(prev => {
            const newSequence = prev.map((pos, idx) => 
                idx === index ? numValue : pos
            );
            // Auto-calculate seek times when sequence changes
            calculateSeekTimes(newSequence);
            return newSequence;
        });
    };

    const calculateSeekTimes = (sequence: number[]) => {
        if (sequence.length < 2) {
            setTotalSeekTime(0);
            setAverageSeekTime(0);
            return;
        }

        let total = 0;
        for (let i = 1; i < sequence.length; i++) {
            total += Math.abs(sequence[i] - sequence[i - 1]);
        }

        const requestCount = sequence.length - 1; // Exclude initial position
        const average = requestCount > 0 ? total / requestCount : 0;

        setTotalSeekTime(total);
        setAverageSeekTime(Math.round(average * 100) / 100);
    };

    const handleSubmit = () => {
        let solution: TestSolution | MemoryTestSolution | DiskTestSolution;
        
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
        } else if (question.type === 'disk') {
            // Validate disk sequence before submission
            const expectedSequenceLength = 1 + (question.requests?.length || 0); // Initial position + all requests
            if (diskSequence.length < expectedSequenceLength) {
                alert(`Please complete the sequence. You need ${expectedSequenceLength} positions total (initial position + ${question.requests?.length || 0} requests).`);
                return;
            }


            const hasIncompleteEntries = diskSequence.some((pos, index) => {
                if (index === 0) return false;
                return pos === 0 && !question.requests?.includes(0);
            });

            if (hasIncompleteEntries) {
                const proceed = confirm('Your sequence contains some zero values that may not be valid track positions. Do you want to submit anyway?');
                if (!proceed) return;
            }

            solution = {
                algorithm: question.algorithm,
                maxDiskSize: question.maxDiskSize || 0,
                initialHeadPosition: question.initialHeadPosition || 0,
                headDirection: question.headDirection || 'right',
                requests: question.requests || [],
                sequence: diskSequence,
                totalSeekTime,
                averageSeekTime
            };

            console.log('=== USER DISK SUBMISSION DEBUG ===');
            console.log('User Disk Solution Being Submitted:', JSON.stringify(solution, null, 2));
            console.log('Disk Sequence:', diskSequence);
            console.log('Total Seek Time:', totalSeekTime, 'Average Seek Time:', averageSeekTime);
            console.log('Expected sequence length:', expectedSequenceLength, 'Actual length:', diskSequence.length);
            console.log('=== END USER DISK SUBMISSION DEBUG ===');
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
            mb="10"
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

                    {/* Disk Information - Only for disk questions */}
                    {question.type === 'disk' && (
                        <Box w="100%">
                            <Text fontSize="md" fontWeight="semibold" mb={3} color={primaryTextColor}>Disk Configuration:</Text>
                            <Box border="1px" borderColor={borderColor} borderRadius="md" p={4}>
                                <VStack align="start" gap={3}>
                                    <Text color={primaryTextColor}><strong>Maximum Disk Size:</strong> {question.maxDiskSize} tracks (0 to {(question.maxDiskSize || 1) - 1})</Text>
                                    <Text color={primaryTextColor}><strong>Initial Head Position:</strong> {question.initialHeadPosition}</Text>
                                    <Text color={primaryTextColor}><strong>Head Direction:</strong> {question.headDirection}</Text>
                                    <Text color={primaryTextColor}><strong>Disk Requests:</strong> {question.requests?.join(', ')}</Text>
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
                                                    onBlur={(e) => {
                                                        if (e.target.value === '' || isNaN(parseFloat(e.target.value))) {
                                                            handleProcessFieldChange(process.pid, 'scheduledTime', '0');
                                                        }
                                                    }}
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
                                                    onBlur={(e) => {
                                                        if (e.target.value === '' || isNaN(parseFloat(e.target.value))) {
                                                            handleProcessFieldChange(process.pid, 'waitingTime', '0');
                                                        }
                                                    }}
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
                                                    onBlur={(e) => {
                                                        if (e.target.value === '' || isNaN(parseFloat(e.target.value))) {
                                                            handleProcessFieldChange(process.pid, 'turnaroundTime', '0');
                                                        }
                                                    }}
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
                                                    onBlur={(e) => {
                                                        if (e.target.value === '' || isNaN(parseFloat(e.target.value))) {
                                                            handleProcessFieldChange(process.pid, 'completionTime', '0');
                                                        }
                                                    }}
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
                ) : question.type === 'disk' ? (
                    <>
                        {/* Disk Scheduling Answer Form */}
                        <VStack align="start" gap={6} w="100%">
                            {/* Sequence Input */}
                            <Box w="100%">
                                <Text fontWeight="semibold" color={primaryTextColor} mb={3}>
                                    Service Sequence (including initial head position):
                                </Text>
                                <Box border="1px" borderColor={borderColor} borderRadius="md" p={4}>
                                    <VStack align="start" gap={3}>
                                        <VStack align="start" gap={2}>
                                            <Text fontSize="sm" color={textColor}>
                                                Enter the order in which disk requests are serviced. The first position is the initial head position ({question.initialHeadPosition}). 
                                                You need to enter the remaining {question.requests?.length || 0} positions for the requests: [{question.requests?.join(', ') || ''}].
                                                Seek times will be calculated automatically as you enter the sequence.
                                            </Text>
                                            <Text fontSize="xs" color={diskSequence.length === 1 + (question.requests?.length || 0) ? "green.600" : "orange.600"}>
                                                Sequence progress: {diskSequence.length} / {1 + (question.requests?.length || 0)} positions
                                                {diskSequence.length < 1 + (question.requests?.length || 0) && " (incomplete)"}
                                            </Text>
                                        </VStack>
                                        <HStack wrap="wrap" gap={2}>
                                            {diskSequence.map((position, index) => (
                                                <HStack key={index} gap={1}>
                                                    <Text fontSize="sm" color={textColor}>
                                                        {index === 0 ? "Start:" : `${index}:`}
                                                    </Text>
                                                    {reviewMode ? (
                                                        <Box>
                                                            {correctSolution && 'sequence' in correctSolution ? (
                                                                <VStack align="start" gap={1}>
                                                                    <Text 
                                                                        color={position === correctSolution.sequence[index] ? "green.600" : "red.600"}
                                                                        fontWeight="semibold"
                                                                    >
                                                                        Your: {position}
                                                                    </Text>
                                                                    <Text color={textColor} fontSize="sm">
                                                                        Correct: {correctSolution.sequence[index]}
                                                                    </Text>
                                                                </VStack>
                                                            ) : (
                                                                <Text color={primaryTextColor}>{position}</Text>
                                                            )}
                                                        </Box>
                                                    ) : (
                                                        <Input
                                                            type="number"
                                                            value={position}
                                                            onChange={(e) => handleSequenceChange(index, e.target.value)}
                                                            onBlur={(e) => {
                                                                // Ensure we always have a valid number on blur
                                                                if (e.target.value === '' || isNaN(parseInt(e.target.value))) {
                                                                    handleSequenceChange(index, '0');
                                                                }
                                                            }}
                                                            size="sm"
                                                            w="80px"
                                                            min={0}
                                                            max={(question.maxDiskSize || 200) - 1}
                                                            color={primaryTextColor}
                                                            disabled={index === 0} 
                                                        />
                                                    )}

                                                </HStack>
                                            ))}

                                        </HStack>
                                    </VStack>
                                </Box>
                            </Box>

                            {/* Seek Time Calculations */}
                            <Box w="100%">
                                <Text fontWeight="semibold" color={primaryTextColor} mb={3}>
                                    Seek Time Calculations:
                                </Text>
                                <Box border="1px" borderColor={borderColor} borderRadius="md" p={4}>
                                    <VStack align="start" gap={4}>
                                        <HStack gap={8} wrap="wrap">
                                            <Box>
                                                <Text fontWeight="semibold" color={primaryTextColor}>Total Seek Time:</Text>
                                                {reviewMode && correctSolution && 'totalSeekTime' in correctSolution ? (
                                                    <VStack align="start" gap={1}>
                                                        <Text 
                                                            fontSize="lg" 
                                                            color={Math.abs(totalSeekTime - correctSolution.totalSeekTime) <= 0.01 ? "green.600" : "red.600"}
                                                            fontWeight="semibold"
                                                        >
                                                            Your: {totalSeekTime}
                                                        </Text>
                                                        <Text fontSize="sm" color={textColor}>
                                                            Correct: {correctSolution.totalSeekTime}
                                                        </Text>
                                                    </VStack>
                                                ) : reviewMode ? (
                                                    <Text fontSize="lg" color={primaryTextColor}>{totalSeekTime}</Text>
                                                ) : (
                                                    <Input
                                                        type="number"
                                                        value={totalSeekTime}
                                                        onChange={(e) => setTotalSeekTime(parseFloat(e.target.value) || 0)}
                                                        onBlur={(e) => {
                                                            if (e.target.value === '' || isNaN(parseFloat(e.target.value))) {
                                                                setTotalSeekTime(0);
                                                            }
                                                        }}
                                                        size="sm"
                                                        w="120px"
                                                        min={0}
                                                        step={0.01}
                                                        color={primaryTextColor}
                                                    />
                                                )}
                                            </Box>
                                            <Box>
                                                <Text fontWeight="semibold" color={primaryTextColor}>Average Seek Time:</Text>
                                                {reviewMode && correctSolution && 'averageSeekTime' in correctSolution ? (
                                                    <VStack align="start" gap={1}>
                                                        <Text 
                                                            fontSize="lg" 
                                                            color={Math.abs(averageSeekTime - correctSolution.averageSeekTime) <= 0.01 ? "green.600" : "red.600"}
                                                            fontWeight="semibold"
                                                        >
                                                            Your: {averageSeekTime.toFixed(2)}
                                                        </Text>
                                                        <Text fontSize="sm" color={textColor}>
                                                            Correct: {correctSolution.averageSeekTime.toFixed(2)}
                                                        </Text>
                                                    </VStack>
                                                ) : reviewMode ? (
                                                    <Text fontSize="lg" color={primaryTextColor}>{averageSeekTime.toFixed(2)}</Text>
                                                ) : (
                                                    <Input
                                                        type="number"
                                                        value={averageSeekTime}
                                                        onChange={(e) => setAverageSeekTime(parseFloat(e.target.value) || 0)}
                                                        onBlur={(e) => {
                                                            if (e.target.value === '' || isNaN(parseFloat(e.target.value))) {
                                                                setAverageSeekTime(0);
                                                            }
                                                        }}
                                                        size="sm"
                                                        w="120px"
                                                        min={0}
                                                        step={0.01}
                                                        color={primaryTextColor}
                                                    />
                                                )}
                                            </Box>
                                        </HStack>
                                        

                                        
                                        {!reviewMode && (
                                            <Box>
                                                <Text fontSize="sm" color={textColor} fontStyle="italic">
                                                    Tip: Total Seek Time = Sum of |current_position - next_position| for each movement
                                                    <br />
                                                    Average Seek Time = Total Seek Time ÷ Number of Requests
                                                </Text>
                                            </Box>
                                        )}

                                        {reviewMode && userScore !== undefined && (
                                            <Box>
                                                <Text fontWeight="semibold" color={primaryTextColor}>Your Score:</Text>
                                                <Text fontSize="lg" color={userScore >= 80 ? "green.600" : userScore >= 60 ? "yellow.600" : "red.600"}>
                                                    {userScore}/100
                                                </Text>
                                            </Box>
                                        )}
                                    </VStack>
                                </Box>
                            </Box>
                        </VStack>
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
                                                            color={correctStep && frameValue === correctStep.frameState[frameIndex] ? "green.600" : "red.600"}
                                                            fontWeight="semibold"
                                                        >
                                                            Your: {frameValue ?? 0}
                                                        </Text>
                                                        {correctStep && (
                                                            <Text color={textColor} fontSize="sm">
                                                                Correct: {correctStep.frameState[frameIndex] ?? 0}
                                                            </Text>
                                                        )}
                                                    </VStack>
                                                ) : (
                                                    <Input
                                                        type="number"
                                                        value={frameValue ?? 0}
                                                        onChange={(e) => handleMemoryFrameChange(stepIndex, frameIndex, e.target.value)}
                                                        onBlur={(e) => {
                                                            // Ensure we always have a valid number on blur
                                                            if (e.target.value === '' || isNaN(parseInt(e.target.value))) {
                                                                handleMemoryFrameChange(stepIndex, frameIndex, '0');
                                                            }
                                                        }}
                                                        size="sm"
                                                        w="60px"
                                                        min={0}
                                                        placeholder="0"
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
