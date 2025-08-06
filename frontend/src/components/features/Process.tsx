import { Box, Heading, Text } from "@chakra-ui/react";

export function Process() {
    return (
        <Box p={6}>
            <Heading size="lg" mb={4}>
                Process Management
            </Heading>
            <Text>
                This is the Process Management simulation. Here you can monitor and manage system processes.
            </Text>
        </Box>
    );
}