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

interface MemorySolutionProps {
    solution: any;
    onBack: () => void;
}

export default function MemorySolution({ solution, onBack }: MemorySolutionProps) {
    const [stepIndex, setStepIndex] = useState(0);
    const [currentSequence, setCurrentSequence] = useState<any[]>([]);

    // Color mode values
    const cardBg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("#E5E7EB", "#4A5568");
    const textColor = useColorModeValue("gray.800", "gray.100");
    const subtextColor = useColorModeValue("gray.600", "gray.300");

    const safeFrames = solution?.frames || [];
    const safeCustomData = solution?.customData || [];

    useEffect(() => {
        if (safeFrames.length === 0) return;
        const index = Math.min(stepIndex, safeFrames.length - 1);
        setCurrentSequence(safeFrames.slice(0, index + 1));
    }, [stepIndex, safeFrames]);

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

    const currentStep = safeCustomData[stepIndex] || {};
    const frameCount = safeFrames[0]?.length || 0;

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
        >
            {/* Header */}
            <Box textAlign="center">
                <Text fontSize="3xl" fontWeight="bold" color={textColor} mb="2">
                    Memory Management Results
                </Text>
                <Text fontSize="lg" color={subtextColor}>
                    Algorithm: {solution?.algorithm} | Total Page Faults: {solution?.totalPageFaults} | Hit Rate: {solution?.hitRate}%
                </Text>
            </Box>

            <Flex
                direction={{ base: "column", lg: "row" }}
                gap="6"
                align="flex-start"
            >
                {/* Memory Chart */}
                <Box flex="1" maxW="900px">
                    <Box
                        p="4"
                        bg={cardBg}
                        borderRadius="lg"
                        border={`2px solid ${borderColor}`}
                        mb="4"
                    >
                        <Text fontSize="lg" fontWeight="bold" color={textColor} mb="4" textAlign="center">
                            Memory Frames Visualization
                        </Text>
                        
                        <Table.ScrollArea borderWidth="1px" maxW="xl" rounded="md" height="406px" mx="auto">
                            <Table.Root size="sm" stickyHeader>
                                <Table.Header>
                                    <Table.Row>
                                        {Array.from({ length: frameCount }, (_, colIndex) => (
                                            <Table.ColumnHeader key={colIndex} textAlign="center" color={textColor}>
                                                Frame {colIndex}
                                            </Table.ColumnHeader>
                                        ))}
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {currentSequence.map((row, rowIndex) => (
                                        <Table.Row key={rowIndex}>
                                            {row.map((cell: number, colIndex: number) => (
                                                <Table.Cell key={colIndex} textAlign="center" color={textColor}>
                                                    {cell === -1 ? "Empty" : cell}
                                                </Table.Cell>
                                            ))}
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
                            Step {stepIndex + 1} / {safeCustomData.length}
                        </Text>
                        <Text
                            color={subtextColor}
                            fontSize="sm"
                            whiteSpace="pre-line"
                            lineHeight="1.5"
                        >
                            {currentStep.explaination || "No explanation available."}
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
                        
                        {currentStep.page !== undefined && (
                            <Text color={textColor} mb="2">
                                <strong>Current Page:</strong> {currentStep.page}
                            </Text>
                        )}
                        
                        {currentStep.pageFault !== undefined && (
                            <Text color={textColor} mb="2">
                                <strong>Page Fault:</strong> {currentStep.pageFault ? "Yes" : "No"}
                            </Text>
                        )}
                        
                        {currentStep.totalPageFaults !== undefined && (
                            <Text color={textColor} mb="2">
                                <strong>Total Page Faults:</strong> {currentStep.totalPageFaults}
                            </Text>
                        )}
                        
                        {currentStep.hitRate !== undefined && (
                            <Text color={textColor} mb="2">
                                <strong>Hit Rate:</strong> {(currentStep.hitRate * 100).toFixed(2)}%
                            </Text>
                        )}
                        
                        {currentStep.dataStructure && currentStep.dataStructure.length > 0 && (
                            <Text color={textColor}>
                                <strong>Data Structure:</strong> {currentStep.dataStructure.join(", ")}
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
                            <strong>Algorithm:</strong> {solution?.algorithm}
                        </Text>
                        
                        <Text color={textColor} mb="2">
                            <strong>Frame Count:</strong> {solution?.frameCount}
                        </Text>
                        
                        <Text color={textColor} mb="2">
                            <strong>Total Pages:</strong> {solution?.pageReferences?.length || 0}
                        </Text>
                        
                        <Text color={textColor} mb="2">
                            <strong>Total Page Faults:</strong> {solution?.totalPageFaults}
                        </Text>
                        
                        <Text color={textColor}>
                            <strong>Final Hit Rate:</strong> {solution?.hitRate}%
                        </Text>
                    </Box>
                </Flex>
            </Flex>
        </Flex>
    );
}