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
import { MEMORY_ALGORITHMS } from "../../config/memoryConstants";
import { createListCollection } from "@chakra-ui/react";
import MemorySolution from "../solution/memory/MemorySolution";
import ActionModal from "../ui/ActionModal";
import { isAuthenticated } from "../../utils/auth";

const algorithmOptions = createListCollection({ items: MEMORY_ALGORITHMS });

interface MemorySimulationData {
    selectedAlgorithm: string;
    frameCount: number;
    pageReferences: number[];
}

export function Memory() {
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedAlgorithm, setSelectedAlgorithm] = useState("fifo");
    const [frameCount, setFrameCount] = useState(3);
    const [pageReferences, setPageReferences] = useState<number[]>([1]);
    const [newPage, setNewPage] = useState(0);
    const [solution, setSolution] = useState(null);

    // Color mode values - ALL hooks must be called at the top level
    const cardBg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("#E5E7EB", "#4A5568");
    const textColor = useColorModeValue("gray.800", "gray.100");
    const subtextColor = useColorModeValue("gray.600", "gray.300");
    const algorithmBoxBg = useColorModeValue("gray.50", "gray.700");
    const frameCountBoxBg = useColorModeValue("gray.50", "gray.700");
    const pageReferencesBoxBg = useColorModeValue("gray.50", "gray.700");
    const pageReferencesInnerBg = useColorModeValue("white", "gray.600");
    const statsBoxBg = useColorModeValue("gray.50", "gray.700");

    // Check for simulation data in URL parameters on component mount
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const loadData = urlParams.get("loadData");

        if (loadData) {
            try {
                const simulationData: MemorySimulationData = JSON.parse(
                    decodeURIComponent(loadData)
                );

                if (simulationData.selectedAlgorithm) {
                    setSelectedAlgorithm(simulationData.selectedAlgorithm);
                }
                if (simulationData.frameCount) {
                    setFrameCount(simulationData.frameCount);
                }
                if (simulationData.pageReferences) {
                    setPageReferences(simulationData.pageReferences);
                }

                // Clear the URL parameter after loading
                const newUrl = window.location.pathname;
                window.history.replaceState(null, "", newUrl);

                console.log("Loaded memory simulation data:", simulationData);
            } catch (error) {
                console.error("Error loading simulation data from URL:", error);
            }
        }
    }, []);

    const handleReset = () => {
        setFrameCount(3);
        setPageReferences([1]);
        setSelectedAlgorithm("fifo");
        setIsEditMode(false);
    };

    const handleSave = () => {
        setIsEditMode(!isEditMode);
    };

    const addPage = () => {
        if (newPage >= 0) {
            setPageReferences([...pageReferences, newPage]);
            setNewPage(0);
        }
    };

    const removePage = (index: number) => {
        setPageReferences(pageReferences.filter((_, i) => i !== index));
    };

    const onSubmit = async () => {
        try {
            const body = {
                frameCount,
                selectedAlgorithm: [selectedAlgorithm],
                pageReferences,
            };
            console.log("🚀 Starting memory management simulation...");
            console.log("Input data:", body);

            const response = await fetch(`${API_BASE_URL}/api/memory`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setSolution(result);
                console.log("✅ Memory Management Result:", result);
            } else {
                console.error(
                    "❌ API Error:",
                    result.message || "Unknown error"
                );
            }
        } catch (error) {
            console.error("❌ Network Error:", error);
        }
    };

    return solution ? (
        <MemorySolution solution={solution} onBack={() => setSolution(null)} />
    ) : (
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
                    Memory Management Simulator
                </Text>
                <Text fontSize="lg" color={subtextColor}>
                    Simulate page replacement algorithms
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
                            Page Replacement Algorithm:
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
                                    {MEMORY_ALGORITHMS.map((algorithm) => (
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
                                    MEMORY_ALGORITHMS.find(
                                        (alg) => alg.value === selectedAlgorithm
                                    )?.label
                                }{" "}
                                -{" "}
                                {
                                    MEMORY_ALGORITHMS.find(
                                        (alg) => alg.value === selectedAlgorithm
                                    )?.description
                                }
                            </Text>
                        )}
                    </Box>

                    {/* Frame Count */}
                    <Box p="4" borderRadius="md" bg={frameCountBoxBg}>
                        <Text fontWeight="medium" color={subtextColor} mb="3">
                            Frame Count:
                        </Text>
                        {isEditMode ? (
                            <NumberInput.Root
                                value={frameCount.toString()}
                                min={1}
                                max={20}
                                onValueChange={(e) =>
                                    setFrameCount(Number(e.value) || 1)
                                }
                            >
                                <NumberInput.Control />
                                <NumberInput.Input color={textColor} />
                            </NumberInput.Root>
                        ) : (
                            <Text color={textColor} fontSize="lg">
                                {frameCount} frames
                            </Text>
                        )}
                    </Box>

                    {/* Page References */}
                    <Box p="4" borderRadius="md" bg={pageReferencesBoxBg}>
                        <Text fontWeight="medium" color={subtextColor} mb="3">
                            Page References:
                        </Text>
                        {isEditMode ? (
                            <Box
                                p="4"
                                borderRadius="xl"
                                bg={pageReferencesInnerBg}
                                border={`1px solid ${borderColor}`}
                                boxShadow="sm"
                            >
                                <Box maxH="120px" overflowY="auto" mb="3">
                                    <Wrap gap="2">
                                        {pageReferences.map((page, index) => (
                                            <Button
                                                key={index}
                                                size="xs"
                                                variant="outline"
                                                colorScheme="gray"
                                                borderRadius="full"
                                                onClick={() =>
                                                    removePage(index)
                                                }
                                            >
                                                {page} ✕
                                            </Button>
                                        ))}
                                    </Wrap>
                                </Box>

                                <Flex gap={2} align="center">
                                    <Box flex={1}>
                                        <NumberInput.Root
                                            value={newPage.toString()}
                                            onValueChange={(e) =>
                                                setNewPage(Number(e.value) || 0)
                                            }
                                            size="sm"
                                            min={0}
                                            max={100}
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
                                        onClick={addPage}
                                    >
                                        <LuPlus /> Add
                                    </Button>
                                </Flex>
                            </Box>
                        ) : (
                            <Text color={textColor} fontSize="lg">
                                {pageReferences.join(", ")}
                            </Text>
                        )}
                    </Box>

                    {/* Stats */}
                    <Box p="4" borderRadius="md" bg={statsBoxBg}>
                        <Text fontWeight="medium" color={subtextColor} mb="1">
                            Configuration Summary:
                        </Text>
                        <Text color={textColor} fontSize="lg">
                            Total Pages: {pageReferences.length}
                        </Text>
                        <Text color={textColor} fontSize="lg">
                            Memory Frames: {frameCount}
                        </Text>
                    </Box>

                    {/* Actions Modal */}
                    <Box>
                        <ActionModal<MemorySimulationData>
                            buttonText="Actions"
                            modalTitle="Memory Simulation Actions"
                            filename="memory-simulation.json"
                            simulationType="memory"
                            exportDataCallback={() => ({
                                selectedAlgorithm,
                                frameCount,
                                pageReferences,
                            })}
                            importDataCallback={(data) => {
                                setSelectedAlgorithm(data.selectedAlgorithm);
                                setFrameCount(data.frameCount);
                                setPageReferences(data.pageReferences);
                            }}
                            isLoggedIn={isAuthenticated()}
                            onLoadFromAccount={() =>
                                console.log("Loading from account...")
                            }
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
                            aria-label="Start memory management simulation"
                        />
                    </Stack>
                </Flex>
            </Flex>
        </Flex>
    );
}
