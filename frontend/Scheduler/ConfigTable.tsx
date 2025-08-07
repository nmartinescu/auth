import { useContext, useMemo } from "react";
import { Stack, Table, Box, Button } from "@chakra-ui/react";
import { LuPlus, LuPlay } from "react-icons/lu";
import { SchedulerFormContext } from "@/context/Form/Scheduler/SchedulerFormContext";
import { AlgorithmSelectionContext } from "@/context/AlgorithmSelectionContext";
import RequestRow from "./RequestRow";
import ReadyQueueSection from "./ReadyQueueSection";

export default function ConfigTable() {
    const {
        isEditMode,
        onSubmit,
        processes,
        setProcessCount,
        setProcesses,
        processCount,
        setReadyQueuesCount,
        readyQueues,
        setReadyQueues,
    } = useContext(SchedulerFormContext);

    const { selectedAlgorithm } = useContext(AlgorithmSelectionContext);

    const updateProcess = (index: number, key: string, value: any) => {
        const updated = [...processes];
        updated[index][key] = value;
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

    const hasQuantum = useMemo(
        () => ["mlfq", "rr"].includes(selectedAlgorithm[0]),
        [selectedAlgorithm]
    );

    return (
        <Stack w="100%" maxW="500px" gap="4">
            <Table.Root
                variant="outline"
                size="sm"
                showColumnBorder
                interactive
                boxShadow="2px 2px #E5E7EB"
                borderRadius="lg"
            >
                <Table.ColumnGroup>
                    <Table.Column htmlWidth="20%" />
                    <Table.Column htmlWidth="20%" />
                    <Table.Column htmlWidth="20%" />
                    <Table.Column htmlWidth="20%" />
                    <Table.Column />
                </Table.ColumnGroup>

                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader textAlign="center">
                            PID #
                        </Table.ColumnHeader>
                        <Table.ColumnHeader textAlign="center">
                            Arrival Time
                        </Table.ColumnHeader>
                        <Table.ColumnHeader textAlign="center">
                            Burst Time
                        </Table.ColumnHeader>
                        <Table.ColumnHeader textAlign="center">
                            I/O
                        </Table.ColumnHeader>
                        {isEditMode && (
                            <Table.ColumnHeader>Actions</Table.ColumnHeader>
                        )}
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {processes.map((value, index) => (
                        <RequestRow
                            key={index}
                            index={index}
                            value={value}
                            updateProcess={updateProcess}
                            onDelete={deleteProcess}
                        />
                    ))}
                </Table.Body>
            </Table.Root>

            {isEditMode && (
                <Box textAlign="right">
                    <Button size="sm" variant="outline" onClick={addProcess}>
                        <LuPlus />
                        Add Row
                    </Button>
                </Box>
            )}

            {hasQuantum && (
                <ReadyQueueSection
                    readyQueues={readyQueues}
                    setReadyQueues={setReadyQueues}
                    setReadyQueuesCount={setReadyQueuesCount}
                    isEditMode={isEditMode}
                    selectedAlgorithm={selectedAlgorithm[0]}
                />
            )}

            <Box textAlign="right" mb="4">
                <Button
                    size="sm"
                    variant="outline"
                    onClick={onSubmit}
                    disabled={isEditMode}
                >
                    <LuPlay />
                    Start
                </Button>
            </Box>
        </Stack>
    );
}
