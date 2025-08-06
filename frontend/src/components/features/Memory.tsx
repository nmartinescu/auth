import { Box, Heading, Text } from "@chakra-ui/react";

export function Memory() {
    return (
        <Box p={6}>
            <Heading size="lg" mb={4}>
                Memory Management
            </Heading>
            <Text>
                This is the Memory Management simulation. Here you can explore memory allocation and management.
            </Text>
        </Box>
    );
}