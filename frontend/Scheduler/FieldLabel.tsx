import { SchedulerFormContext } from "@/context/Form/Scheduler/SchedulerFormContext";
import { Flex, Box, Text } from "@chakra-ui/react";
import { useContext } from "react";
import { FieldLabelProps } from "@/types/Scheduler/FieldLabel";

export default function FieldLabel({ label, children }: FieldLabelProps) {
    const { isEditMode } = useContext(SchedulerFormContext);
    
    return (
        <Flex
            w="full"
            flexDirection={isEditMode ? "column" : "row"}
            justifyContent={isEditMode ? "flex-start" : "space-between"}
            borderBottom="2px solid #E5E7EB"
            borderTop="2px solid #E5E7EB"
            px="4"
            py="2"
        >
            <Text fontWeight="medium" color="gray.600" w="40%">
                {label}
            </Text>
            <Box w={isEditMode ? "100%" : "70%"}>{children}</Box>
        </Flex>
    );
}
