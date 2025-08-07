import FormHeading from "@/components/Form/FormHeading";
import FormBodyScheduler from "@/components/Scheduler/Form/FormBodyScheduler";
import { Flex } from "@chakra-ui/react";
import { useCallback, useContext, useMemo, useState } from "react";
import {
    Process,
    ProcessPayload,
} from "@/types/Scheduler/Scheduler";
import { API_URL, SCHEDULER_PROCESSES_DEFAULT } from "@/constants";
import { SchedulerFormContext } from "@/context/Form/Scheduler/SchedulerFormContext";
import { AlgorithmSelectionContext } from "@/context/AlgorithmSelectionContext";

export default function FormScheduler() {
    const [isEditMode, setIsEditMode] = useState(false);
    const [processCount, setProcessCount] = useState(1);
    const [processes, setProcesses] = useState<Process[]>(
        SCHEDULER_PROCESSES_DEFAULT
    );
    const [quantum, setQuantum] = useState(1);
    const [readyQueuesCount, setReadyQueuesCount] = useState(1);
    const [readyQueues, setReadyQueues] = useState<number[]>([1]);

    // get AlgorithmSelectionContext
    const {
        selectedAlgorithm,
        setChartData,
        setCustomData,
    } = useContext(AlgorithmSelectionContext);

    const onSubmit = useCallback(async () => {
        try {
            const processesCopy: ProcessPayload[] = processes.map((p) => {
                let io: { start: number; duration: number }[] = [];
                if (p.io) {
                    io = p.io.split(",").map((ioTuple: string) => {
                        const [start, duration] = ioTuple.split(":");
                        return {
                            start: Number(start),
                            duration: Number(duration),
                        };
                    });
                }

                return {
                    ...p,
                    io,
                };
            });

            const body = {
                algorithm: selectedAlgorithm[0],
                processCount,
                processes: processesCopy,
                quantum,
            };

            console.log(body);

            // fetch
            const response = await fetch(`${API_URL}/schedule`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            // get response
            const responseJson = await response.json();

            setChartData(responseJson.processes);
            setCustomData(responseJson.customData);

            // log what is sent and what is received
            console.log(responseJson);
        } catch (error) {
            console.error("Failed to submit:", error);
        }
    }, [
        processCount,
        processes,
        quantum,
        selectedAlgorithm,
        setChartData,
        setCustomData,
    ]);

    const schedulerContextValue = useMemo(
        () => ({
            isEditMode,
            setIsEditMode,
            processCount,
            setProcessCount,
            processes,
            readyQueuesCount,
            setReadyQueuesCount,
            quantum,
            setQuantum,
            setProcesses,
            readyQueues,
            setReadyQueues,
            onSubmit,
        }),
        [
            isEditMode,
            processCount,
            processes,
            quantum,
            readyQueues,
            readyQueuesCount,
            onSubmit,
        ]
    );

    return (
        <SchedulerFormContext.Provider value={schedulerContextValue}>
            <Flex
                maxW="1200px"
                w="90%"
                mx="auto"
                flexDirection="column"
                gap="10"
                mt="10"
            >
                <FormHeading text="Process Scheduler Simulator" />
                <FormBodyScheduler />
            </Flex>
        </SchedulerFormContext.Provider>
    );
}
