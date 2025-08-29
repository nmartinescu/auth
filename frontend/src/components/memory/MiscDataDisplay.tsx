import { Box, Button, NumberInput, Wrap, Flex } from "@chakra-ui/react";
import { useState } from "react";

type Props = {
    pageReferences: number[];
    setPageReferences: (data: number[]) => void;
    display: (value: number) => React.ReactNode;
};

export default function MiscDataDisplay({
    pageReferences,
    setPageReferences,
    display,
}: Props) {
    const [newPage, setNewPage] = useState(0);

    const handleRemove = (index: number) => {
        setPageReferences(pageReferences.filter((_, i) => i !== index));
    };

    const handleAdd = () => {
        if (newPage >= 0) {
            setPageReferences([...pageReferences, newPage]);
            setNewPage(0);
        }
    };

    return (
        <Box
            p="3"
            borderRadius="xl"
            bg="gray.50"
            _dark={{ bg: "gray.700" }}
            boxShadow="sm"
            width="100%"
        >
            <Flex align="center" mb="2">
                <Box maxH="100px" overflowY="auto" flex="1">
                    <Wrap gap="2">
                        {pageReferences.map((entry, index) => (
                            <Button
                                key={index}
                                size="xs"
                                variant="outline"
                                colorScheme="gray"
                                borderRadius="full"
                                onClick={() => handleRemove(index)}
                            >
                                {display(entry)} ✕
                            </Button>
                        ))}
                    </Wrap>
                </Box>
            </Flex>

            <Flex gap={2} align="center" mt={2}>
                <Box flex={1}>
                    <NumberInput.Root
                        value={newPage.toString()}
                        onValueChange={(e) => setNewPage(Number(e.value) || 0)}
                        size="sm"
                        min={0}
                        max={100}
                    >
                        <NumberInput.Control />
                        <NumberInput.Input />
                    </NumberInput.Root>
                </Box>

                <Button size="sm" colorScheme="blue" onClick={handleAdd}>
                    Add
                </Button>
            </Flex>
        </Box>
    );
}