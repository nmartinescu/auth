import { useState } from "react";
import {
    Flex,
    Stack,
    Table,
    Box,
    Text,
    NumberInput,
    Input,
} from "@chakra-ui/react";
import {
    LuPlus,
    LuPlay,
    LuTrash,
    LuRotateCcw,
    LuSave,
    LuSquarePen,
} from "react-icons/lu";
import { useColorModeValue } from "../ui/color-mode";
import {
    FormActionButtons,
    ActionButton,
    DeleteButton,
} from "../ui/FormActionButtons";
import CPUAlgorithmSelection from "./CPUAlgorithmSelection";
import type {
    ProcessData,
    ProcessStatFieldProps,
    ProcessRowProps,
} from "../../types/Process";

export function Process() {
    const [isEditMode, setIsEditMode] = useState(false);
    const [processes, setProcesses] = useState<ProcessData[]>([
        {
            arrivalTime: 0,
            burstTime: 1,
            io: "",
        },
    ]);
    const [processCount, setProcessCount] = useState(1);
    const [selectedAlgorithm, setSelectedAlgorithm] = useState("FCFS");
    const [quantum, setQuantum] = useState(2);

    // Color mode values
    const cardBg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("#E5E7EB", "#4A5568");
    const textColor = useColorModeValue("gray.800", "gray.100");
    const subtextColor = useColorModeValue("gray.600", "gray.300");
    const headerTextColor = useColorModeValue("gray.800", "gray.100");

    const updateProcess = (index: number, key: string, value: any) => {
        const updated = [...processes];
        (updated[index] as any)[key] = value;
        setProcesses(updated);
    };

    const addProcess = () => {
        setProcesses([...processes, { arrivalTime: 0, burstTime: 1, io: "" }]);
        setProcessCount(processCount + 1);
    };

    const deleteProcess = (index: number) => {
        setProcesses(processes.filter((_, i) => i !== index));
        setProcessCount(processCount - 1);
    };

    const handleReset = () => {
        const defaultProcesses: ProcessData[] = [
            {
                arrivalTime: 0,
                burstTime: 1,
                io: "",
            },
        ];
        setProcesses(defaultProcesses);
        setProcessCount(1);
        setIsEditMode(false);
    };

    const handleSave = () => {
        setIsEditMode(!isEditMode);
    };

    const onSubmit = async () => {
        try {
            console.log("🚀 Starting CPU scheduling simulation...");
            console.log("Input processes:", processes);

            // Prepare the data for the API
            const apiData = {
                algorithm: selectedAlgorithm,
                ...(selectedAlgorithm === "RR" && { quantum }), // Add quantum only for Round Robin
                processes: processes.map((process) => ({
                    arrivalTime: process.arrivalTime,
                    burstTime: process.burstTime,
                    io: process.io
                        ? typeof process.io === "string"
                            ? // Parse IO string if it's a string (simple format like "2:1,4:2")
                              process.io
                                  .split(",")
                                  .map((ioStr) => {
                                      const [start, duration] = ioStr
                                          .split(":")
                                          .map(Number);
                                      return {
                                          start: start || 0,
                                          duration: duration || 1,
                                      };
                                  })
                                  .filter(
                                      (io) =>
                                          !isNaN(io.start) &&
                                          !isNaN(io.duration)
                                  )
                            : // If it's already an array, use it as is
                              process.io
                        : [],
                })),
            };

            console.log("📤 Sending API request:", apiData);

            // Make the API call
            const response = await fetch("/api/cpu", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(apiData),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                console.log("✅ CPU Scheduling Result:", result);
                console.log("📊 Algorithm:", result.data.algorithm);
                console.log("🔢 Total Processes:", result.data.processes);
                console.log("📈 Performance Metrics:", result.data.metrics);
                console.log("🎯 Simulation Steps:", result.data.solution);

                // Show a brief summary in the console
                console.log("\n📋 SIMULATION SUMMARY:");
                console.log(`Algorithm: ${result.data.algorithm}`);
                console.log(`Processes: ${result.data.processes}`);
                console.log(
                    `Average Waiting Time: ${result.data.metrics.averageWaitingTime}`
                );
                console.log(
                    `Average Turnaround Time: ${result.data.metrics.averageTurnaroundTime}`
                );
                console.log(
                    `CPU Utilization: ${result.data.metrics.cpuUtilization}%`
                );
                console.log(`Throughput: ${result.data.metrics.throughput}`);
            } else {
                console.error(
                    "❌ API Error:",
                    result.message || "Unknown error"
                );
                console.error("Full response:", result);
            }
        } catch (error) {
            console.error("❌ Network Error:", error);
            console.error("Failed to connect to the CPU scheduling API");
        }
    };

    return (
        <Flex
            maxW="1200px"
            w="90%"
            mx="auto"
            flexDirection="column"
            gap="10"
            mt="10"
        >
            {/* Header */}
            <Box textAlign="center">
                <Text fontSize="3xl" fontWeight="bold" color={textColor} mb="2">
                    Process Management Simulator
                </Text>
                <Text fontSize="lg" color={subtextColor}>
                    Manage and monitor system processes
                </Text>
            </Box>

            <Flex
                direction={{ base: "column", md: "row" }}
                justify="space-between"
                align="flex-start"
                gap="4"
                w="100%"
            >
                {/* Configuration Panel */}
                <Flex
                    p="6"
                    w="100%"
                    maxW="600px"
                    borderBottom={`5px solid ${borderColor}`}
                    borderRight={`5px solid ${borderColor}`}
                    borderRadius="lg"
                    bg={cardBg}
                    flexDirection="column"
                    gap="4"
                >
                    {/* Algorithm Selection */}
                    <CPUAlgorithmSelection
                        selectedAlgorithm={selectedAlgorithm}
                        onAlgorithmChange={setSelectedAlgorithm}
                        quantum={quantum}
                        onQuantumChange={setQuantum}
                        isEditMode={isEditMode}
                    />

                    {/* Stats Display */}
                    <Stack gap="4">
                        <ProcessStatField
                            label="Total Processes:"
                            value={processCount.toString()}
                            // isEditMode={isEditMode}
                            textColor={textColor}
                            subtextColor={subtextColor}
                            borderColor={borderColor}
                        />
                    </Stack>

                    {/* Action Buttons */}
                    <FormActionButtons
                        onReset={handleReset}
                        onEdit={handleSave}
                        isEditMode={isEditMode}
                        resetIcon={<LuRotateCcw />}
                        editIcon={<LuSquarePen />}
                        saveIcon={<LuSave />}
                    />
                </Flex>

                {/* Process Table */}
                <Stack w="100%" maxW="500px" gap="4">
                    <Table.Root
                        variant="outline"
                        size="sm"
                        showColumnBorder
                        interactive
                        boxShadow={`2px 2px ${borderColor}`}
                        borderRadius="lg"
                        bg={cardBg}
                    >
                        <Table.ColumnGroup>
                            <Table.Column htmlWidth="20%" />
                            <Table.Column htmlWidth="20%" />
                            <Table.Column htmlWidth="20%" />
                            <Table.Column htmlWidth="20%" />
                            <Table.Column />
                        </Table.ColumnGroup>

                        <Table.Header>
                            <Table.Row
                                bg={useColorModeValue("gray.100", "gray.700")}
                            >
                                <Table.ColumnHeader
                                    textAlign="center"
                                    color={headerTextColor}
                                    fontWeight="bold"
                                >
                                    PID #
                                </Table.ColumnHeader>
                                <Table.ColumnHeader
                                    textAlign="center"
                                    color={headerTextColor}
                                    fontWeight="bold"
                                >
                                    Arrival Time
                                </Table.ColumnHeader>
                                <Table.ColumnHeader
                                    textAlign="center"
                                    color={headerTextColor}
                                    fontWeight="bold"
                                >
                                    Burst Time
                                </Table.ColumnHeader>
                                <Table.ColumnHeader
                                    textAlign="center"
                                    color={headerTextColor}
                                    fontWeight="bold"
                                >
                                    I/O
                                </Table.ColumnHeader>
                                {isEditMode && (
                                    <Table.ColumnHeader
                                        color={headerTextColor}
                                        fontWeight="bold"
                                    >
                                        Actions
                                    </Table.ColumnHeader>
                                )}
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {processes.map((value, index) => (
                                <ProcessRow
                                    key={index}
                                    index={index}
                                    value={value}
                                    updateProcess={updateProcess}
                                    onDelete={deleteProcess}
                                    isEditMode={isEditMode}
                                />
                            ))}
                        </Table.Body>
                    </Table.Root>

                    {isEditMode && (
                        <Box textAlign="right">
                            <ActionButton
                                onClick={addProcess}
                                icon={
                                    <>
                                        <LuPlus />
                                        Add Row
                                    </>
                                }
                                aria-label="Add new process row"
                            />
                        </Box>
                    )}

                    <Box textAlign="right" mb="4">
                        <ActionButton
                            onClick={onSubmit}
                            disabled={isEditMode}
                            icon={
                                <>
                                    <LuPlay />
                                    Start
                                </>
                            }
                            aria-label="Start process simulation"
                        />
                    </Box>
                </Stack>
            </Flex>
        </Flex>
    );
}

// Helper Components

function ProcessStatField({
    label,
    value,
    // isEditMode,
    textColor,
    subtextColor,
    borderColor,
}: ProcessStatFieldProps) {
    return (
        <Flex
            w="full"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`2px solid ${borderColor}`}
            borderTop={`2px solid ${borderColor}`}
            px="4"
            py="2"
        >
            <Text fontWeight="medium" color={subtextColor}>
                {label}
            </Text>
            <Text fontWeight="medium" color={textColor}>
                {value}
            </Text>
        </Flex>
    );
}

function ProcessRow({
    index,
    value,
    updateProcess,
    onDelete,
    isEditMode,
}: ProcessRowProps) {
    const tableRowHoverBg = useColorModeValue("gray.50", "gray.700");
    const cellTextColor = useColorModeValue("gray.800", "gray.100");

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

    return (
        <Table.Row _hover={{ bg: tableRowHoverBg }}>
            <Table.Cell textAlign="center">
                <Text color={cellTextColor}>{index + 1}</Text>
            </Table.Cell>
            <Table.Cell textAlign="center">
                {isEditMode ? (
                    <NumberInput.Root
                        value={value.arrivalTime.toString()}
                        onValueChange={(e) =>
                            updateProcess(
                                index,
                                "arrivalTime",
                                Number(e.value) || 0
                            )
                        }
                        min={0}
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
                        />
                    </NumberInput.Root>
                ) : (
                    <Text color={cellTextColor}>{value.arrivalTime}</Text>
                )}
            </Table.Cell>
            <Table.Cell textAlign="center">
                {isEditMode ? (
                    <NumberInput.Root
                        value={value.burstTime.toString()}
                        onValueChange={(e) =>
                            updateProcess(
                                index,
                                "burstTime",
                                Number(e.value) || 1
                            )
                        }
                        min={1}
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
                        />
                    </NumberInput.Root>
                ) : (
                    <Text color={cellTextColor}>{value.burstTime}</Text>
                )}
            </Table.Cell>
            <Table.Cell textAlign="center">
                {isEditMode ? (
                    <Input
                        value={value.io}
                        onChange={(e) =>
                            updateProcess(index, "io", e.target.value)
                        }
                        size="sm"
                        color={inputTextColor}
                        bg={inputBg}
                        borderColor={inputBorderColor}
                        _hover={{ bg: inputHoverBg }}
                        _focus={{
                            bg: inputFocusBg,
                            borderColor: focusBorderColor,
                            boxShadow: focusBoxShadow,
                        }}
                    />
                ) : (
                    <Text color={cellTextColor}>{value.io}</Text>
                )}
            </Table.Cell>
            {isEditMode && (
                <Table.Cell textAlign="center">
                    {index !== 0 && (
                        <DeleteButton
                            onClick={() => onDelete(index)}
                            icon={<LuTrash />}
                            aria-label="Delete process"
                        />
                    )}
                </Table.Cell>
            )}
        </Table.Row>
    );
}
