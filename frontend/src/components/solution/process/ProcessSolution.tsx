import { Box, Button, Flex, IconButton, Table, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
    LuChevronsLeft,
    LuChevronLeft,
    LuChevronRight,
    LuChevronsRight,
    LuArrowLeft,
} from "react-icons/lu";
import { useColorModeValue } from "../../ui/color-mode";
import type { ProcessSolutionProps } from "./ProcessSolution.types";
import GanttChart from "./GanttChart";

export default function ProcessSolution({
    solution,
    onBack,
}: ProcessSolutionProps) {
    const [stepIndex, setStepIndex] = useState(0);
    const [graphicTable, setGraphicTable] = useState([]);

    // Color mode values
    const cardBg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("#E5E7EB", "#4A5568");
    const textColor = useColorModeValue("gray.800", "gray.100");
    const subtextColor = useColorModeValue("gray.600", "gray.300");

    if (!solution || !solution.data) {
        return <div>No solution data available</div>;
    }

    useEffect(() => {
        setGraphicTable(solution.data.solution[stepIndex].graphicTable);
    }, [stepIndex]);

    const handleStepChange = (action: "next" | "prev" | "start" | "end") => {
        setStepIndex((prev) => {
            if (action === "next")
                return Math.min(prev + 1, solution.data.solution.length - 1);
            if (action === "prev") return Math.max(prev - 1, 0);
            if (action === "start") return 0;
            if (action === "end")
                return Math.max(0, solution.data.solution.length - 1);
            return prev;
        });
    };

    const solutionLength = solution.data.solution.length;
    const explaination = solution.data.solution[stepIndex].explaination;

    const timerInfo = solution.data.solution[stepIndex].timer;
    const readyQueue = solution.data.solution[stepIndex].readyQueues;
    const waitQueue = solution.data.solution[stepIndex].waitQueue;
    const newQueue = solution.data.solution[stepIndex].newProcesses;

    const btnStyle = {
        bg: "white",
        color: "blue.500",
        border: "1px solid",
        borderColor: "blue.300",
        boxShadow: "3px 3px 2px rgba(0, 0, 0, 0.3)",
        _hover: { bg: "blue.50" },
        _active: {
            bg: "blue.100",
            transform: "scale(0.95)",
            boxShadow: "2px 2px 1px rgba(0, 0, 0, 0.3)",
        },
    };

    return (
        <Flex
            maxW="1400px"
            w="95%"
            mx="auto"
            flexDirection="column"
            gap="6"
            mt="6"
            mb="10"
        >
            {/* Header */}
            <Box textAlign="center">
                <Text fontSize="3xl" fontWeight="bold" color={textColor} mb="2">
                    Process Scheduling Results
                </Text>
                <Text fontSize="lg" color={subtextColor}>
                    Algorithm: {solution.data.algorithm} | Total Processes: {solution.data.processes} | 
                    Avg Waiting Time: {solution.data.metrics.averageWaitingTime} | 
                    Avg Turnaround Time: {solution.data.metrics.averageTurnaroundTime}
                </Text>
            </Box>

            <Flex
                direction={{ base: "column", lg: "row" }}
                gap="6"
                align="flex-start"
            >
                {/* Process Chart */}
                <Box flex="1" maxW="900px">
                    {/* Gantt Chart Visualization */}
                    <GanttChart solution={solution} stepIndex={stepIndex} />

                    {/* Process Table */}
                    <Box
                        p="4"
                        bg={cardBg}
                        borderRadius="lg"
                        border={`2px solid ${borderColor}`}
                        mb="4"
                    >
                        <Text fontSize="lg" fontWeight="bold" color={textColor} mb="4" textAlign="center">
                            Process Scheduling Table
                        </Text>
                        
                        <Table.ScrollArea borderWidth="1px" maxW="xl" rounded="md" height="406px" mx="auto">
                            <Table.Root size="sm" stickyHeader showColumnBorder>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.ColumnHeader textAlign="center">
                                            PID
                                        </Table.ColumnHeader>
                                        <Table.ColumnHeader textAlign="center">
                                            Arrival Time
                                        </Table.ColumnHeader>
                                        <Table.ColumnHeader textAlign="center">
                                            Scheduled Time
                                        </Table.ColumnHeader>
                                        <Table.ColumnHeader textAlign="center">
                                            End Time
                                        </Table.ColumnHeader>
                                        <Table.ColumnHeader textAlign="center">
                                            Waiting Time
                                        </Table.ColumnHeader>
                                        <Table.ColumnHeader textAlign="center">
                                            Turnaround Time
                                        </Table.ColumnHeader>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {graphicTable?.map((proc: any) => (
                                        <Table.Row key={proc.pid}>
                                            <Table.Cell textAlign="center">
                                                {proc.pid}
                                            </Table.Cell>
                                            <Table.Cell textAlign="center">
                                                {proc.arrival ?? "NONE"}
                                            </Table.Cell>
                                            <Table.Cell textAlign="center">
                                                {proc.scheduledTime ?? "NONE"}
                                            </Table.Cell>
                                            <Table.Cell textAlign="center">
                                                {proc.endTime ?? "NONE"}
                                            </Table.Cell>
                                            <Table.Cell textAlign="center">
                                                {proc.waitingTime ?? "NONE"}
                                            </Table.Cell>
                                            <Table.Cell textAlign="center">
                                                {proc.turnaroundTime ?? "NONE"}
                                            </Table.Cell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table.Root>
                        </Table.ScrollArea>
                    </Box>

                    {/* Navigation Controls */}
                    <Flex
                        gap="3"
                        justify="center"
                        align="center"
                        wrap="wrap"
                        mb="4"
                    >
                        <IconButton
                            aria-label="Start"
                            onClick={() => handleStepChange("start")}
                            size="sm"
                            {...btnStyle}
                        >
                            <LuChevronsLeft />
                        </IconButton>
                        <IconButton
                            aria-label="Previous"
                            onClick={() => handleStepChange("prev")}
                            size="sm"
                            {...btnStyle}
                        >
                            <LuChevronLeft />
                        </IconButton>
                        <IconButton
                            aria-label="Next"
                            onClick={() => handleStepChange("next")}
                            size="sm"
                            {...btnStyle}
                        >
                            <LuChevronRight />
                        </IconButton>
                        <IconButton
                            aria-label="End"
                            onClick={() => handleStepChange("end")}
                            size="sm"
                            {...btnStyle}
                        >
                            <LuChevronsRight />
                        </IconButton>
                    </Flex>

                    <Box textAlign="center">
                        <Button
                            onClick={onBack}
                            size="md"
                            {...btnStyle}
                        >
                            <LuArrowLeft /> Back to Configuration
                        </Button>
                    </Box>
                </Box>

                {/* Step Information Panel */}
                <Flex direction="column" gap="4" minW="300px">
                    {/* Step Details */}
                    <Box
                        p="4"
                        bg={cardBg}
                        borderRadius="lg"
                        border={`2px solid ${borderColor}`}
                        minH="200px"
                    >
                        <Text fontSize="lg" fontWeight="bold" color={textColor} mb="3">
                            Step {stepIndex + 1} / {solutionLength}
                        </Text>
                        <Text
                            color={subtextColor}
                            fontSize="sm"
                            whiteSpace="pre-line"
                            lineHeight="1.5"
                        >
                            {explaination || "No explanation available."}
                        </Text>
                    </Box>

                    {/* Current Step Info */}
                    <Box
                        p="4"
                        bg={cardBg}
                        borderRadius="lg"
                        border={`2px solid ${borderColor}`}
                    >
                        <Text fontSize="lg" fontWeight="bold" color={textColor} mb="3">
                            Current Step Info
                        </Text>
                        
                        <Text color={textColor} mb="2">
                            <strong>Timer:</strong>
                            {timerInfo !== undefined
                                ? ` ${timerInfo}`
                                : " No timer information available."}
                        </Text>
                        
                        <Text color={textColor} mb="2">
                            <strong>Ready Queues:</strong>
                            {Array.isArray(readyQueue) && readyQueue.length > 0 ? (
                                <Box mt="1">
                                    {readyQueue.map((queue: any, idx: number) => (
                                        <Text key={idx} fontSize="sm" color={subtextColor}>
                                            Queue {idx + 1}: {Array.isArray(queue) && queue.length > 0
                                                ? queue.join(", ")
                                                : "(empty)"}
                                        </Text>
                                    ))}
                                </Box>
                            ) : (
                                " No ready queue information available."
                            )}
                        </Text>

                        <Text color={textColor} mb="2">
                            <strong>Wait Queue:</strong>
                            {Array.isArray(waitQueue) && waitQueue.length > 0
                                ? ` ${waitQueue.join(", ")}`
                                : " (empty)"}
                        </Text>
                        
                        <Text color={textColor}>
                            <strong>New Queue:</strong>
                            {Array.isArray(newQueue) && newQueue.length > 0
                                ? ` ${newQueue.join(", ")}`
                                : " (empty)"}
                        </Text>
                    </Box>

                    {/* Overall Statistics */}
                    <Box
                        p="4"
                        bg={cardBg}
                        borderRadius="lg"
                        border={`2px solid ${borderColor}`}
                    >
                        <Text fontSize="lg" fontWeight="bold" color={textColor} mb="3">
                            Performance Metrics
                        </Text>
                        
                        <Text color={textColor} mb="2">
                            <strong>Algorithm:</strong> {solution.data.algorithm}
                        </Text>
                        
                        <Text color={textColor} mb="2">
                            <strong>Total Processes:</strong> {solution.data.processes}
                        </Text>
                        
                        <Text color={textColor} mb="2">
                            <strong>Average Waiting Time:</strong> {solution.data.metrics.averageWaitingTime}
                        </Text>
                        
                        <Text color={textColor} mb="2">
                            <strong>Average Turnaround Time:</strong> {solution.data.metrics.averageTurnaroundTime}
                        </Text>
                        
                        <Text color={textColor} mb="2">
                            <strong>CPU Utilization:</strong> {solution.data.metrics.cpuUtilization}%
                        </Text>
                        
                        <Text color={textColor}>
                            <strong>Throughput:</strong> {solution.data.metrics.throughput}
                        </Text>
                    </Box>
                </Flex>
            </Flex>
        </Flex>
    );
}
