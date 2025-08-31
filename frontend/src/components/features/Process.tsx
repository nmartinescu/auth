import { useState, useEffect } from "react";
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
import {
    SelectContent,
    SelectItem,
    SelectRoot,
    SelectTrigger,
    SelectValueText,
} from "@chakra-ui/react";
import { createListCollection } from "@chakra-ui/react";
import type {
    ProcessData,
    ProcessRowProps,
    ProcessSimulationData,
} from "../../types/Process";
import ProcessSolution from "../solution/process/ProcessSolution";
import ActionModal from "../ui/ActionModal";
import { isAuthenticated } from "../../utils/auth";

const CPU_ALGORITHMS = [
    {
        label: "FCFS",
        value: "FCFS",
        description: "First Come First Served - Non-preemptive scheduling based on arrival time",
    },
    {
        label: "SJF",
        value: "SJF", 
        description: "Shortest Job First - Non-preemptive scheduling based on burst time",
    },
    {
        label: "RR",
        value: "RR",
        description: "Round Robin - Preemptive scheduling with time quantum",
    },
    {
        label: "STCF",
        value: "STCF",
        description: "Shortest Time to Completion First - Preemptive scheduling based on shortest remaining time",
    },
    {
        label: "MLFQ",
        value: "MLFQ",
        description: "Multi-Level Feedback Queue - Multiple priority queues with different quantums",
    },
];

const algorithmOptions = createListCollection({ items: CPU_ALGORITHMS });

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
    const [mlfqQueues, setMlfqQueues] = useState(3);
    const [mlfqQuantums, setMlfqQuantums] = useState("2,4,8");
    const [mlfqAllotment, setMlfqAllotment] = useState(20);
    const [solution, setSolution] = useState(null);

    // Color mode values - MUST be called before any conditional returns
    const cardBg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("#E5E7EB", "#4A5568");
    const textColor = useColorModeValue("gray.800", "gray.100");
    const subtextColor = useColorModeValue("gray.600", "gray.300");
    const headerTextColor = useColorModeValue("gray.800", "gray.100");
    const tableHeaderBg = useColorModeValue("gray.100", "gray.700");
    const algorithmBoxBg = useColorModeValue("gray.50", "gray.700");
    const quantumBoxBg = useColorModeValue("blue.50", "blue.900");
    const statsBoxBg = useColorModeValue("gray.50", "gray.700");

    // Check for simulation data in URL parameters on component mount
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const loadData = urlParams.get('loadData');
        
        if (loadData) {
            try {
                const simulationData: ProcessSimulationData = JSON.parse(decodeURIComponent(loadData));
                
                // Load the simulation data into the component state
                if (simulationData.processes) {
                    setProcesses(simulationData.processes);
                    setProcessCount(simulationData.processes.length);
                }
                if (simulationData.selectedAlgorithm) {
                    setSelectedAlgorithm(simulationData.selectedAlgorithm);
                }
                if (simulationData.quantum !== undefined) {
                    setQuantum(simulationData.quantum);
                }
                if (simulationData.mlfqQueues !== undefined) {
                    setMlfqQueues(simulationData.mlfqQueues);
                }
                if (simulationData.mlfqQuantums !== undefined) {
                    setMlfqQuantums(simulationData.mlfqQuantums);
                }
                if (simulationData.mlfqAllotment !== undefined) {
                    setMlfqAllotment(simulationData.mlfqAllotment);
                }
                
                // Clear the URL parameter after loading
                const newUrl = window.location.pathname;
                window.history.replaceState(null, '', newUrl);
                
                console.log("Loaded simulation data:", simulationData);
            } catch (error) {
                console.error("Error loading simulation data from URL:", error);
            }
        }
    }, []);

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
                ...(selectedAlgorithm === "MLFQ" && { 
                    queues: mlfqQueues,
                    quantums: mlfqQuantums.split(",").map(q => parseInt(q.trim())),
                    allotment: mlfqAllotment 
                }), // Add MLFQ parameters
                processes: processes.map((process) => ({
                    arrivalTime: process.arrivalTime,
                    burstTime: process.burstTime,
                    io: process.io && process.io.trim() !== ""
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
                setSolution(result);
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

    return solution ? (
        <ProcessSolution 
            solution={solution} 
            onBack={() => setSolution(null)} 
        />
    ) : (
        <Flex
            maxW="1200px"
            w="90%"
            mx="auto"
            flexDirection="column"
            gap="10"
            mt="10"
            pb="10"
        >
            {/* Header */}
            <Box textAlign="center">
                <Text fontSize="3xl" fontWeight="bold" color={textColor} mb="2">
                    Process Management Simulator
                </Text>
                <Text fontSize="lg" color={subtextColor}>
                    Simulate process scheduling algorithms
                </Text>
            </Box>

            <Flex
                direction={{ base: "column", lg: "row" }}
                justify="center"
                align="flex-start"
                gap="6"
                w="100%"
            >
                {/* Configuration Panel */}
                <Flex
                    p="6"
                    w="100%"
                    maxW="500px"
                    bg={cardBg}
                    borderRadius="lg"
                    boxShadow="md"
                    flexDirection="column"
                    gap="6"
                >
                    {/* Algorithm Selection */}
                    <Box p="4" bg={algorithmBoxBg} borderRadius="md">
                        <Text fontWeight="medium" color={subtextColor} mb="3">
                            Scheduling Algorithm:
                        </Text>
                        {isEditMode ? (
                            <SelectRoot
                                collection={algorithmOptions}
                                value={[selectedAlgorithm]}
                                onValueChange={(e) => setSelectedAlgorithm(e.value[0])}
                                size="md"
                                width="100%"
                                positioning={{ strategy: "absolute" }}
                            >
                                <SelectTrigger>
                                    <SelectValueText placeholder="Select algorithm" />
                                </SelectTrigger>
                                <SelectContent zIndex={1000}>
                                    {CPU_ALGORITHMS.map((algorithm) => (
                                        <SelectItem item={algorithm} key={algorithm.value}>
                                            {algorithm.label} - {algorithm.description}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </SelectRoot>
                        ) : (
                            <Text color={textColor} fontSize="lg">
                                {CPU_ALGORITHMS.find(alg => alg.value === selectedAlgorithm)?.label} - {CPU_ALGORITHMS.find(alg => alg.value === selectedAlgorithm)?.description}
                            </Text>
                        )}
                    </Box>

                    {/* Quantum Input (only for Round Robin) */}
                    {selectedAlgorithm === "RR" && (
                        <Box
                            p="4"
                            borderRadius="md"
                            bg={quantumBoxBg}
                        >
                            <Text fontWeight="medium" color={subtextColor} mb="3">
                                Time Quantum:
                            </Text>
                            {isEditMode ? (
                                <NumberInput.Root
                                    value={quantum.toString()}
                                    min={1}
                                    max={20}
                                    onValueChange={(e) => setQuantum(Number(e.value) || 1)}
                                >
                                    <NumberInput.Control />
                                    <NumberInput.Input />
                                </NumberInput.Root>
                            ) : (
                                <Text color={textColor} fontSize="lg">
                                    {quantum} time units
                                </Text>
                            )}
                        </Box>
                    )}

                    {/* MLFQ Configuration (only for MLFQ) */}
                    {selectedAlgorithm === "MLFQ" && (
                        <Box
                            p="4"
                            borderRadius="md"
                            bg={quantumBoxBg}
                        >
                            <Text fontWeight="medium" color={subtextColor} mb="3">
                                MLFQ Configuration:
                            </Text>
                            {isEditMode ? (
                                <Stack gap="3">
                                    <Box>
                                        <Text fontSize="sm" color={subtextColor} mb="1">
                                            Number of Queues:
                                        </Text>
                                        <NumberInput.Root
                                            value={mlfqQueues.toString()}
                                            min={2}
                                            max={5}
                                            onValueChange={(e) => {
                                                const newQueues = Number(e.value) || 3;
                                                setMlfqQueues(newQueues);
                                                // Update quantums to match queue count
                                                const currentQuantums = mlfqQuantums.split(',').map(q => q.trim());
                                                if (currentQuantums.length !== newQueues) {
                                                    const defaultQuantums = Array.from({length: newQueues}, (_, i) => Math.pow(2, i + 1));
                                                    setMlfqQuantums(defaultQuantums.join(','));
                                                }
                                            }}
                                        >
                                            <NumberInput.Control />
                                            <NumberInput.Input />
                                        </NumberInput.Root>
                                    </Box>
                                    <Box>
                                        <Text fontSize="sm" color={subtextColor} mb="1">
                                            Quantums (comma-separated):
                                        </Text>
                                        <Input
                                            value={mlfqQuantums}
                                            onChange={(e) => setMlfqQuantums(e.target.value)}
                                            placeholder="2,4,8"
                                            size="sm"
                                        />
                                    </Box>
                                    <Box>
                                        <Text fontSize="sm" color={subtextColor} mb="1">
                                            Allotment Time:
                                        </Text>
                                        <NumberInput.Root
                                            value={mlfqAllotment.toString()}
                                            min={5}
                                            max={100}
                                            onValueChange={(e) => setMlfqAllotment(Number(e.value) || 20)}
                                        >
                                            <NumberInput.Control />
                                            <NumberInput.Input />
                                        </NumberInput.Root>
                                    </Box>
                                </Stack>
                            ) : (
                                <Stack gap="1">
                                    <Text color={textColor} fontSize="sm">
                                        Queues: {mlfqQueues}
                                    </Text>
                                    <Text color={textColor} fontSize="sm">
                                        Quantums: [{mlfqQuantums}]
                                    </Text>
                                    <Text color={textColor} fontSize="sm">
                                        Allotment: {mlfqAllotment} time units
                                    </Text>
                                </Stack>
                            )}
                        </Box>
                    )}

                    {/* Stats Display */}
                    <Box
                        p="4"
                        borderRadius="md"
                        bg={statsBoxBg}
                    >
                        <Text fontWeight="medium" color={subtextColor} mb="1">
                            Configuration Summary:
                        </Text>
                        <Text color={textColor} fontSize="lg">
                            Total Processes: {processCount}
                        </Text>
                    </Box>

                    {/* Save/Restore Simulation Modal */}
                    <Box>
                        <ActionModal<ProcessSimulationData>
                            buttonText="Actions"
                            modalTitle="Process Simulation Actions"
                            filename="process-simulation.json"
                            simulationType="process"
                            exportDataCallback={() => ({
                                processes,
                                selectedAlgorithm,
                                ...(selectedAlgorithm === "RR" && { quantum }),
                                ...(selectedAlgorithm === "MLFQ" && { 
                                    mlfqQueues, 
                                    mlfqQuantums, 
                                    mlfqAllotment 
                                }),
                            })}
                            importDataCallback={(data) => {
                                setProcesses(data.processes);
                                setProcessCount(data.processes.length);
                                setSelectedAlgorithm(data.selectedAlgorithm);
                                if (data.quantum) setQuantum(data.quantum);
                                if (data.mlfqQueues !== undefined) setMlfqQueues(data.mlfqQueues);
                                if (data.mlfqQuantums) setMlfqQuantums(data.mlfqQuantums);
                                if (data.mlfqAllotment !== undefined) setMlfqAllotment(data.mlfqAllotment);
                            }}
                            // Check real authentication status
                            isLoggedIn={isAuthenticated()} 
                            onLoadFromAccount={() => console.log("Loading from account...")}
                        />
                    </Box>

                    {/* Action Buttons */}
                    <Stack gap="3">
                        <FormActionButtons
                            onReset={handleReset}
                            onEdit={handleSave}
                            isEditMode={isEditMode}
                            resetIcon={<LuRotateCcw />}
                            editIcon={<LuSquarePen />}
                            saveIcon={<LuSave />}
                        />

                        <ActionButton
                            onClick={onSubmit}
                            disabled={isEditMode}
                            icon={
                                <>
                                    <LuPlay />
                                    Start Simulation
                                </>
                            }
                            aria-label="Start process simulation"
                        />
                    </Stack>
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
                                bg={tableHeaderBg}
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


                </Stack>
            </Flex>
        </Flex>
    );
}

// Helper Components

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
