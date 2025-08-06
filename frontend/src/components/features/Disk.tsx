import { Box, Heading, Text } from "@chakra-ui/react";

export function Disk() {
    return (
        <Box p={6}>
            <Heading size="lg" mb={4}>
                Disk Management
            </Heading>
            <Text>
                This is the Disk Management simulation. Here you can explore disk storage and file systems.
            </Text>
        </Box>
    );
}