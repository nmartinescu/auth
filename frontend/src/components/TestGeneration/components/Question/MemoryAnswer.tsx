import { Box, Text, Input, VStack, Flex, Grid, GridItem } from "@chakra-ui/react";
import { useColorModeValue } from "../../../ui/color-mode";
import type { MemoryStepResult, MemoryTestSolution } from "../../types";

interface MemoryAnswerProps {
    memorySteps: MemoryStepResult[];
    frameCount: number;
    onMemoryStepsChange: (steps: MemoryStepResult[]) => void;
    reviewMode?: boolean;
    correctSolution?: MemoryTestSolution;
    userScore?: number;
}

const MemoryAnswer = ({
    memorySteps,
    frameCount,
    onMemoryStepsChange,
    reviewMode = false,
    correctSolution,
    userScore
}: MemoryAnswerProps) => {
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const headerBg = useColorModeValue("gray.50", "gray.700");
    const textColor = useColorModeValue("gray.600", "gray.300");
    const valueColor = useColorModeValue("blue.600", "blue.300");
    const primaryTextColor = useColorModeValue("gray.900", "white");
    const headerTextColor = useColorModeValue("gray.700", "gray.200");

    const handleMemoryFrameChange = (stepIndex: number, frameIndex: number, value: string) => {
        let numValue: number = 0;
        if (value !== '') {
            const parsed = parseInt(value);
            if (!isNaN(parsed) && parsed >= 0) {
                numValue = parsed;
            }
        }
        
        const updatedSteps = memorySteps.map((step, idx) => 
            idx === stepIndex 
                ? { 
                    ...step, 
                    frameState: step.frameState.map((frame, fIdx) => 
                        fIdx === frameIndex ? numValue : frame
                    )
                }
                : step
        );
        onMemoryStepsChange(updatedSteps);
    };

    const handlePageFaultChange = (stepIndex: number, isPageFault: boolean) => {
        const updatedSteps = memorySteps.map((step, idx) => 
            idx === stepIndex ? { ...step, pageFault: isPageFault } : step
        );
        onMemoryStepsChange(updatedSteps);
    };

    const totalPageFaults = memorySteps.filter(step => step.pageFault).length;
    const hitRate = memorySteps.length > 0 
        ? ((memorySteps.length - totalPageFaults) / memorySteps.length * 100).toFixed(1)
        : 0;

    return (
        <>
            {/* Memory Step-by-Step Table */}
            <Box border="1px" borderColor={borderColor} borderRadius="md" overflow="hidden">
                <Box overflowX="auto" maxW="100%">
                    {/* Header */}
                    <Grid 
                        templateColumns={`80px repeat(${frameCount}, 1fr) 100px`} 
                        bg={headerBg} 
                        minW={`${180 + frameCount * 80}px`}
                    >
                        <GridItem p={3} borderRight="1px" borderColor={borderColor}>
                            <Text fontWeight="semibold" color={headerTextColor}>Page Ref</Text>
                        </GridItem>
                        {Array.from({ length: frameCount }, (_, i) => (
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
                        const correctStep = reviewMode && correctSolution
                            ? correctSolution.stepResults[stepIndex]
                            : null;
                        
                        return (
                            <Grid 
                                key={stepIndex} 
                                templateColumns={`80px repeat(${frameCount}, 1fr) 100px`} 
                                borderTop="1px" 
                                borderColor={borderColor}
                                minW={`${180 + frameCount * 80}px`}
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
                                                    if (e.target.value === '' || isNaN(parseInt(e.target.value))) {
                                                        handleMemoryFrameChange(stepIndex, frameIndex, '0');
                                                    }
                                                }}
                                                size="sm"
                                                w="60px"
                                                min={0}
                                                placeholder="0"
                                                color={primaryTextColor}
                                                borderRadius="md"
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
                                            style={{ 
                                                transform: 'scale(1.3)',
                                                cursor: 'pointer'
                                            }}
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
                        <Text fontWeight="semibold" color={primaryTextColor} mb={1}>
                            Total Page Faults:
                        </Text>
                        <Text fontSize="lg" color={valueColor} fontWeight="semibold">
                            {totalPageFaults}
                        </Text>
                    </Box>
                    
                    <Box>
                        <Text fontWeight="semibold" color={primaryTextColor} mb={1}>
                            Total References:
                        </Text>
                        <Text fontSize="lg" color={valueColor} fontWeight="semibold">
                            {memorySteps.length}
                        </Text>
                    </Box>
                    
                    <Box>
                        <Text fontWeight="semibold" color={primaryTextColor} mb={1}>
                            Hit Rate:
                        </Text>
                        <Text fontSize="lg" color={valueColor} fontWeight="semibold">
                            {hitRate}%
                        </Text>
                    </Box>
                    
                    {reviewMode && userScore !== undefined && (
                        <Box>
                            <Text fontWeight="semibold" color={primaryTextColor} mb={1}>
                                Your Score:
                            </Text>
                            <Text 
                                fontSize="lg" 
                                color={userScore >= 80 ? "green.600" : userScore >= 60 ? "yellow.600" : "red.600"}
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

export default MemoryAnswer;
