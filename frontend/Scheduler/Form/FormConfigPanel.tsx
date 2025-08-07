import { Button, Flex, NumberInput, Text } from "@chakra-ui/react";
import { useCallback, useContext } from "react";
import { LuRotateCcw, LuSave, LuSquarePen } from "react-icons/lu";
import { AlgorithmSelectionContext } from "@/context/AlgorithmSelectionContext";
import { SchedulerFormContext } from "@/context/Form/Scheduler/SchedulerFormContext";
import FieldLabel from "../FieldLabel";
import FormImportExport from "@/components/Form/FormImportExport";
import { SchedulerExportData } from "@/types/Scheduler/Scheduler";
import type { ButtonProps } from "@chakra-ui/react";

interface FormConfigPanelProps {
    handleSave: () => void;
    handleReset: () => void;
}

export default function FormConfigPanel({
    handleSave,
    handleReset,
}: FormConfigPanelProps) {
    const { selectedAlgorithm, setSelectedAlgorithm } = useContext(
        AlgorithmSelectionContext
    );
    const { processes, quantum, setProcesses, setQuantum, setProcessCount } =
        useContext(SchedulerFormContext);

    const haveReadyQueues = selectedAlgorithm[0] === "mlfq";

    const { processCount, isEditMode, readyQueuesCount } =
        useContext(SchedulerFormContext);

    useContext(SchedulerFormContext);

    const exportDataCallback = useCallback((): SchedulerExportData => {
        return {
            algorithm: selectedAlgorithm[0],
            processCount,
            processes: processes,
            quantum,
        };
    }, [selectedAlgorithm, processCount, processes, quantum]);

    const importDataCallback = useCallback(
        (data: Partial<SchedulerExportData>) => {
            setSelectedAlgorithm([data.algorithm || "fifo"]);
            setProcessCount(data.processCount || 1);
            setProcesses(data.processes || []);
            setQuantum(data.quantum || 1);
        },
        [setSelectedAlgorithm]
    );

    return (
        <Flex
            p="6"
            w="100%"
            maxW="600px"
            borderBottom="5px solid #E5E7EB"
            borderRight="5px solid #E5E7EB"
            borderRadius="lg"
            flexDirection="column"
            gap="4"
        >
            <FieldLabel label="Process count:">
                {isEditMode ? (
                    <NumberInput.Root value={processCount.toString()} readOnly>
                        <NumberInput.Control />
                        <NumberInput.Input />
                    </NumberInput.Root>
                ) : (
                    <Text textAlign="right" fontWeight="medium">
                        {processCount}
                    </Text>
                )}
            </FieldLabel>

            {haveReadyQueues && (
                <>
                    <FieldLabel label="Ready queues count:">
                        {isEditMode ? (
                            <NumberInput.Root
                                value={readyQueuesCount.toString()}
                                readOnly
                            >
                                <NumberInput.Control />
                                <NumberInput.Input />
                            </NumberInput.Root>
                        ) : (
                            <Text textAlign="right" fontWeight="medium">
                                {readyQueuesCount}
                            </Text>
                        )}
                    </FieldLabel>
                </>
            )}

            <Flex justify="space-between">
                <FormImportExport
                    exportDataCallback={exportDataCallback}
                    importDataCallback={importDataCallback}
                />

                <Flex justify="end" gap="2">
                    <Button {...actionButtonStyle} onClick={handleReset}>
                        <LuRotateCcw />
                    </Button>

                    <Button {...actionButtonStyle} onClick={handleSave}>
                        {isEditMode ? <LuSave /> : <LuSquarePen />}
                    </Button>
                </Flex>
            </Flex>
        </Flex>
    );
}

const actionButtonStyle: ButtonProps = {
    variant: "outline",
    size: "sm",
    borderBottom: "3px solid #E5E7EB",
    borderRight: "3px solid #E5E7EB",
    _hover: {
        scale: 0.98,
    },
};
