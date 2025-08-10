import { Flex, Text, Box, NumberInput } from "@chakra-ui/react";
import { useCallback } from "react";
import { useColorModeValue } from "../ui/color-mode";

interface Algorithm {
    value: string;
    label: string;
    description: string;
    requiresQuantum?: boolean;
}

interface CPUAlgorithmSelectionProps {
    selectedAlgorithm: string;
    onAlgorithmChange: (algorithm: string) => void;
    quantum?: number;
    onQuantumChange?: (quantum: number) => void;
    isEditMode?: boolean;
}

const algorithms: Algorithm[] = [
    {
        value: "FCFS",
        label: "First Come First Served (FCFS)",
        description: "Non-preemptive scheduling based on arrival time",
        requiresQuantum: false,
    },
    {
        value: "SJF",
        label: "Shortest Job First (SJF)",
        description: "Non-preemptive scheduling based on burst time",
        requiresQuantum: false,
    },
    {
        value: "RR",
        label: "Round Robin (RR)",
        description: "Preemptive scheduling with time quantum",
        requiresQuantum: true,
    },
];

export default function CPUAlgorithmSelection({
    selectedAlgorithm,
    onAlgorithmChange,
    quantum = 2,
    onQuantumChange,
    isEditMode = false,
}: CPUAlgorithmSelectionProps) {
    const textColor = useColorModeValue("gray.800", "gray.100");
    const subtextColor = useColorModeValue("gray.600", "gray.300");
    const borderColor = useColorModeValue("#E5E7EB", "#4A5568");

    // All color mode values must be called at the top level
    const selectBgColor = useColorModeValue("white", "gray.800");
    const quantumBgColor = useColorModeValue("blue.50", "blue.900");
    const descriptionBgColor = useColorModeValue("gray.50", "gray.700");

    // Input styling to match project patterns
    const inputTextColor = useColorModeValue("gray.800", "gray.800");
    const inputBg = useColorModeValue("gray.50", "gray.300");
    const inputBorderColor = useColorModeValue("gray.200", "gray.600");
    const inputFocusBg = useColorModeValue("white", "gray.200");
    const inputHoverBg = useColorModeValue("gray.100", "gray.250");
    const focusBorderColor = useColorModeValue("blue.500", "blue.300");
    const focusBoxShadow = useColorModeValue(
        "0 0 0 1px #3182ce",
        "0 0 0 1px #63b3ed"
    );

    const selectedAlgorithmData = algorithms.find(
        (alg) => alg.value === selectedAlgorithm
    );
    const requiresQuantum = selectedAlgorithmData?.requiresQuantum || false;

    const handleQuantumChange = useCallback(
        (details: any) => {
            const newQuantum = Number(details.value) || 1;
            onQuantumChange?.(newQuantum);
        },
        [onQuantumChange]
    );

    return (
        <Box w="full">
            {/* Combined Algorithm Selection and Quantum Input */}
            <Box
                borderBottom={`2px solid ${borderColor}`}
                borderTop={`2px solid ${borderColor}`}
                px="4"
                py="3"
                bg={requiresQuantum ? quantumBgColor : "transparent"}
            >
                {/* Algorithm Selection Row */}
                <Flex
                    align="center"
                    justify="space-between"
                    gap={4}
                    direction={{ base: "column", sm: "row" }}
                    w="full"
                    mb={requiresQuantum ? 3 : 0}
                >
                    <Text
                        fontWeight="medium"
                        color={subtextColor}
                        fontSize="sm"
                    >
                        Scheduling Algorithm:
                    </Text>

                    <Box position="relative" minW="200px">
                        <select
                            value={selectedAlgorithm}
                            onChange={(e) => onAlgorithmChange(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "8px 12px",
                                borderRadius: "6px",
                                border: `1px solid ${borderColor}`,
                                backgroundColor: selectBgColor,
                                color: textColor,
                                fontSize: "14px",
                                cursor: "pointer",
                            }}
                        >
                            {algorithms.map((alg) => (
                                <option key={alg.value} value={alg.value}>
                                    {alg.label}
                                </option>
                            ))}
                        </select>
                    </Box>
                </Flex>

                {/* Time Quantum Row - Inline when Round Robin is selected */}
                {requiresQuantum && (
                    <Flex
                        align="center"
                        justify="space-between"
                        gap={4}
                        direction={{ base: "column", sm: "row" }}
                        w="full"
                    >
                        <Text
                            fontWeight="medium"
                            color={subtextColor}
                            fontSize="sm"
                        >
                            Time Quantum:
                        </Text>

                        <Flex
                            align="center"
                            gap={2}
                            minW="200px"
                            justify="flex-end"
                        >
                            {isEditMode ? (
                                <NumberInput.Root
                                    value={quantum.toString()}
                                    onValueChange={handleQuantumChange}
                                    min={1}
                                    max={20}
                                    size="sm"
                                    w="80px"
                                    variant="subtle"
                                >
                                    <NumberInput.Control />
                                    <NumberInput.Input
                                        bg={inputBg}
                                        color={inputTextColor}
                                        borderColor={inputBorderColor}
                                        _hover={{ bg: inputHoverBg }}
                                        _focus={{
                                            bg: inputFocusBg,
                                            borderColor: focusBorderColor,
                                            boxShadow: focusBoxShadow,
                                        }}
                                        textAlign="center"
                                    />
                                </NumberInput.Root>
                            ) : (
                                <Text
                                    fontWeight="medium"
                                    color={textColor}
                                    fontSize="sm"
                                >
                                    {quantum}
                                </Text>
                            )}
                            <Text fontSize="sm" color={subtextColor}>
                                time units
                            </Text>
                        </Flex>
                    </Flex>
                )}
            </Box>

            {/* Algorithm Description */}
            {selectedAlgorithmData && (
                <Box
                    px="4"
                    py="3"
                    bg={descriptionBgColor}
                    borderBottom={`2px solid ${borderColor}`}
                >
                    <Text fontSize="xs" color={subtextColor} fontStyle="italic">
                        {selectedAlgorithmData.description}
                        {requiresQuantum && ` (Quantum: ${quantum} time units)`}
                    </Text>
                </Box>
            )}
        </Box>
    );
}
