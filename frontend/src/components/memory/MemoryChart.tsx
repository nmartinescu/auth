import { Table } from "@chakra-ui/react";

export default function MemoryChart({
    memoryData,
    columns = 1,
}: {
    memoryData: number[][];
    columns?: number;
}) {
    return (
        <Table.ScrollArea borderWidth="1px" maxW="xl" rounded="md" height="406px" mx="auto">
            <Table.Root size="sm" stickyHeader>
                <Table.Header>
                    <Table.Row>
                        {Array.from({ length: columns }, (_, colIndex) => (
                            <Table.ColumnHeader key={colIndex} textAlign="center">
                                Frame {colIndex}
                            </Table.ColumnHeader>
                        ))}
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {memoryData.map((row, rowIndex) => (
                        <Table.Row key={rowIndex}>
                            {row.map((cell, colIndex) => (
                                <Table.Cell key={colIndex} textAlign="center">
                                    {cell === -1 ? "Empty" : cell}
                                </Table.Cell>
                            ))}
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>
        </Table.ScrollArea>
    );
}