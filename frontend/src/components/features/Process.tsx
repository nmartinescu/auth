import { useState } from "react";
import {
    Flex,
    Stack,
    Table,
    Box,
    Button,
    Text,
    NumberInput,
    Input,
    IconButton,
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

    // Color mode values
    const cardBg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("#E5E7EB", "#4A5568");
    const textColor = useColorModeValue("gray.800", "gray.100");
    const subtextColor = useColorModeValue("gray.600", "gray.300");
    const headerTextColor = useColorModeValue("gray.800", "gray.100");
    const iconColor = useColorModeValue("gray.600", "gray.300");
    const buttonHoverBg = useColorModeValue("gray.50", "gray.700");

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

    const onSubmit = () => {
        // Submit logic will be implemented later
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
                    {/* Stats Display */}
                    <Stack gap="4">
                        <ProcessStatField
                            label="Total Processes:"
                            value={processCount.toString()}
                            isEditMode={isEditMode}
                            textColor={textColor}
                            subtextColor={subtextColor}
                            borderColor={borderColor}
                        />
                    </Stack>

                    {/* Action Buttons */}
                    <Flex justify="end" gap="2" mt="4">
                        <Button
                            variant="outline"
                            size="sm"
                            borderBottom={`3px solid ${borderColor}`}
                            borderRight={`3px solid ${borderColor}`}
                            onClick={handleReset}
                            color={iconColor}
                            _hover={{ bg: buttonHoverBg }}
                        >
                            <LuRotateCcw />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            borderBottom={`3px solid ${borderColor}`}
                            borderRight={`3px solid ${borderColor}`}
                            onClick={handleSave}
                            color={iconColor}
                            _hover={{ bg: buttonHoverBg }}
                        >
                            {isEditMode ? <LuSave /> : <LuSquarePen />}
                        </Button>
                    </Flex>
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
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={addProcess}
                                color={iconColor}
                                _hover={{ bg: buttonHoverBg }}
                            >
                                <LuPlus />
                                Add Row
                            </Button>
                        </Box>
                    )}

                    <Box textAlign="right" mb="4">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={onSubmit}
                            disabled={isEditMode}
                            color={iconColor}
                            _hover={{ bg: buttonHoverBg }}
                        >
                            <LuPlay />
                            Start
                        </Button>
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
    isEditMode,
    textColor,
    subtextColor,
    borderColor,
}: ProcessStatFieldProps) {
    return (
        <Flex
            w="full"
            flexDirection={isEditMode ? "column" : "row"}
            justifyContent={isEditMode ? "flex-start" : "space-between"}
            borderBottom={`2px solid ${borderColor}`}
            borderTop={`2px solid ${borderColor}`}
            px="4"
            py="2"
        >
            <Text fontWeight="medium" color={subtextColor} w="40%">
                {label}
            </Text>
            <Box w={isEditMode ? "100%" : "60%"}>
                <Text textAlign="right" fontWeight="medium" color={textColor}>
                    {value}
                </Text>
            </Box>
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

    const inputTextColor = useColorModeValue("gray.800", "white");
    const inputBg = useColorModeValue("gray.50", "gray.700");

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
                        <NumberInput.Input />
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
                        <NumberInput.Input />
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
                    />
                ) : (
                    <Text color={cellTextColor}>{value.io}</Text>
                )}
            </Table.Cell>
            {isEditMode && (
                <Table.Cell textAlign="center">
                    {index !== 0 && (
                        <IconButton
                            size="sm"
                            variant="ghost"
                            onClick={() => onDelete(index)}
                            aria-label="Delete process"
                            color={useColorModeValue("red.600", "red.300")}
                            _hover={{
                                bg: useColorModeValue("red.50", "red.900"),
                            }}
                        >
                            <LuTrash />
                        </IconButton>
                    )}
                </Table.Cell>
            )}
        </Table.Row>
    );
}
