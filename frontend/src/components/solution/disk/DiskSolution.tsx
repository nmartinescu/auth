import { useState, useEffect } from "react";
import {
    Box,
    Button,
    Flex,
    IconButton,
    Text,
    Table,
} from "@chakra-ui/react";
import {
    LuArrowLeft,
    LuChevronLeft,
    LuChevronRight,
    LuChevronsLeft,
    LuChevronsRight,
} from "react-icons/lu";
import { useColorModeValue } from "../../ui/color-mode";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface DiskSolutionProps {
    solution: any;
    onBack: () => void;
}

export default function DiskSolution({ solution, onBack }: DiskSolutionProps) {
    const [stepIndex, setStepIndex] = useState(0);
    const [currentSequence, setCurrentSequence] = useState<number[]>([]);

    // Color mode values
    const cardBg = useColorModeValue("white", "gray.800");
    const textColor = useColorModeValue("gray.800", "gray.100");
    const subtextColor = useColorModeValue("gray.600", "gray.300");
    const borderColor = useColorModeValue("#E5E7EB", "#4A5568");

    const { data } = solution;
    const { sequence, totalSeekTime, averageSeekTime, algorithm, initialHeadPosition, steps } = data;
    const safeSteps = steps || [];

    useEffect(() => {
        if (safeSteps.length === 0) return;
        const index = Math.min(stepIndex, safeSteps.length - 1);
        // Build sequence up to current step
        const currentStep = safeSteps[index];
        if (currentStep) {
            // Create sequence from initial position to current step
            const stepSequence = [initialHeadPosition];
            for (let i = 1; i <= index; i++) {
                if (safeSteps[i] && safeSteps[i].currentPosition !== undefined) {
                    stepSequence.push(safeSteps[i].currentPosition);
                }
            }
            setCurrentSequence(stepSequence);
        }
    }, [stepIndex, safeSteps, initialHeadPosition]);

    const handleStepChange = (action: "next" | "prev" | "start" | "end") => {
        setStepIndex((prev) => {
            if (action === "next")
                return Math.min(prev + 1, safeSteps.length - 1);
            if (action === "prev") return Math.max(prev - 1, 0);
            if (action === "start") return 0;
            if (action === "end") return Math.max(safeSteps.length - 1, 0);
            return prev;
        });
    };

    const currentStep = safeSteps[stepIndex] || {};

    // Prepare chart data for current step
    const chartData = {
        labels: currentSequence.map((_: any, index: number) => `Step ${index}`),
        datasets: [
            {
                label: "Head Position",
                data: currentSequence,
                borderColor: "rgb(59, 130, 246)",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                borderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                tension: 0.1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top" as const,
                labels: {
                    color: textColor,
                },
            },
            title: {
                display: true,
                text: `${algorithm.toUpperCase()} Disk Head Movement`,
                color: textColor,
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Time Steps",
                    color: textColor,
                },
                ticks: {
                    color: textColor,
                },
                grid: {
                    color: borderColor,
                },
            },
            y: {
                title: {
                    display: true,
                    text: "Track Number",
                    color: textColor,
                },
                ticks: {
                    color: textColor,
                },
                grid: {
                    color: borderColor,
                },
            },
        },
    };

    const btnStyle = {
        bg: useColorModeValue("white", "gray.700"),
        color: useColorModeValue("blue.500", "blue.300"),
        border: "1px solid",
        borderColor: useColorModeValue("blue.300", "blue.500"),
        boxShadow: "3px 3px 2px rgba(0, 0, 0, 0.3)",
        _hover: { bg: useColorModeValue("blue.50", "gray.600") },
        _active: {
            bg: useColorModeValue("blue.100", "gray.500"),
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
            pb="10"
        >
            {/* Header */}
            <Box textAlign="center">
                <Text fontSize="3xl" fontWeight="bold" color={textColor} mb="2">
                    Disk Scheduling Results
                </Text>
                <Text fontSize="lg" color={subtextColor}>
                    Algorithm: {algorithm.toUpperCase()} | Total Seek Time: {totalSeekTime} | 
                    Average Seek Time: {averageSeekTime.toFixed(2)} | 
                    Initial Head Position: {initialHeadPosition}
                </Text>
            </Box>

            <Flex
                direction={{ base: "column", lg: "row" }}
                gap="6"
                align="flex-start"
            >
                {/* Visualization Chart */}
                <Box flex="1" maxW="900px">
                    <Box
                        p="4"
                        bg={cardBg}
                        borderRadius="lg"
                        border={`2px solid ${borderColor}`}
                        mb="4"
                    >
                        <Text fontSize="lg" fontWeight="bold" color={textColor} mb="4" textAlign="center">
                            Disk Head Movement Visualization
                        </Text>
                        
                        <Box h="300px">
                            <Line data={chartData} options={chartOptions} />
                        </Box>
                    </Box>

                    {/* Sequence Table */}
                    <Box
                        p="4"
                        bg={cardBg}
                        borderRadius="lg"
                        border={`2px solid ${borderColor}`}
                        mb="4"
                    >
                        <Text fontSize="lg" fontWeight="bold" color={textColor} mb="4" textAlign="center">
                            Head Movement Sequence
                        </Text>
                        
                        <Table.ScrollArea borderWidth="1px" maxW="xl" rounded="md" height="200px" mx="auto">
                            <Table.Root size="sm" stickyHeader>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.ColumnHeader textAlign="center" color={textColor}>
                                            Step
                                        </Table.ColumnHeader>
                                        <Table.ColumnHeader textAlign="center" color={textColor}>
                                            Head Position
                                        </Table.ColumnHeader>
                                        <Table.ColumnHeader textAlign="center" color={textColor}>
                                            Seek Distance
                                        </Table.ColumnHeader>
                                        <Table.ColumnHeader textAlign="center" color={textColor}>
                                            Total Seek Time
                                        </Table.ColumnHeader>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {currentSequence.map((position: number, index: number) => {
                                        const stepData = safeSteps[index] || {};
                                        return (
                                            <Table.Row key={index}>
                                                <Table.Cell textAlign="center" color={textColor}>
                                                    {index === 0 ? "Initial" : index}
                                                </Table.Cell>
                                                <Table.Cell textAlign="center" color={textColor}>
                                                    {position}
                                                </Table.Cell>
                                                <Table.Cell textAlign="center" color={textColor}>
                                                    {stepData.seekDistance !== undefined ? stepData.seekDistance : "-"}
                                                </Table.Cell>
                                                <Table.Cell textAlign="center" color={textColor}>
                                                    {stepData.totalSeekTime !== undefined ? stepData.totalSeekTime : "0"}
                                                </Table.Cell>
                                            </Table.Row>
                                        );
                                    })}
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
                            Step {stepIndex + 1} / {safeSteps.length}
                        </Text>
                        <Text
                            color={subtextColor}
                            fontSize="sm"
                            whiteSpace="pre-line"
                            lineHeight="1.5"
                        >
                            {currentStep.explanation || "No explanation available."}
                        </Text>
                    </Box>

                    {/* Current Step Stats */}
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
                            <strong>Current Position:</strong> {currentStep.currentPosition !== undefined ? currentStep.currentPosition : "N/A"}
                        </Text>
                        
                        <Text color={textColor} mb="2">
                            <strong>Seek Distance:</strong> {currentStep.seekDistance !== undefined ? currentStep.seekDistance : "0"}
                        </Text>
                        
                        <Text color={textColor} mb="2">
                            <strong>Total Seek Time:</strong> {currentStep.totalSeekTime !== undefined ? currentStep.totalSeekTime : "0"}
                        </Text>
                        
                        {currentStep.remainingRequests && currentStep.remainingRequests.length > 0 && (
                            <Text color={textColor}>
                                <strong>Remaining Requests:</strong> [{currentStep.remainingRequests.join(", ")}]
                            </Text>
                        )}
                    </Box>

                    {/* Overall Statistics */}
                    <Box
                        p="4"
                        bg={cardBg}
                        borderRadius="lg"
                        border={`2px solid ${borderColor}`}
                    >
                        <Text fontSize="lg" fontWeight="bold" color={textColor} mb="3">
                            Final Statistics
                        </Text>
                        
                        <Text color={textColor} mb="2">
                            <strong>Algorithm:</strong> {algorithm.toUpperCase()}
                        </Text>
                        
                        <Text color={textColor} mb="2">
                            <strong>Initial Head Position:</strong> {initialHeadPosition}
                        </Text>
                        
                        <Text color={textColor} mb="2">
                            <strong>Total Requests:</strong> {data.requests?.length || sequence.length - 1}
                        </Text>
                        
                        <Text color={textColor} mb="2">
                            <strong>Total Seek Time:</strong> {totalSeekTime}
                        </Text>
                        
                        <Text color={textColor}>
                            <strong>Average Seek Time:</strong> {averageSeekTime.toFixed(2)}
                        </Text>
                    </Box>
                </Flex>
            </Flex>
        </Flex>
    );
}