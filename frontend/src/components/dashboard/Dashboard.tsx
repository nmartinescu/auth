import { Box, Flex, Text, Button, VStack, HStack, Grid, Spinner, Badge } from "@chakra-ui/react";
import { useColorModeValue } from "../ui/color-mode";
import { useState, useEffect } from "react";
import { LuUser, LuTrash2, LuPlay, LuCalendar, LuCpu, LuHardDrive, LuMemoryStick, LuRefreshCw, LuFileText, LuEye, LuTrophy, LuTarget } from "react-icons/lu";
import type { User } from "../../types/user";
import { simulationService, type Simulation } from "../../services/simulationService";
import { testResultsService } from "../../services/test/testResultsService";

export function Dashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [simulations, setSimulations] = useState<Simulation[]>([]);
    const [simulationsLoading, setSimulationsLoading] = useState(false);
    const [testResults, setTestResults] = useState<any[]>([]);
    const [testResultsLoading, setTestResultsLoading] = useState(false);
    const [testStats, setTestStats] = useState<any>(null);

    const bgColor = useColorModeValue("gray.50", "gray.900");
    const cardBg = useColorModeValue("white", "gray.800");
    const simulationCardBg = useColorModeValue("gray.50", "gray.700");
    const textColor = useColorModeValue("gray.800", "white");
    const subtextColor = useColorModeValue("gray.600", "gray.300");
    const shadowColor = useColorModeValue("md", "2xl");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const iconBg = useColorModeValue("green.50", "green.900");
    const iconColor = useColorModeValue("#38A169", "#68D391");
    const buttonTextColor = useColorModeValue("gray.800", "white");
    
    // Additional color values for buttons
    const refreshButtonHoverBg = useColorModeValue("gray.50", "gray.700");
    const deleteButtonColor = useColorModeValue("red.600", "red.300");
    const blueButtonColor = useColorModeValue("blue.600", "blue.300");
    const greenButtonColor = useColorModeValue("green.600", "green.300");
    const purpleButtonColor = useColorModeValue("purple.600", "purple.300");

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
            
            // Load user's simulations and test results
            loadSimulations();
            loadTestResults();
            loadTestStatistics();
        } catch (error) {
            console.error("Error parsing user data:", error);
            handleLogout();
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadSimulations = async () => {
        setSimulationsLoading(true);
        try {
            const userSimulations = await simulationService.getSimulations();
            setSimulations(Array.isArray(userSimulations) ? userSimulations : []);
        } catch (error) {
            console.error("Error loading simulations:", error);
            setSimulations([]); // Ensure simulations is always an array
            
            // Check if it's an authentication error
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const axiosError = error as any;
                if (axiosError.response?.status === 401) {
                    console.log("Authentication failed, redirecting to login...");
                    handleLogout();
                    return;
                }
            }
        } finally {
            setSimulationsLoading(false);
        }
    };

    const loadTestResults = async () => {
        setTestResultsLoading(true);
        try {
            const results = await testResultsService.getTestResults({ limit: 10, sortBy: 'createdAt', order: 'desc' });
            setTestResults(Array.isArray(results) ? results : []);
        } catch (error) {
            console.error("Error loading test results:", error);
            setTestResults([]);
        } finally {
            setTestResultsLoading(false);
        }
    };

    const loadTestStatistics = async () => {
        try {
            const stats = await testResultsService.getTestStatistics();
            setTestStats(stats);
        } catch (error) {
            console.error("Error loading test statistics:", error);
        }
    };

    const handleDeleteTestResult = async (testResultId: string) => {
        try {
            await testResultsService.deleteTestResult(testResultId);
            loadTestResults();
            loadTestStatistics();
        } catch (error) {
            console.error("Error deleting test result:", error);
        }
    };

    const handleViewTestResult = (testResult: any) => {
        // Store test result in sessionStorage for review
        sessionStorage.setItem('reviewTestResult', JSON.stringify(testResult));
        window.location.href = '/test?review=true';
    };

    const handleDeleteSimulation = async (simulationId: string) => {
        try {
            await simulationService.deleteSimulation(simulationId);
            // Reload simulations after deletion
            loadSimulations();
        } catch (error) {
            console.error("Error deleting simulation:", error);
        }
    };

    const handleLoadSimulation = async (simulationId: string, simulationType: string) => {
        try {
            // Get the full simulation data
            const simulation = await simulationService.getSimulationById(simulationId);
            
            // Encode the simulation data to pass it via URL
            const encodedData = encodeURIComponent(JSON.stringify(simulation.data));
            
            // Navigate to the simulation page with the data
            window.location.href = `/${simulationType}?loadData=${encodedData}`;
        } catch (error) {
            console.error("Error loading simulation:", error);
        }
    };

    const getSimulationIcon = (type: string) => {
        switch (type) {
            case 'process':
                return <LuCpu size={20} />;
            case 'memory':
                return <LuMemoryStick size={20} />;
            case 'disk':
                return <LuHardDrive size={20} />;
            default:
                return <LuCpu size={20} />;
        }
    };

    const getSimulationTypeColor = (type: string) => {
        switch (type) {
            case 'process':
                return 'blue';
            case 'memory':
                return 'green';
            case 'disk':
                return 'purple';
            default:
                return 'gray';
        }
    };

    const getSimulationButtonColor = (type: string) => {
        switch (type) {
            case 'process':
                return blueButtonColor;
            case 'memory':
                return greenButtonColor;
            case 'disk':
                return purpleButtonColor;
            default:
                return textColor;
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
    };

    if (isLoading) {
        return (
            <Flex minH="100vh" align="center" justify="center" bg={bgColor}>
                <VStack gap={4}>
                    <Spinner size="lg" color="blue.500" />
                    <Text fontSize="lg" color={textColor}>
                        Loading...
                    </Text>
                </VStack>
            </Flex>
        );
    }

    if (!user) {
        return null; // Will redirect to login
    }

    return (
        <Box minH="100vh" bg={bgColor} pb={6}>
            {/* Main Content */}
            <Box pt={6} px={6}>
                <VStack gap={6} align="stretch" maxW="6xl" mx="auto">
                    {/* Welcome Card */}
                    <Box
                        bg={cardBg}
                        p={6}
                        borderRadius="xl"
                        shadow={shadowColor}
                        border="1px"
                        borderColor={borderColor}
                    >
                        <VStack align="start" gap={4}>
                            <HStack gap={3}>
                                <Box p={3} bg={iconBg} borderRadius="full">
                                    <LuUser size={32} color={iconColor} />
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
                                Welcome to your OS Simulator dashboard. Here you can
                                view and manage your saved simulations.
                            </Text>
                        </VStack>
                    </Box>

                    {/* Saved Simulations Section */}
                    <Box
                        bg={cardBg}
                        p={6}
                        borderRadius="xl"
                        shadow={shadowColor}
                        border="1px"
                        borderColor={borderColor}
                    >
                        <VStack align="start" gap={4}>
                            <HStack justify="space-between" w="100%">
                                <Text
                                    fontSize="xl"
                                    fontWeight="bold"
                                    color={textColor}
                                >
                                    Saved Simulations ({simulations.length})
                                </Text>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={loadSimulations}
                                    disabled={simulationsLoading}
                                    color={textColor}
                                    borderColor={borderColor}
                                    bg="transparent"
                                    _hover={{
                                        bg: refreshButtonHoverBg,
                                        color: textColor
                                    }}
                                    _dark={{
                                        color: "white !important",
                                        borderColor: "gray.600",
                                        bg: "transparent"
                                    }}
                                    sx={{
                                        color: textColor + " !important"
                                    }}
                                >
                                    <LuRefreshCw size={16} />
                                    Refresh
                                </Button>
                            </HStack>

                            {simulationsLoading ? (
                                <Flex justify="center" p={8}>
                                    <Spinner size="lg" color="blue.500" />
                                </Flex>
                            ) : simulations.length === 0 ? (
                                <Box textAlign="center" p={8}>
                                    <Text color={subtextColor} fontSize="lg">
                                        No simulations saved yet
                                    </Text>
                                    <Text color={subtextColor} mt={2}>
                                        Start by creating and saving simulations from the simulation pages
                                    </Text>
                                </Box>
                            ) : (
                                <Grid
                                    templateColumns="repeat(auto-fill, minmax(300px, 1fr))"
                                    gap={4}
                                    w="100%"
                                >
                                    {(Array.isArray(simulations) ? simulations : []).map((simulation) => (
                                        <Box
                                            key={simulation.id}
                                            bg={simulationCardBg}
                                            p={4}
                                            borderRadius="lg"
                                            border="1px"
                                            borderColor={borderColor}
                                            _hover={{
                                                shadow: "md",
                                                transform: "translateY(-2px)",
                                                transition: "all 0.2s"
                                            }}
                                        >
                                            <VStack align="start" gap={3}>
                                                <HStack justify="space-between" w="100%">
                                                    <HStack gap={2}>
                                                        <Box
                                                            p={2}
                                                            bg={`${getSimulationTypeColor(simulation.type)}.100`}
                                                            borderRadius="md"
                                                            color={`${getSimulationTypeColor(simulation.type)}.600`}
                                                            _dark={{
                                                                bg: `${getSimulationTypeColor(simulation.type)}.900`,
                                                                color: `${getSimulationTypeColor(simulation.type)}.300`
                                                            }}
                                                        >
                                                            {getSimulationIcon(simulation.type)}
                                                        </Box>
                                                        <VStack align="start" gap={0}>
                                                            <Text
                                                                fontWeight="semibold"
                                                                color={textColor}
                                                                fontSize="sm"
                                                            >
                                                                {simulation.name}
                                                            </Text>
                                                            <Text
                                                                color={subtextColor}
                                                                fontSize="xs"
                                                                textTransform="capitalize"
                                                            >
                                                                {simulation.type} Simulation
                                                            </Text>
                                                        </VStack>
                                                    </HStack>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        colorScheme="red"
                                                        onClick={() => handleDeleteSimulation(simulation.id!)}
                                                        p={1}
                                                        color="red.500"
                                                        _dark={{ color: "red.300" }}
                                                    >
                                                        <LuTrash2 size={16} />
                                                    </Button>
                                                </HStack>

                                                <HStack gap={2} fontSize="xs" color={subtextColor}>
                                                    <LuCalendar size={14} />
                                                    <Text>
                                                        {new Date(simulation.createdAt!).toLocaleDateString()}
                                                    </Text>
                                                </HStack>

                                                <Button
                                                    size="sm"
                                                    colorScheme={getSimulationTypeColor(simulation.type)}
                                                    variant="outline"
                                                    onClick={() => handleLoadSimulation(simulation.id!, simulation.type)}
                                                    w="100%"
                                                    bg="transparent"
                                                    color={getSimulationButtonColor(simulation.type)}
                                                    _dark={{
                                                        color: `${getSimulationTypeColor(simulation.type)}.300 !important`,
                                                        borderColor: `${getSimulationTypeColor(simulation.type)}.300`,
                                                        bg: "transparent"
                                                    }}
                                                    sx={{
                                                        color: getSimulationButtonColor(simulation.type) + " !important",
                                                        "& *": {
                                                            color: "inherit !important"
                                                        }
                                                    }}
                                                >
                                                    <Flex align="center" gap={2} color="inherit">
                                                        <LuPlay size={14} />
                                                        <Text color="inherit">Open Simulation</Text>
                                                    </Flex>
                                                </Button>
                                            </VStack>
                                        </Box>
                                    ))}
                                </Grid>
                            )}
                        </VStack>
                    </Box>

                    {/* Test Results Section */}
                    <Box
                        bg={cardBg}
                        p={6}
                        borderRadius="xl"
                        shadow={shadowColor}
                        border="1px"
                        borderColor={borderColor}
                    >
                        <VStack align="start" gap={4}>
                            <HStack justify="space-between" w="100%">
                                <Text
                                    fontSize="xl"
                                    fontWeight="bold"
                                    color={textColor}
                                >
                                    Test Results ({testResults.length})
                                </Text>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        loadTestResults();
                                        loadTestStatistics();
                                    }}
                                    disabled={testResultsLoading}
                                    color={textColor}
                                    borderColor={borderColor}
                                    bg="transparent"
                                    _hover={{
                                        bg: refreshButtonHoverBg,
                                        color: textColor
                                    }}
                                >
                                    <LuRefreshCw size={16} />
                                    Refresh
                                </Button>
                            </HStack>

                            {/* Test Statistics */}
                            {testStats && testStats.totalTests > 0 && (
                                <Grid
                                    templateColumns="repeat(auto-fit, minmax(150px, 1fr))"
                                    gap={4}
                                    w="100%"
                                >
                                    <Box
                                        p={4}
                                        bg={simulationCardBg}
                                        borderRadius="md"
                                        border="1px"
                                        borderColor={borderColor}
                                    >
                                        <VStack align="start" gap={1}>
                                            <Text color={subtextColor} fontSize="sm">Total Tests</Text>
                                            <Text color={textColor} fontSize="2xl" fontWeight="bold">{testStats.totalTests}</Text>
                                        </VStack>
                                    </Box>
                                    <Box
                                        p={4}
                                        bg={simulationCardBg}
                                        borderRadius="md"
                                        border="1px"
                                        borderColor={borderColor}
                                    >
                                        <VStack align="start" gap={1}>
                                            <Text color={subtextColor} fontSize="sm">Avg Score</Text>
                                            <Text color={textColor} fontSize="2xl" fontWeight="bold">{testStats.averageScore}%</Text>
                                        </VStack>
                                    </Box>
                                    <Box
                                        p={4}
                                        bg={simulationCardBg}
                                        borderRadius="md"
                                        border="1px"
                                        borderColor={borderColor}
                                    >
                                        <VStack align="start" gap={1}>
                                            <Text color={subtextColor} fontSize="sm">Best Score</Text>
                                            <Text color={textColor} fontSize="2xl" fontWeight="bold">{testStats.highestScore}%</Text>
                                        </VStack>
                                    </Box>
                                    <Box
                                        p={4}
                                        bg={simulationCardBg}
                                        borderRadius="md"
                                        border="1px"
                                        borderColor={borderColor}
                                    >
                                        <VStack align="start" gap={1}>
                                            <Text color={subtextColor} fontSize="sm">Correct Answers</Text>
                                            <Text color={textColor} fontSize="2xl" fontWeight="bold">{testStats.correctAnswers}/{testStats.totalQuestions}</Text>
                                        </VStack>
                                    </Box>
                                </Grid>
                            )}

                            {testResultsLoading ? (
                                <Flex justify="center" p={8}>
                                    <Spinner size="lg" color="blue.500" />
                                </Flex>
                            ) : testResults.length === 0 ? (
                                <Box textAlign="center" p={8}>
                                    <Text color={subtextColor} fontSize="lg">
                                        No test results yet
                                    </Text>
                                    <Text color={subtextColor} mt={2}>
                                        Take your first test to see results here
                                    </Text>
                                </Box>
                            ) : (
                                <VStack align="stretch" gap={3} w="100%">
                                    {testResults.map((result: any) => (
                                        <Box
                                            key={result._id}
                                            bg={simulationCardBg}
                                            p={4}
                                            borderRadius="lg"
                                            border="1px"
                                            borderColor={borderColor}
                                            _hover={{
                                                shadow: "md",
                                                transform: "translateY(-2px)",
                                                transition: "all 0.2s"
                                            }}
                                        >
                                            <Flex justify="space-between" align="start" gap={4}>
                                                <HStack gap={3} flex="1">
                                                    <Box
                                                        p={2}
                                                        bg="blue.100"
                                                        borderRadius="md"
                                                        color="blue.600"
                                                        _dark={{
                                                            bg: "blue.900",
                                                            color: "blue.300"
                                                        }}
                                                    >
                                                        <LuFileText size={20} />
                                                    </Box>
                                                    <VStack align="start" gap={1} flex="1">
                                                        <HStack gap={2} wrap="wrap">
                                                            <Text fontWeight="semibold" color={textColor}>
                                                                {result.config.difficulty.charAt(0).toUpperCase() + result.config.difficulty.slice(1)} Test
                                                            </Text>
                                                            <Badge colorScheme={result.summary.percentage >= 80 ? "green" : result.summary.percentage >= 60 ? "yellow" : "red"}>
                                                                {result.summary.percentage}%
                                                            </Badge>
                                                        </HStack>
                                                        <HStack gap={4} fontSize="xs" color={subtextColor} wrap="wrap">
                                                            <HStack>
                                                                <LuCalendar size={12} />
                                                                <Text>{new Date(result.createdAt).toLocaleDateString()}</Text>
                                                            </HStack>
                                                            <HStack>
                                                                <LuTarget size={12} />
                                                                <Text>{result.summary.answeredQuestions}/{result.summary.totalQuestions} questions</Text>
                                                            </HStack>
                                                            <HStack>
                                                                <LuTrophy size={12} />
                                                                <Text>{result.summary.correctAnswers} correct</Text>
                                                            </HStack>
                                                        </HStack>
                                                    </VStack>
                                                </HStack>
                                                <HStack gap={2}>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        colorScheme="blue"
                                                        onClick={() => handleViewTestResult(result)}
                                                    >
                                                        <LuEye size={16} />
                                                        Review
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        colorScheme="red"
                                                        onClick={() => handleDeleteTestResult(result._id)}
                                                        p={1}
                                                    >
                                                        <LuTrash2 size={16} />
                                                    </Button>
                                                </HStack>
                                            </Flex>
                                        </Box>
                                    ))}
                                </VStack>
                            )}
                        </VStack>
                    </Box>

                    {/* Account Actions */}
                    <Flex gap={6} wrap="wrap">
                        <Box
                            bg={cardBg}
                            p={6}
                            borderRadius="xl"
                            shadow={shadowColor}
                            border="1px"
                            borderColor={borderColor}
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
                            shadow={shadowColor}
                            border="1px"
                            borderColor={borderColor}
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
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        colorScheme="red"
                                        color="red.600"
                                        borderColor="red.300"
                                        bg="transparent"
                                        _hover={{
                                            bg: "red.50",
                                            color: "red.700"
                                        }}
                                        _dark={{ 
                                            color: "red.300 !important",
                                            borderColor: "red.300",
                                            bg: "transparent",
                                            _hover: {
                                                bg: "red.900",
                                                color: "red.200 !important"
                                            }
                                        }}
                                        sx={{
                                            color: deleteButtonColor + " !important"
                                        }}
                                        onClick={() =>
                                            (window.location.href =
                                                "/delete-account")
                                        }
                                    >
                                        <LuTrash2 />
                                        Delete Account
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
