import { useState, useEffect } from "react";
import {
    Box,
    Text,
    Input,
    VStack,
    Flex,
    Grid,
    GridItem,
} from "@chakra-ui/react";
import type { SchedulingAnswerProps } from "../../types";
import { useTestGenColors } from "../../colors";

const SchedulingAnswer = ({
    processResults,
    onProcessResultsChange,
    reviewMode = false,
    correctSolution,
    userScore,
}: SchedulingAnswerProps) => {
    const {
        borderColor,
        headerBg,
        textColor,
        valueColor,
        primaryTextColor,
        headerTextColor,
    } = useTestGenColors();
    const [avgWaitingTime, setAvgWaitingTime] = useState(0);
    const [avgTurnaroundTime, setAvgTurnaroundTime] = useState(0);
    const [completionTime, setCompletionTime] = useState(0);
    useEffect(() => {
        if (processResults.length > 0) {
            const avgWT =
                processResults.reduce((sum, p) => sum + p.waitingTime, 0) /
                processResults.length;
            const avgTT =
                processResults.reduce((sum, p) => sum + p.turnaroundTime, 0) /
                processResults.length;
            const maxCompletion = Math.max(
                ...processResults.map((p) => p.completionTime)
            );
            setAvgWaitingTime(Math.round(avgWT * 100) / 100);
            setAvgTurnaroundTime(Math.round(avgTT * 100) / 100);
            setCompletionTime(maxCompletion);
        }
    }, [processResults]);
    const handleProcessFieldChange = (
        pid: number,
        field: string,
        value: string
    ) => {
        const numValue = parseFloat(value) || 0;
        onProcessResultsChange(
            processResults.map((p) =>
                p.pid === pid ? { ...p, [field]: numValue } : p
            )
        );
    };
    return (
        <>
            <Box
                border="1px"
                borderColor={borderColor}
                borderRadius="md"
                overflow="hidden"
            >
                <Grid templateColumns="repeat(7, 1fr)" bg={headerBg}>
                    <GridItem p={3} borderRight="1px" borderColor={borderColor}>
                        <Text fontWeight="semibold" color={headerTextColor}>
                            Process ID
                        </Text>
                    </GridItem>
                    <GridItem p={3} borderRight="1px" borderColor={borderColor}>
                        <Text fontWeight="semibold" color={headerTextColor}>
                            Arrival Time
                        </Text>
                    </GridItem>
                    <GridItem p={3} borderRight="1px" borderColor={borderColor}>
                        <Text fontWeight="semibold" color={headerTextColor}>
                            Burst Time
                        </Text>
                    </GridItem>
                    <GridItem p={3} borderRight="1px" borderColor={borderColor}>
                        <Text fontWeight="semibold" color={headerTextColor}>
                            Scheduled Time
                        </Text>
                    </GridItem>
                    <GridItem p={3} borderRight="1px" borderColor={borderColor}>
                        <Text fontWeight="semibold" color={headerTextColor}>
                            Waiting Time
                        </Text>
                    </GridItem>
                    <GridItem p={3} borderRight="1px" borderColor={borderColor}>
                        <Text fontWeight="semibold" color={headerTextColor}>
                            Turnaround Time
                        </Text>
                    </GridItem>
                    <GridItem p={3}>
                        <Text fontWeight="semibold" color={headerTextColor}>
                            Completion Time
                        </Text>
                    </GridItem>
                </Grid>
                {processResults.map((process, index) => {
                    const correctProcess =
                        reviewMode && correctSolution
                            ? correctSolution.processes.find(
                                  (p) => p.pid === process.pid
                              )
                            : null;
                    return (
                        <Grid
                            key={process.pid}
                            templateColumns="repeat(7, 1fr)"
                            borderTop={index > 0 ? "1px" : "none"}
                            borderColor={borderColor}
                        >
                            <GridItem
                                p={3}
                                borderRight="1px"
                                borderColor={borderColor}
                                display="flex"
                                alignItems="center"
                            >
                                <Text
                                    color={primaryTextColor}
                                    fontWeight="medium"
                                >
                                    P{process.pid}
                                </Text>
                            </GridItem>
                            <GridItem
                                p={3}
                                borderRight="1px"
                                borderColor={borderColor}
                                display="flex"
                                alignItems="center"
                            >
                                <Text color={primaryTextColor}>
                                    {process.arrivalTime}
                                </Text>
                            </GridItem>
                            <GridItem
                                p={3}
                                borderRight="1px"
                                borderColor={borderColor}
                                display="flex"
                                alignItems="center"
                            >
                                <Text color={primaryTextColor}>
                                    {process.burstTime}
                                </Text>
                            </GridItem>
                            <GridItem
                                p={3}
                                borderRight="1px"
                                borderColor={borderColor}
                            >
                                {reviewMode ? (
                                    <VStack align="start" gap={1}>
                                        <Text
                                            color={
                                                correctProcess &&
                                                Math.abs(
                                                    process.scheduledTime -
                                                        correctProcess.scheduledTime
                                                ) <= 0.1
                                                    ? "green.600"
                                                    : "red.600"
                                            }
                                            fontWeight="semibold"
                                        >
                                            Your: {process.scheduledTime}
                                        </Text>
                                        {correctProcess && (
                                            <Text
                                                color={textColor}
                                                fontSize="sm"
                                            >
                                                Correct:{" "}
                                                {correctProcess.scheduledTime}
                                            </Text>
                                        )}
                                    </VStack>
                                ) : (
                                    <Input
                                        type="number"
                                        value={process.scheduledTime}
                                        onChange={(e) =>
                                            handleProcessFieldChange(
                                                process.pid,
                                                "scheduledTime",
                                                e.target.value
                                            )
                                        }
                                        onBlur={(e) => {
                                            if (
                                                e.target.value === "" ||
                                                isNaN(
                                                    parseFloat(e.target.value)
                                                )
                                            )
                                                handleProcessFieldChange(
                                                    process.pid,
                                                    "scheduledTime",
                                                    "0"
                                                );
                                        }}
                                        size="sm"
                                        w="80px"
                                        min={0}
                                        step={0.1}
                                        color={primaryTextColor}
                                        borderRadius="md"
                                    />
                                )}
                            </GridItem>
                            <GridItem
                                p={3}
                                borderRight="1px"
                                borderColor={borderColor}
                            >
                                {reviewMode ? (
                                    <VStack align="start" gap={1}>
                                        <Text
                                            color={
                                                correctProcess &&
                                                Math.abs(
                                                    process.waitingTime -
                                                        correctProcess.waitingTime
                                                ) <= 0.1
                                                    ? "green.600"
                                                    : "red.600"
                                            }
                                            fontWeight="semibold"
                                        >
                                            Your: {process.waitingTime}
                                        </Text>
                                        {correctProcess && (
                                            <Text
                                                color={textColor}
                                                fontSize="sm"
                                            >
                                                Correct:{" "}
                                                {correctProcess.waitingTime}
                                            </Text>
                                        )}
                                    </VStack>
                                ) : (
                                    <Input
                                        type="number"
                                        value={process.waitingTime}
                                        onChange={(e) =>
                                            handleProcessFieldChange(
                                                process.pid,
                                                "waitingTime",
                                                e.target.value
                                            )
                                        }
                                        onBlur={(e) => {
                                            if (
                                                e.target.value === "" ||
                                                isNaN(
                                                    parseFloat(e.target.value)
                                                )
                                            )
                                                handleProcessFieldChange(
                                                    process.pid,
                                                    "waitingTime",
                                                    "0"
                                                );
                                        }}
                                        size="sm"
                                        w="80px"
                                        min={0}
                                        step={0.1}
                                        color={primaryTextColor}
                                        borderRadius="md"
                                    />
                                )}
                            </GridItem>
                            <GridItem
                                p={3}
                                borderRight="1px"
                                borderColor={borderColor}
                            >
                                {reviewMode ? (
                                    <VStack align="start" gap={1}>
                                        <Text
                                            color={
                                                correctProcess &&
                                                Math.abs(
                                                    process.turnaroundTime -
                                                        correctProcess.turnaroundTime
                                                ) <= 0.1
                                                    ? "green.600"
                                                    : "red.600"
                                            }
                                            fontWeight="semibold"
                                        >
                                            Your: {process.turnaroundTime}
                                        </Text>
                                        {correctProcess && (
                                            <Text
                                                color={textColor}
                                                fontSize="sm"
                                            >
                                                Correct:{" "}
                                                {correctProcess.turnaroundTime}
                                            </Text>
                                        )}
                                    </VStack>
                                ) : (
                                    <Input
                                        type="number"
                                        value={process.turnaroundTime}
                                        onChange={(e) =>
                                            handleProcessFieldChange(
                                                process.pid,
                                                "turnaroundTime",
                                                e.target.value
                                            )
                                        }
                                        onBlur={(e) => {
                                            if (
                                                e.target.value === "" ||
                                                isNaN(
                                                    parseFloat(e.target.value)
                                                )
                                            )
                                                handleProcessFieldChange(
                                                    process.pid,
                                                    "turnaroundTime",
                                                    "0"
                                                );
                                        }}
                                        size="sm"
                                        w="80px"
                                        min={0}
                                        step={0.1}
                                        color={primaryTextColor}
                                        borderRadius="md"
                                    />
                                )}
                            </GridItem>
                            <GridItem p={3}>
                                {reviewMode ? (
                                    <VStack align="start" gap={1}>
                                        <Text
                                            color={
                                                correctProcess &&
                                                Math.abs(
                                                    process.completionTime -
                                                        correctProcess.completionTime
                                                ) <= 0.1
                                                    ? "green.600"
                                                    : "red.600"
                                            }
                                            fontWeight="semibold"
                                        >
                                            Your: {process.completionTime}
                                        </Text>
                                        {correctProcess && (
                                            <Text
                                                color={textColor}
                                                fontSize="sm"
                                            >
                                                Correct:{" "}
                                                {correctProcess.completionTime}
                                            </Text>
                                        )}
                                    </VStack>
                                ) : (
                                    <Input
                                        type="number"
                                        value={process.completionTime}
                                        onChange={(e) =>
                                            handleProcessFieldChange(
                                                process.pid,
                                                "completionTime",
                                                e.target.value
                                            )
                                        }
                                        onBlur={(e) => {
                                            if (
                                                e.target.value === "" ||
                                                isNaN(
                                                    parseFloat(e.target.value)
                                                )
                                            )
                                                handleProcessFieldChange(
                                                    process.pid,
                                                    "completionTime",
                                                    "0"
                                                );
                                        }}
                                        size="sm"
                                        w="80px"
                                        min={0}
                                        step={0.1}
                                        color={primaryTextColor}
                                        borderRadius="md"
                                    />
                                )}
                            </GridItem>
                        </Grid>
                    );
                })}
            </Box>
            <Box mt={6} p={4} bg={headerBg} borderRadius="md">
                <Flex gap={8} flexWrap="wrap">
                    <Box>
                        <Text
                            fontWeight="semibold"
                            color={primaryTextColor}
                            mb={1}
                        >
                            Average Waiting Time:
                        </Text>
                        {reviewMode && correctSolution ? (
                            <VStack align="start" gap={1}>
                                <Text
                                    fontSize="lg"
                                    color={
                                        Math.abs(
                                            avgWaitingTime -
                                                correctSolution.avgWaitingTime
                                        ) <= 0.1
                                            ? "green.600"
                                            : "red.600"
                                    }
                                    fontWeight="semibold"
                                >
                                    Your: {avgWaitingTime}
                                </Text>
                                <Text fontSize="sm" color={textColor}>
                                    Correct: {correctSolution.avgWaitingTime}
                                </Text>
                            </VStack>
                        ) : (
                            <Text
                                fontSize="lg"
                                color={valueColor}
                                fontWeight="semibold"
                            >
                                {avgWaitingTime}
                            </Text>
                        )}
                    </Box>
                    <Box>
                        <Text
                            fontWeight="semibold"
                            color={primaryTextColor}
                            mb={1}
                        >
                            Average Turnaround Time:
                        </Text>
                        {reviewMode && correctSolution ? (
                            <VStack align="start" gap={1}>
                                <Text
                                    fontSize="lg"
                                    color={
                                        Math.abs(
                                            avgTurnaroundTime -
                                                correctSolution.avgTurnaroundTime
                                        ) <= 0.1
                                            ? "green.600"
                                            : "red.600"
                                    }
                                    fontWeight="semibold"
                                >
                                    Your: {avgTurnaroundTime}
                                </Text>
                                <Text fontSize="sm" color={textColor}>
                                    Correct: {correctSolution.avgTurnaroundTime}
                                </Text>
                            </VStack>
                        ) : (
                            <Text
                                fontSize="lg"
                                color={valueColor}
                                fontWeight="semibold"
                            >
                                {avgTurnaroundTime}
                            </Text>
                        )}
                    </Box>
                    <Box>
                        <Text
                            fontWeight="semibold"
                            color={primaryTextColor}
                            mb={1}
                        >
                            Total Completion Time:
                        </Text>
                        {reviewMode && correctSolution ? (
                            <VStack align="start" gap={1}>
                                <Text
                                    fontSize="lg"
                                    color={
                                        Math.abs(
                                            completionTime -
                                                correctSolution.completionTime
                                        ) <= 0.1
                                            ? "green.600"
                                            : "red.600"
                                    }
                                    fontWeight="semibold"
                                >
                                    Your: {completionTime}
                                </Text>
                                <Text fontSize="sm" color={textColor}>
                                    Correct: {correctSolution.completionTime}
                                </Text>
                            </VStack>
                        ) : (
                            <Text
                                fontSize="lg"
                                color={valueColor}
                                fontWeight="semibold"
                            >
                                {completionTime}
                            </Text>
                        )}
                    </Box>
                    {reviewMode && userScore !== undefined && (
                        <Box>
                            <Text
                                fontWeight="semibold"
                                color={primaryTextColor}
                                mb={1}
                            >
                                Your Score:
                            </Text>
                            <Text
                                fontSize="lg"
                                color={
                                    userScore >= 80
                                        ? "green.600"
                                        : userScore >= 60
                                          ? "yellow.600"
                                          : "red.600"
                                }
                                fontWeight="semibold"
                            >
                                {userScore}/100
                            </Text>
                        </Box>
                    )}
                </Flex>
            </Box>
        </>
    );
};

export default SchedulingAnswer;
