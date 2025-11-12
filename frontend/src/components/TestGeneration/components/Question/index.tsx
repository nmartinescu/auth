import { useState, useEffect } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { useColorModeValue } from "../../../ui/color-mode";
import QuestionHeader from "./QuestionHeader";
import QuestionInfo from "./QuestionInfo";
import SchedulingAnswer from "./SchedulingAnswer";
import MemoryAnswer from "./MemoryAnswer";
import DiskAnswer from "./DiskAnswer";
import QuestionNavigation from "./QuestionNavigation";
import type { 
    TestSolution, 
    MemoryTestSolution, 
    DiskTestSolution, 
    ProcessResult, 
    MemoryStepResult, 
    TestQuestionComponentProps 
} from "../../types";

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
            return initialAnswer.sequence;
        }
        if (question.type === 'disk' && question.initialHeadPosition !== undefined) {
            const initialSequence = [question.initialHeadPosition];
            if (question.requests) {
                for (let i = 0; i < question.requests.length; i++) {
                    initialSequence.push(0);
                }
            }
            return initialSequence;
        }
        return [];
    });

    // UI Colors
    const boxBg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const primaryTextColor = useColorModeValue("gray.900", "white");

    // Reset state when question changes
    useEffect(() => {
        if (question.type === 'memory' && question.pageReferences && question.frameCount) {
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
            if (initialAnswer && 'sequence' in initialAnswer) {
                setDiskSequence(initialAnswer.sequence);
            } else {
                const initialSequence = [question.initialHeadPosition || 0];
                if (question.requests) {
                    for (let i = 0; i < question.requests.length; i++) {
                        initialSequence.push(0);
                    }
                }
                setDiskSequence(initialSequence);
            }
        } else if (question.type === 'scheduling' && question.processes) {
            if (initialAnswer && 'processes' in initialAnswer) {
                setProcessResults(initialAnswer.processes);
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
            }
        }
    }, [question, initialAnswer]);

    const handleSubmit = () => {
        let solution: TestSolution | MemoryTestSolution | DiskTestSolution;
        
        if (question.type === 'memory') {
            const totalPageFaults = memorySteps.filter(step => step.pageFault).length;
            
            solution = {
                algorithm: question.algorithm,
                frameCount: question.frameCount || 0,
                pageReferences: question.pageReferences || [],
                totalPageFaults,
                hitRate: 0,
                frames: [],
                customData: [],
                stepResults: memorySteps
            };
        } else if (question.type === 'disk') {
            const expectedSequenceLength = 1 + (question.requests?.length || 0);
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

            // Calculate seek times
            let totalSeekTime = 0;
            for (let i = 1; i < diskSequence.length; i++) {
                totalSeekTime += Math.abs(diskSequence[i] - diskSequence[i - 1]);
            }
            const averageSeekTime = totalSeekTime / (diskSequence.length - 1);

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
        } else {
            // Calculate scheduling metrics
            const avgWaitingTime = processResults.reduce((sum, p) => sum + p.waitingTime, 0) / processResults.length;
            const avgTurnaroundTime = processResults.reduce((sum, p) => sum + p.turnaroundTime, 0) / processResults.length;
            const completionTime = Math.max(...processResults.map(p => p.completionTime));

            solution = {
                processes: processResults,
                avgWaitingTime: Math.round(avgWaitingTime * 100) / 100,
                avgTurnaroundTime: Math.round(avgTurnaroundTime * 100) / 100,
                completionTime,
                ganttChart: []
            };
        }

        onSubmitAnswer(solution);
        
        if (hasNext) {
            onNextQuestion();
        } else {
            onFinishTest();
        }
    };

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
            <QuestionHeader 
                questionNumber={questionNumber}
                totalQuestions={totalQuestions}
                difficulty={question.difficulty}
            />

            {/* Question Info */}
            <QuestionInfo question={question} />

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
                    <SchedulingAnswer
                        processResults={processResults}
                        onProcessResultsChange={setProcessResults}
                        reviewMode={reviewMode}
                        correctSolution={correctSolution && 'processes' in correctSolution ? correctSolution : undefined}
                        userScore={userScore}
                    />
                ) : question.type === 'disk' ? (
                    <DiskAnswer
                        diskSequence={diskSequence}
                        maxDiskSize={question.maxDiskSize || 200}
                        initialHeadPosition={question.initialHeadPosition || 0}
                        requests={question.requests || []}
                        onDiskSequenceChange={setDiskSequence}
                        reviewMode={reviewMode}
                        correctSolution={correctSolution && 'sequence' in correctSolution ? correctSolution : undefined}
                        userScore={userScore}
                    />
                ) : (
                    <MemoryAnswer
                        memorySteps={memorySteps}
                        frameCount={question.frameCount || 3}
                        onMemoryStepsChange={setMemorySteps}
                        reviewMode={reviewMode}
                        correctSolution={correctSolution && 'stepResults' in correctSolution ? correctSolution : undefined}
                        userScore={userScore}
                    />
                )}
            </Box>

            {/* Navigation Buttons */}
            <QuestionNavigation
                hasPrevious={hasPrevious}
                hasNext={hasNext}
                reviewMode={reviewMode}
                onPreviousQuestion={onPreviousQuestion}
                onNextQuestion={onNextQuestion}
                onSubmit={handleSubmit}
                onFinishTest={onFinishTest}
            />
        </Flex>
    );
};

export default TestQuestionComponent;
