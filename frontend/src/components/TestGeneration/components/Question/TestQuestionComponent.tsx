import { useState, useEffect } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import QuestionHeader from "./QuestionHeader";
import QuestionInfo from "./QuestionInfo";
import SchedulingAnswer from "./SchedulingAnswer";
import MemoryAnswer from "./MemoryAnswer";
import DiskAnswer from "./DiskAnswer";
import QuestionNavigation from "./QuestionNavigation";
import { useTestGenColors } from "../../colors";
import type {
    TestSolution,
    MemoryTestSolution,
    DiskTestSolution,
    ProcessResult,
    MemoryStepResult,
    TestQuestionComponentProps,
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
    userScore,
    onBackToResults,
}: TestQuestionComponentProps) => {
    const { boxBg, borderColor, primaryTextColor } = useTestGenColors();
    const [processResults, setProcessResults] = useState<ProcessResult[]>(
        () => {
            if (
                question.type === "scheduling" &&
                initialAnswer &&
                "processes" in initialAnswer
            )
                return initialAnswer.processes;
            if (question.type === "scheduling" && question.processes)
                return question.processes.map((p) => ({
                    pid: p.id,
                    arrivalTime: p.arrivalTime,
                    burstTime: p.burstTime,
                    scheduledTime: 0,
                    waitingTime: 0,
                    turnaroundTime: 0,
                    completionTime: 0,
                }));
            return [];
        }
    );

    const [avgWaitingTime, setAvgWaitingTime] = useState<number>(() => {
        if (
            question.type === "scheduling" &&
            initialAnswer &&
            "avgWaitingTime" in initialAnswer
        )
            return initialAnswer.avgWaitingTime;
        return 0;
    });

    const [avgTurnaroundTime, setAvgTurnaroundTime] = useState<number>(
        () => {
            if (
                question.type === "scheduling" &&
                initialAnswer &&
                "avgTurnaroundTime" in initialAnswer
            )
                return initialAnswer.avgTurnaroundTime;
            return 0;
        }
    );

    const [completionTime, setCompletionTime] = useState<number>(() => {
        if (
            question.type === "scheduling" &&
            initialAnswer &&
            "completionTime" in initialAnswer
        )
            return initialAnswer.completionTime;
        return 0;
    });

    const [memorySteps, setMemorySteps] = useState<MemoryStepResult[]>(() => {
        if (initialAnswer && "stepResults" in initialAnswer)
            return initialAnswer.stepResults;
        if (
            question.type === "memory" &&
            question.pageReferences &&
            question.frameCount
        )
            return question.pageReferences.map((pageRef) => ({
                pageReference: pageRef,
                frameState: new Array(question.frameCount).fill(0),
                pageFault: false,
            }));
        return [];
    });

    const [diskSequence, setDiskSequence] = useState<number[]>(() => {
        if (initialAnswer && "sequence" in initialAnswer)
            return initialAnswer.sequence;
        if (
            question.type === "disk" &&
            question.initialHeadPosition !== undefined
        ) {
            const initialSequence = [question.initialHeadPosition];
            if (question.requests)
                for (let i = 0; i < question.requests.length; i++)
                    initialSequence.push(0);
            return initialSequence;
        }
        return [];
    });

    useEffect(() => {
        if (
            question.type === "memory" &&
            question.pageReferences &&
            question.frameCount
        ) {
            if (initialAnswer && "stepResults" in initialAnswer)
                setMemorySteps(initialAnswer.stepResults);
            else
                setMemorySteps(
                    question.pageReferences.map((pageRef) => ({
                        pageReference: pageRef,
                        frameState: new Array(question.frameCount).fill(0),
                        pageFault: false,
                    }))
                );
        } else if (
            question.type === "disk" &&
            question.initialHeadPosition !== undefined
        ) {
            if (initialAnswer && "sequence" in initialAnswer)
                setDiskSequence(initialAnswer.sequence);
            else {
                const initialSequence = [question.initialHeadPosition || 0];
                if (question.requests)
                    for (let i = 0; i < question.requests.length; i++)
                        initialSequence.push(0);
                setDiskSequence(initialSequence);
            }
        } else if (question.type === "scheduling" && question.processes) {
            if (initialAnswer && "processes" in initialAnswer) {
                setProcessResults(initialAnswer.processes);
                if ("avgWaitingTime" in initialAnswer)
                    setAvgWaitingTime(initialAnswer.avgWaitingTime);
                if ("avgTurnaroundTime" in initialAnswer)
                    setAvgTurnaroundTime(initialAnswer.avgTurnaroundTime);
                if ("completionTime" in initialAnswer)
                    setCompletionTime(initialAnswer.completionTime);
            } else {
                setProcessResults(
                    question.processes.map((p) => ({
                        pid: p.id,
                        arrivalTime: p.arrivalTime,
                        burstTime: p.burstTime,
                        scheduledTime: 0,
                        waitingTime: 0,
                        turnaroundTime: 0,
                        completionTime: 0,
                    }))
                );
                setAvgWaitingTime(0);
                setAvgTurnaroundTime(0);
                setCompletionTime(0);
            }
        }
    }, [question, initialAnswer]);

    const handleSubmit = () => {
        let solution: TestSolution | MemoryTestSolution | DiskTestSolution;
        if (question.type === "memory") {
            const totalPageFaults = memorySteps.filter(
                (step) => step.pageFault
            ).length;
            solution = {
                algorithm: question.algorithm,
                frameCount: question.frameCount || 0,
                pageReferences: question.pageReferences || [],
                totalPageFaults,
                hitRate: 0,
                frames: [],
                customData: [],
                stepResults: memorySteps,
            };
        } else if (question.type === "disk") {
            let totalSeekTime = 0;
            for (let i = 1; i < diskSequence.length; i++)
                totalSeekTime += Math.abs(
                    diskSequence[i] - diskSequence[i - 1]
                );
            const averageSeekTime = totalSeekTime / (diskSequence.length - 1);
            solution = {
                algorithm: question.algorithm,
                maxDiskSize: question.maxDiskSize || 0,
                initialHeadPosition: question.initialHeadPosition || 0,
                headDirection: question.headDirection || "right",
                requests: question.requests || [],
                sequence: diskSequence,
                totalSeekTime,
                averageSeekTime,
            };
        } else {
            solution = {
                processes: processResults,
                avgWaitingTime: Math.round(avgWaitingTime * 100) / 100,
                avgTurnaroundTime: Math.round(avgTurnaroundTime * 100) / 100,
                completionTime,
                ganttChart: [],
            };
        }
        onSubmitAnswer(solution);
        if (hasNext) onNextQuestion();
        else onFinishTest();
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
            <QuestionHeader
                questionNumber={questionNumber}
                totalQuestions={totalQuestions}
                difficulty={question.difficulty}
            />
            <QuestionInfo question={question} />
            <Box
                p={6}
                borderWidth={1}
                borderRadius="lg"
                shadow="md"
                bg={boxBg}
                borderColor={borderColor}
            >
                <Text
                    fontSize="lg"
                    fontWeight="semibold"
                    mb={4}
                    color={primaryTextColor}
                >
                    {reviewMode
                        ? "Your Answer vs Correct Answer:"
                        : "Your Answer:"}
                </Text>
                {question.type === "scheduling" ? (
                    <SchedulingAnswer
                        processResults={processResults}
                        onProcessResultsChange={setProcessResults}
                        avgWaitingTime={avgWaitingTime}
                        avgTurnaroundTime={avgTurnaroundTime}
                        completionTime={completionTime}
                        onAvgWaitingTimeChange={setAvgWaitingTime}
                        onAvgTurnaroundTimeChange={setAvgTurnaroundTime}
                        onCompletionTimeChange={setCompletionTime}
                        reviewMode={reviewMode}
                        correctSolution={
                            correctSolution && "processes" in correctSolution
                                ? correctSolution
                                : undefined
                        }
                        userScore={userScore}
                    />
                ) : question.type === "disk" ? (
                    <DiskAnswer
                        diskSequence={diskSequence}
                        maxDiskSize={question.maxDiskSize || 200}
                        initialHeadPosition={question.initialHeadPosition || 0}
                        requests={question.requests || []}
                        onDiskSequenceChange={setDiskSequence}
                        reviewMode={reviewMode}
                        correctSolution={
                            correctSolution && "sequence" in correctSolution
                                ? correctSolution
                                : undefined
                        }
                        userScore={userScore}
                    />
                ) : (
                    <MemoryAnswer
                        memorySteps={memorySteps}
                        frameCount={question.frameCount || 3}
                        onMemoryStepsChange={setMemorySteps}
                        reviewMode={reviewMode}
                        correctSolution={
                            correctSolution && "stepResults" in correctSolution
                                ? correctSolution
                                : undefined
                        }
                        userScore={userScore}
                    />
                )}
            </Box>
            <QuestionNavigation
                hasPrevious={hasPrevious}
                hasNext={hasNext}
                reviewMode={reviewMode}
                onPreviousQuestion={onPreviousQuestion}
                onNextQuestion={onNextQuestion}
                onSubmit={handleSubmit}
                onFinishTest={onFinishTest}
                onBackToResults={onBackToResults}
            />
        </Flex>
    );
};

export default TestQuestionComponent;
