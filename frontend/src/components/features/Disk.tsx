import { useState, useEffect } from "react";
import {
    Flex,
    Stack,
    Box,
    Text,
    NumberInput,
    Button,
    Wrap,
    SelectContent,
    SelectItem,
    SelectRoot,
    SelectTrigger,
    SelectValueText,
} from "@chakra-ui/react";
import {
    LuPlus,
    LuPlay,
    LuRotateCcw,
    LuSave,
    LuSquarePen,
} from "react-icons/lu";
import { useColorModeValue } from "../ui/color-mode";
import { FormActionButtons, ActionButton } from "../ui/FormActionButtons";
import { API_BASE_URL } from "../../config/constants";
import { DISK_ALGORITHMS, HEAD_DIRECTIONS, algorithmOptions, directionOptions } from "../../config/diskConstants";
import DiskSolution from "../solution/disk/DiskSolution";
import ActionModal from "../ui/ActionModal";
import { isAuthenticated } from "../../utils/auth";

interface DiskSimulationData {
    selectedAlgorithm: string;
    maxDiskSize: number;
    initialHeadPosition: number;
    headDirection: string;
    requests: number[];
}

export function Disk() {
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedAlgorithm, setSelectedAlgorithm] = useState("fcfs");
    const [maxDiskSize, setMaxDiskSize] = useState(200);
    const [initialHeadPosition, setInitialHeadPosition] = useState(50);
    const [headDirection, setHeadDirection] = useState("right");
    const [requests, setRequests] = useState<number[]>([98, 183, 37, 122, 14, 124, 65, 67]);
    const [newRequest, setNewRequest] = useState(0);
    const [solution, setSolution] = useState(null);

    // Color mode values
    const cardBg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("#E5E7EB", "#4A5568");
    const textColor = useColorModeValue("gray.800", "gray.100");
    const subtextColor = useColorModeValue("gray.600", "gray.300");
    const algorithmBoxBg = useColorModeValue("gray.50", "gray.700");
    const configBoxBg = useColorModeValue("gray.50", "gray.700");
    const requestsBoxBg = useColorModeValue("gray.50", "gray.700");
    const requestsInnerBg = useColorModeValue("white", "gray.600");
    const statsBoxBg = useColorModeValue("gray.50", "gray.700");

    // Check for simulation data in URL parameters on component mount
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const loadData = urlParams.get("loadData");

        if (loadData) {
            try {
                const simulationData: DiskSimulationData = JSON.parse(
                    decodeURIComponent(loadData)
                );

                if (simulationData.selectedAlgorithm) {
                    setSelectedAlgorithm(simulationData.selectedAlgorithm);
                }
                if (simulationData.maxDiskSize) {
                    setMaxDiskSize(simulationData.maxDiskSize);
                }
                if (simulationData.initialHeadPosition !== undefined) {
                    setInitialHeadPosition(simulationData.initialHeadPosition);
                }
                if (simulationData.headDirection) {
                    setHeadDirection(simulationData.headDirection);
                }
                if (simulationData.requests) {
                    setRequests(simulationData.requests);
                }

                // Clear the URL parameter after loading
                const newUrl = window.location.pathname;
                window.history.replaceState(null, "", newUrl);

                console.log("Loaded disk simulation data:", simulationData);
            } catch (error) {
                console.error("Error loading simulation data from URL:", error);
            }
        }
    }, []);

    const handleReset = () => {
        setMaxDiskSize(200);
        setInitialHeadPosition(50);
        setHeadDirection("right");
        setRequests([98, 183, 37, 122, 14, 124, 65, 67]);
        setSelectedAlgorithm("fcfs");
        setIsEditMode(false);
    };

    const handleSave = () => {
        setIsEditMode(!isEditMode);
    };

    const addRequest = () => {
        if (newRequest >= 0 && newRequest <= maxDiskSize) {
            setRequests([...requests, newRequest]);
            setNewRequest(0);
        }
    };

    const removeRequest = (index: number) => {
        setRequests(requests.filter((_, i) => i !== index));
    };

    const onSubmit = async () => {
        try {
            const body = {
                maxDiskSize,
                initialHeadPosition,
                headDirection,
                algorithm: selectedAlgorithm,
                requests,
            };
            console.log("Starting disk scheduling simulation...");
            console.log("Input data:", body);

            const response = await fetch(`${API_BASE_URL}/api/disk`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setSolution(result);
                console.log("Disk Scheduling Result:", result);
            } else {
                console.error(
                    "API Error:",
                    result.message || "Unknown error"
                );
            }
        } catch (error) {
            console.error("Network Error:", error);
        }
    };

    return solution ? (
        <DiskSolution solution={solution} onBack={() => setSolution(null)} />
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
                    Disk Scheduling Simulator
                </Text>
                <Text fontSize="lg" color={subtextColor}>
                    Simulate disk head movement algorithms
                </Text>
            </Box>

            <Flex
                direction={{ base: "column", md: "row" }}
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
                            Disk Scheduling Algorithm:
                        </Text>
                        {isEditMode ? (
                            <SelectRoot
                                collection={algorithmOptions}
                                value={[selectedAlgorithm]}
                                onValueChange={(e) =>
                                    setSelectedAlgorithm(e.value[0])
                                }
                                size="md"
                                width="100%"
                                positioning={{ strategy: "absolute" }}
                            >
                                <SelectTrigger>
                                    <SelectValueText placeholder="Select algorithm" />
                                </SelectTrigger>
                                <SelectContent
                                    zIndex={1000}
                                    bg={cardBg}
                                    color={textColor}
                                >
                                    {DISK_ALGORITHMS.map((algorithm) => (
                                        <SelectItem
                                            item={algorithm}
                                            key={algorithm.value}
                                            color={textColor}
                                        >
                                            {algorithm.label} -{" "}
                                            {algorithm.description}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </SelectRoot>
                        ) : (
                            <Text color={textColor} fontSize="lg">
                                {
                                    DISK_ALGORITHMS.find(
                                        (alg) => alg.value === selectedAlgorithm
                                    )?.label
                                }{" "}
                                -{" "}
                                {
                                    DISK_ALGORITHMS.find(
                                        (alg) => alg.value === selectedAlgorithm
                                    )?.description
                                }
                            </Text>
                        )}
                    </Box>

                    {/* Disk Configuration */}
                    <Box p="4" borderRadius="md" bg={configBoxBg}>
                        <Text fontWeight="medium" color={subtextColor} mb="3">
                            Disk Configuration:
                        </Text>
                        {isEditMode ? (
                            <Stack gap="3">
                                <Box>
                                    <Text fontSize="sm" color={subtextColor} mb="1">
                                        Max Disk Size:
                                    </Text>
                                    <NumberInput.Root
                                        value={maxDiskSize.toString()}
                                        min={1}
                                        max={1000}
                                        onValueChange={(e) =>
                                            setMaxDiskSize(Number(e.value) || 1)
                                        }
                                    >
                                        <NumberInput.Control />
                                        <NumberInput.Input color={textColor} />
                                    </NumberInput.Root>
                                </Box>
                                <Box>
                                    <Text fontSize="sm" color={subtextColor} mb="1">
                                        Initial Head Position:
                                    </Text>
                                    <NumberInput.Root
                                        value={initialHeadPosition.toString()}
                                        min={0}
                                        max={maxDiskSize}
                                        onValueChange={(e) =>
                                            setInitialHeadPosition(Number(e.value) || 0)
                                        }
                                    >
                                        <NumberInput.Control />
                                        <NumberInput.Input color={textColor} />
                                    </NumberInput.Root>
                                </Box>
                                <Box>
                                    <Text fontSize="sm" color={subtextColor} mb="1">
                                        Head Direction:
                                    </Text>
                                    <SelectRoot
                                        collection={directionOptions}
                                        value={[headDirection]}
                                        onValueChange={(e) =>
                                            setHeadDirection(e.value[0])
                                        }
                                        size="md"
                                        width="100%"
                                        positioning={{ strategy: "absolute" }}
                                    >
                                        <SelectTrigger>
                                            <SelectValueText placeholder="Select direction" />
                                        </SelectTrigger>
                                        <SelectContent
                                            zIndex={1000}
                                            bg={cardBg}
                                            color={textColor}
                                        >
                                            {HEAD_DIRECTIONS.map((direction) => (
                                                <SelectItem
                                                    item={direction}
                                                    key={direction.value}
                                                    color={textColor}
                                                >
                                                    {direction.label} -{" "}
                                                    {direction.description}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </SelectRoot>
                                </Box>
                            </Stack>
                        ) : (
                            <Stack gap="1">
                                <Text color={textColor} fontSize="lg">
                                    Max Disk Size: {maxDiskSize}
                                </Text>
                                <Text color={textColor} fontSize="lg">
                                    Initial Head Position: {initialHeadPosition}
                                </Text>
                                <Text color={textColor} fontSize="lg">
                                    Head Direction: {
                                        HEAD_DIRECTIONS.find(
                                            (dir) => dir.value === headDirection
                                        )?.label
                                    }
                                </Text>
                            </Stack>
                        )}
                    </Box>

                    {/* Disk Requests */}
                    <Box p="4" borderRadius="md" bg={requestsBoxBg}>
                        <Text fontWeight="medium" color={subtextColor} mb="3">
                            Disk Requests:
                        </Text>
                        {isEditMode ? (
                            <Box
                                p="4"
                                borderRadius="xl"
                                bg={requestsInnerBg}
                                border={`1px solid ${borderColor}`}
                                boxShadow="sm"
                            >
                                <Box maxH="120px" overflowY="auto" mb="3">
                                    <Wrap gap="2">
                                        {requests.map((request, index) => (
                                            <Button
                                                key={index}
                                                size="xs"
                                                variant="outline"
                                                colorScheme="gray"
                                                borderRadius="full"
                                                onClick={() =>
                                                    removeRequest(index)
                                                }
                                            >
                                                {request} ×
                                            </Button>
                                        ))}
                                    </Wrap>
                                </Box>

                                <Flex gap={2} align="center">
                                    <Box flex={1}>
                                        <NumberInput.Root
                                            value={newRequest.toString()}
                                            onValueChange={(e) =>
                                                setNewRequest(Number(e.value) || 0)
                                            }
                                            size="sm"
                                            min={0}
                                            max={maxDiskSize}
                                        >
                                            <NumberInput.Control />
                                            <NumberInput.Input
                                                color={textColor}
                                            />
                                        </NumberInput.Root>
                                    </Box>
                                    <Button
                                        size="sm"
                                        colorScheme="blue"
                                        onClick={addRequest}
                                    >
                                        <LuPlus /> Add
                                    </Button>
                                </Flex>
                            </Box>
                        ) : (
                            <Text color={textColor} fontSize="lg">
                                {requests.join(", ")}
                            </Text>
                        )}
                    </Box>

                    {/* Stats */}
                    <Box p="4" borderRadius="md" bg={statsBoxBg}>
                        <Text fontWeight="medium" color={subtextColor} mb="1">
                            Configuration Summary:
                        </Text>
                        <Text color={textColor} fontSize="lg">
                            Total Requests: {requests.length}
                        </Text>
                        <Text color={textColor} fontSize="lg">
                            Disk Range: 0 - {maxDiskSize}
                        </Text>
                        <Text color={textColor} fontSize="lg">
                            Starting Position: {initialHeadPosition}
                        </Text>
                    </Box>

                    {/* Actions Modal */}
                    <Box>
                        <ActionModal<DiskSimulationData>
                            buttonText="Actions"
                            modalTitle="Disk Simulation Actions"
                            filename="disk-simulation.json"
                            simulationType="disk"
                            exportDataCallback={() => ({
                                selectedAlgorithm,
                                maxDiskSize,
                                initialHeadPosition,
                                headDirection,
                                requests,
                            })}
                            importDataCallback={(data) => {
                                setSelectedAlgorithm(data.selectedAlgorithm);
                                setMaxDiskSize(data.maxDiskSize);
                                setInitialHeadPosition(data.initialHeadPosition);
                                setHeadDirection(data.headDirection);
                                setRequests(data.requests);
                            }}
                            isLoggedIn={isAuthenticated()}
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
                            aria-label="Start disk scheduling simulation"
                        />
                    </Stack>
                </Flex>
            </Flex>
        </Flex>
    );
}