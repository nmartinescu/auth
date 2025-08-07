import ConfigPanel from "@/components/Scheduler/Form/FormConfigPanel";
import ConfigTable from "@/components/Scheduler/ConfigTable";
import { Flex } from "@chakra-ui/react";
import { useContext } from "react";
import { SchedulerFormContext } from "@/context/Form/Scheduler/SchedulerFormContext";

export default function FormBodyScheduler() {
    const {
        isEditMode,
        setIsEditMode,
        setProcessCount,
        setQuantum,
        setProcesses,
    } = useContext(SchedulerFormContext);

    const handleReset = () => {
        setProcessCount(1);
        setQuantum(1);
        setProcesses([
            {
                arrivalTime: 0,
                burstTime: 1,
                io: "",
            },
        ]);
    };

    const handleSave = () => { 
        setIsEditMode(!isEditMode)
    }

    return (
        <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align="flex-start"
            gap="4"
            w="100%"
        >
            <ConfigPanel 
                handleSave={handleSave} 
                handleReset={handleReset}
            />
            <ConfigTable />
        </Flex>
    );
}
