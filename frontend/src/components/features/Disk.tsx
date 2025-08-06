import { Box, Heading, Text } from "@chakra-ui/react";
import { useColorModeValue } from "../ui/color-mode";

export function Disk() {
    const bgColor = useColorModeValue("white", "gray.800");
    const textColor = useColorModeValue("gray.800", "white");
    const subtextColor = useColorModeValue("gray.600", "gray.300");

    return (
        <Box p={6} bg={bgColor} minH="calc(100vh - 80px)">
            <Heading size="lg" mb={4} color={textColor}>
                Disk Management
            </Heading>
            <Text color={subtextColor}>
                This is the Disk Management simulation. Here you can explore disk storage and file systems.
            </Text>
        </Box>
    );
}