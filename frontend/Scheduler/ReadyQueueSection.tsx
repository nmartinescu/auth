import {
    Table,
    NumberInput,
    Text,
    IconButton,
    Button,
    Box,
    Stack,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { LuPlus, LuTrash } from "react-icons/lu";

export default function ReadyQueueSection({
    readyQueues,
    setReadyQueues,
    setReadyQueuesCount,
    isEditMode,
    selectedAlgorithm,
}: any) {
    const updateQuantum = (index: number, value: number) => {
        setReadyQueues(
            readyQueues.map((q: number, i: number) => (i === index ? value : q))
        );
    };

    const deleteQueue = (index: number) => {
        setReadyQueues(readyQueues.filter((_: any, i: number) => i !== index));
        setReadyQueuesCount(readyQueues.length - 1);
    };

    const addQueue = () => {
        setReadyQueues([...readyQueues, 1]);
        setReadyQueuesCount(readyQueues.length + 1);
    };

    console.log(selectedAlgorithm);

    useEffect(() => {
        if (selectedAlgorithm === "rr" && readyQueues.length > 1) {
            setReadyQueues([readyQueues[0]]);
            setReadyQueuesCount(1);
        }
    }, [selectedAlgorithm]);

    return (
        <>
            <Stack w="100%" gap="4" boxShadow="lg" borderRadius="lg">
                <Table.Root size="sm" variant="outline">
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeader textAlign="center">
                                Queue #
                            </Table.ColumnHeader>
                            <Table.ColumnHeader textAlign="center">
                                Quantum
                            </Table.ColumnHeader>
                            {isEditMode && selectedAlgorithm === "mlfq" && (
                                <Table.ColumnHeader textAlign="center">
                                    Actions
                                </Table.ColumnHeader>
                            )}
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {readyQueues.map((queue: number, index: number) => (
                            <Table.Row key={index}>
                                <Table.Cell textAlign="center">
                                    {index + 1}
                                </Table.Cell>
                                <Table.Cell textAlign="center">
                                    {isEditMode ? (
                                        <NumberInput.Root
                                            value={queue.toString()}
                                            onValueChange={(e) =>
                                                updateQuantum(
                                                    index,
                                                    Number(e.value) || 0
                                                )
                                            }
                                            min={1}
                                        >
                                            <NumberInput.Control />
                                            <NumberInput.Input />
                                        </NumberInput.Root>
                                    ) : (
                                        <Text>{queue}</Text>
                                    )}
                                </Table.Cell>
                                {isEditMode && selectedAlgorithm === "mlfq" && (
                                    <Table.Cell textAlign="center">
                                        {index !== 0 && (
                                            <IconButton
                                                size="sm"
                                                variant="ghost"
                                                onClick={() =>
                                                    deleteQueue(index)
                                                }
                                                aria-label="Delete queue"
                                            >
                                                <LuTrash />
                                            </IconButton>
                                        )}
                                    </Table.Cell>
                                )}
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table.Root>
            </Stack>

            {isEditMode && selectedAlgorithm === "mlfq" && (
                <Box textAlign="right">
                    <Button size="sm" variant="outline" onClick={addQueue}>
                        <LuPlus />
                        Add Queue
                    </Button>
                </Box>
            )}
        </>
    );
}
