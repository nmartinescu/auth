import { AlgorithmSelectionContext } from "@/context/AlgorithmSelectionContext";
import {
    Select,
    Flex,
    Heading,
    Portal,
    SelectValueChangeDetails,
    Box,
} from "@chakra-ui/react";
import { useCallback, useContext } from "react";

export default function AlgorithmSelection() {
    const { selectedAlgorithm, setSelectedAlgorithm, algorithms } = useContext(
        AlgorithmSelectionContext
    );

    const onAlgorithmValueChange = useCallback(
        ({ value }: SelectValueChangeDetails) => {
            setSelectedAlgorithm(value);
        },
        [setSelectedAlgorithm]
    );

    return (
        <Select.Root
            collection={algorithms}
            defaultValue={selectedAlgorithm}
            onValueChange={onAlgorithmValueChange}
        >
            <Flex
                align="center"
                justify="center"
                gap={{ base: 2, md: 3 }}
                direction={{ base: "column", sm: "row" }}
            >
                <Select.Label>
                    <Heading
                        as="h2"
                        size={{ base: "lg", md: "xl" }}
                        fontFamily="Roboto"
                        fontWeight="normal"
                        mb={{ base: 1, sm: 0 }}
                    >
                        Algorithm:
                    </Heading>
                </Select.Label>

                <Box position="relative">
                    <Select.Control
                        width={{ base: "140px", md: "160px", lg: "180px" }}
                    >
                        <Select.Trigger>
                            <Select.ValueText placeholder="Select algorithm" />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                            <Select.Indicator />
                        </Select.IndicatorGroup>
                    </Select.Control>
                </Box>
            </Flex>

            <Portal>
                <Select.Positioner>
                    <Select.Content maxH="60vh" overflowY="auto">
                        {algorithms.items.map((alg) => (
                            <Select.Item key={alg.value} item={alg}>
                                <Box>
                                    {alg.label}
                                    {alg.description && (
                                        <Box
                                            fontSize="xs"
                                            color="gray.500"
                                            mt={1}
                                        >
                                            {alg.description}
                                        </Box>
                                    )}
                                </Box>
                                <Select.ItemIndicator />
                            </Select.Item>
                        ))}
                    </Select.Content>
                </Select.Positioner>
            </Portal>
        </Select.Root>
    );
}
