import { SchedulerFormContext } from "@/context/Form/Scheduler/SchedulerFormContext";
import { Table, NumberInput, Text, Input, IconButton } from "@chakra-ui/react";
import { useContext } from "react";
import { LuTrash } from "react-icons/lu";

export default function RequestRow({
    index,
    value,
    updateProcess,
    onDelete,
}: any) {

    const { isEditMode } = useContext(SchedulerFormContext);
    return (
        <Table.Row>
            <Table.Cell textAlign="center">{index + 1}</Table.Cell>
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
                    >
                        <NumberInput.Control />
                        <NumberInput.Input />
                    </NumberInput.Root>
                ) : (
                    <Text>{value.arrivalTime}</Text>
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
                    >
                        <NumberInput.Control />
                        <NumberInput.Input />
                    </NumberInput.Root>
                ) : (
                    <Text>{value.burstTime}</Text>
                )}
            </Table.Cell>
            <Table.Cell textAlign="center">
                {isEditMode ? (
                    <Input
                        value={value.io}
                        onChange={(e) =>
                            updateProcess(index, "io", e.target.value)
                        }
                    />
                ) : (
                    <Text>{value.io}</Text>
                )}
            </Table.Cell>
            {isEditMode && (
                <Table.Cell textAlign="center">
                    {index !== 0 && (
                        <IconButton
                            size="sm"
                            variant="ghost"
                            onClick={() => onDelete(index)}
                            aria-label="Delete row"
                        >
                            <LuTrash />
                        </IconButton>
                    )}
                </Table.Cell>
            )}
        </Table.Row>
    );
}
