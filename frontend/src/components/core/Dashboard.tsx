import { Box, Flex, Text, Button, VStack, HStack } from "@chakra-ui/react";
import { useColorModeValue } from "../ui/color-mode";
import { useState, useEffect } from "react";
import { LuUser, LuSettings } from "react-icons/lu";
import type { User } from "../../types/user";

export function Dashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const bgColor = useColorModeValue("gray.50", "gray.900");
    const cardBg = useColorModeValue("white", "gray.800");
    const textColor = useColorModeValue("gray.800", "white");
    const subtextColor = useColorModeValue("gray.600", "gray.300");

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem("authToken");
        const userData = localStorage.getItem("user");

        if (!token || !userData) {
            // Redirect to login if not authenticated
            window.location.href = "/login";
            return;
        }

        try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
        } catch (error) {
            console.error("Error parsing user data:", error);
            handleLogout();
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
    };

    if (isLoading) {
        return (
            <Flex minH="100vh" align="center" justify="center" bg={bgColor}>
                <Text fontSize="lg" color={textColor}>
                    Loading...
                </Text>
            </Flex>
        );
    }

    if (!user) {
        return null; // Will redirect to login
    }

    return (
        <Box minH="100vh" bg={bgColor}>
            {/* Main Content */}
            <Box p={6}>
                <VStack gap={6} align="stretch" maxW="4xl" mx="auto">
                    {/* Welcome Card */}
                    <Box
                        bg={cardBg}
                        p={6}
                        borderRadius="xl"
                        shadow="md"
                        border="1px"
                        borderColor={useColorModeValue("gray.200", "gray.700")}
                    >
                        <VStack align="start" gap={4}>
                            <HStack gap={3}>
                                <Box
                                    p={3}
                                    bg={useColorModeValue(
                                        "green.50",
                                        "green.900"
                                    )}
                                    borderRadius="full"
                                >
                                    <LuUser
                                        size={32}
                                        color={useColorModeValue(
                                            "#38A169",
                                            "#68D391"
                                        )}
                                    />
                                </Box>
                                <VStack align="start" gap={1}>
                                    <Text
                                        fontSize="2xl"
                                        fontWeight="bold"
                                        color={textColor}
                                    >
                                        Hello, {user.name}!
                                    </Text>
                                    <Text color={subtextColor}>
                                        {user.email}
                                    </Text>
                                </VStack>
                            </HStack>

                            <Text color={subtextColor}>
                                Welcome to your OS Sim dashboard. Here you can
                                monitor system resources, manage processes, and
                                explore operating system concepts.
                            </Text>
                        </VStack>
                    </Box>

                    {/* Stats Cards */}
                    <Flex gap={6} wrap="wrap">
                        <Box
                            bg={cardBg}
                            p={6}
                            borderRadius="xl"
                            shadow="md"
                            border="1px"
                            borderColor={useColorModeValue(
                                "gray.200",
                                "gray.700"
                            )}
                            flex="1"
                            minW="250px"
                        >
                            <VStack align="start" gap={3}>
                                <Text
                                    fontSize="lg"
                                    fontWeight="semibold"
                                    color={textColor}
                                >
                                    Account Info
                                </Text>
                                <VStack align="start" gap={2} fontSize="sm">
                                    <Text color={subtextColor}>
                                        <strong>Name:</strong> {user.name}
                                    </Text>
                                    <Text color={subtextColor}>
                                        <strong>Email:</strong> {user.email}
                                    </Text>
                                    <Text color={subtextColor}>
                                        <strong>Member since:</strong>{" "}
                                        {new Date(
                                            user.createdAt
                                        ).toLocaleDateString()}
                                    </Text>
                                </VStack>
                            </VStack>
                        </Box>

                        <Box
                            bg={cardBg}
                            p={6}
                            borderRadius="xl"
                            shadow="md"
                            border="1px"
                            borderColor={useColorModeValue(
                                "gray.200",
                                "gray.700"
                            )}
                            flex="1"
                            minW="250px"
                        >
                            <VStack align="start" gap={3}>
                                <Text
                                    fontSize="lg"
                                    fontWeight="semibold"
                                    color={textColor}
                                >
                                    Quick Actions
                                </Text>
                                <VStack align="stretch" gap={2}>
                                    <Button size="sm" variant="outline">
                                        <LuSettings />
                                        System Monitor
                                    </Button>
                                    <Button size="sm" variant="outline">
                                        <LuSettings />
                                        Process Manager
                                    </Button>
                                    <Button size="sm" variant="outline">
                                        <LuSettings />
                                        Memory Viewer
                                    </Button>
                                </VStack>
                            </VStack>
                        </Box>
                    </Flex>
                </VStack>
            </Box>
        </Box>
    );
}
