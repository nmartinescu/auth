import { Button, IconButton, Flex, Box, Text, Table } from "@chakra-ui/react";
import {
    LuChevronRight,
    LuChevronsRight,
    LuChevronsLeft,
    LuChevronLeft,
    LuArrowLeft,
} from "react-icons/lu";
import { useEffect, useState } from "react";
import MemoryChart from "./MemoryChart";

interface SolutionDisplayProps {
    chartData: any[];
    setChartData: (data: any) => void;
    customData: any[];
    type: string;
}

const boxStyles = {
    border: "1px solid",
    borderColor: "gray.200",
    borderRadius: "md",
    bg: "gray.50",
    textAlign: "center" as const,
    minH: "80px",
    boxShadow: "2px 2px 1px rgba(0, 0, 0, 0.3)",
};

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

export default function SolutionDisplay({
    chartData,
    setChartData,
    customData,
    type,
}: SolutionDisplayProps) {
    const [stepIndex, setStepIndex] = useState(0);
    const [currentSequence, setCurrentSequence] = useState<any[]>([]);

    // Add safety checks for null/undefined data
    const safeChartData = chartData || [];
    const safeCustomData = customData || [];

    useEffect(() => {
        if (safeChartData.length === 0) return;
        const index = Math.min(stepIndex, safeChartData.length - 1);
        setCurrentSequence(safeChartData.slice(0, index + 1));
    }, [stepIndex, safeChartData, safeCustomData]);

    const handleStepChange = (action: "next" | "prev" | "start" | "end") => {
        setStepIndex((prev) => {
            if (action === "next")
                return Math.min(prev + 1, safeCustomData.length - 1);
            if (action === "prev") return Math.max(prev - 1, 0);
            if (action === "start") return 0;
            if (action === "end") return Math.max(safeCustomData.length - 1, 0);
            return prev;
        });
    };

    const renderChart = () => {
        if (type === "memory") {
            return (
                <MemoryChart
                    memoryData={currentSequence}
                    columns={safeChartData[0]?.length || 1}
                />
            );
        }
        return <Text>Unsupported chart type</Text>;
    };

    const currentStep = safeCustomData[stepIndex] || {};

    return (
        <>
            <Flex
                wrap="wrap"
                gap="6"
                my="8"
                justify="center"
                align={{ base: "center", md: "flex-start" }}
                direction={{ base: "column", md: "row" }}
            >
                <Box flex="1" maxW="900px">
                    {renderChart()}

                    <Flex
                        my="6"
                        gap="3"
                        justify="center"
                        align="center"
                        wrap="wrap"
                        direction={["column", "row"]}
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
                </Box>

                <Flex direction="column" align="center" mt="8">
                    <Box
                        w="280px"
                        h="280px"
                        p="4"
                        mb="4"
                        {...boxStyles}
                        display="flex"
                        flexDirection="column"
                        textAlign="left"
                    >
                        <Text mb="2">
                            Step {stepIndex + 1} / {safeCustomData.length}
                        </Text>
                        <Text
                            color="gray.600"
                            fontSize="sm"
                            whiteSpace="pre-line"
                            overflowY="auto"
                            flex="1"
                        >
                            {currentStep.explaination ||
                                "No explanation available."}
                        </Text>
                        <Button
                            mt="auto"
                            w="100%"
                            onClick={() => setChartData(null)}
                            size="sm"
                            {...btnStyle}
                        >
                            <LuArrowLeft /> Back to Form
                        </Button>
                    </Box>

                    <Box w="280px" p="3" {...boxStyles} textAlign="left">
                        {currentStep.pageFault !== undefined && (
                            <Text>
                                <strong>Page Fault:</strong>{" "}
                                {currentStep.pageFault}
                            </Text>
                        )}
                        {currentStep.dataStructure && (
                            <Text>
                                <strong>Current Data Structure:</strong>{" "}
                                {currentStep.dataStructure.join(", ")}
                            </Text>
                        )}
                        {currentStep.totalPageFaults !== undefined && (
                            <Text>
                                <strong>Total Page Faults:</strong>{" "}
                                {currentStep.totalPageFaults}
                            </Text>
                        )}
                        {currentStep.hitRate !== undefined && (
                            <Text>
                                <strong>Hit Rate:</strong>{" "}
                                {(currentStep.hitRate * 100).toFixed(2)}%
                            </Text>
                        )}
                    </Box>
                </Flex>
            </Flex>
        </>
    );
}