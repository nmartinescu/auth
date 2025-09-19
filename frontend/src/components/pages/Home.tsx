import { 
    Box, 
    Container, 
    Heading, 
    Text, 
    Button, 
    Flex, 
    Grid,
    Stack
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { useColorModeValue } from "../ui/color-mode";
import { LuCpu, LuMemoryStick, LuHardDrive, LuArrowRight, LuBookOpen, LuPlay } from "react-icons/lu";

export function Home() {
    const bgGradient = useColorModeValue(
        "linear(to-br, blue.50, purple.50, pink.50)",
        "linear(to-br, gray.900, blue.900, purple.900)"
    );
    const cardBg = useColorModeValue("white", "gray.800");
    const textColor = useColorModeValue("gray.600", "gray.300");
    const headingColor = useColorModeValue("gray.800", "white");
    const borderColor = useColorModeValue("gray.200", "gray.600");

    const features = [
        {
            icon: LuCpu,
            title: "CPU Scheduling",
            description: "Simulate and visualize various CPU scheduling algorithms including FCFS, SJF, and Round Robin.",
            path: "/process",
            color: "blue"
        },
        {
            icon: LuMemoryStick,
            title: "Memory Management",
            description: "Explore memory allocation strategies and page replacement algorithms in operating systems.",
            path: "/memory",
            color: "green"
        },
        {
            icon: LuHardDrive,
            title: "Disk Scheduling",
            description: "Learn disk scheduling algorithms like FCFS, SSTF, SCAN, and C-SCAN with interactive simulations.",
            path: "/disk",
            color: "purple"
        }
    ];

    return (
        <Box minH="calc(100vh - 80px)" bgGradient={bgGradient}>
            <Container maxW="7xl" py={16}>
                {/* Hero Section */}
                <Flex direction="column" align="center" textAlign="center" mb={16}>
                    <Heading
                        size="2xl"
                        mb={6}
                        color={headingColor}
                        fontWeight="bold"
                        lineHeight="shorter"
                    >
                        Operating System
                        <Text as="span" color="blue.500" display="block">
                            Simulator
                        </Text>
                    </Heading>
                    
                    <Text
                        fontSize="xl"
                        color={textColor}
                        maxW="2xl"
                        mb={8}
                        lineHeight="tall"
                    >
                        Interactive learning platform for understanding core operating system concepts 
                        through hands-on simulations and visualizations.
                    </Text>

                    <Stack direction={{ base: "column", md: "row" }} spacing={4}>
                        <Button
                            as={RouterLink}
                            to="/process"
                            size="lg"
                            colorScheme="blue"
                            rightIcon={<LuPlay />}
                            px={8}
                        >
                            Start Simulating
                        </Button>
                        <Button
                            as={RouterLink}
                            to="/test"
                            size="lg"
                            variant="outline"
                            rightIcon={<LuBookOpen />}
                            px={8}
                        >
                            Take a Test
                        </Button>
                    </Stack>
                </Flex>

                {/* Features Grid */}
                <Grid
                    templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
                    gap={8}
                    mb={16}
                >
                    {features.map((feature, index) => {
                        const IconComponent = feature.icon;
                        return (
                            <Box
                                key={index}
                                p={6}
                                bg={cardBg}
                                border="1px"
                                borderColor={borderColor}
                                borderRadius="xl"
                                transition="all 0.3s"
                                _hover={{
                                    transform: "translateY(-4px)",
                                    shadow: "xl",
                                    borderColor: `${feature.color}.300`
                                }}
                                cursor="pointer"
                                as={RouterLink}
                                to={feature.path}
                            >
                                <Flex direction="column" align="center" textAlign="center">
                                    <Box
                                        p={3}
                                        borderRadius="full"
                                        bg={`${feature.color}.100`}
                                        color={`${feature.color}.600`}
                                        mb={4}
                                    >
                                        <IconComponent size={32} />
                                    </Box>
                                    
                                    <Heading size="md" mb={3} color={headingColor}>
                                        {feature.title}
                                    </Heading>
                                    
                                    <Text color={textColor} mb={4} lineHeight="tall">
                                        {feature.description}
                                    </Text>
                                    
                                    <Button
                                        variant="ghost"
                                        colorScheme={feature.color}
                                        rightIcon={<LuArrowRight />}
                                        size="sm"
                                    >
                                        Explore
                                    </Button>
                                </Flex>
                            </Box>
                        );
                    })}
                </Grid>

                {/* About Section */}
                <Box
                    p={8}
                    bg={cardBg}
                    border="1px"
                    borderColor={borderColor}
                    borderRadius="xl"
                    textAlign="center"
                >
                    <Heading size="lg" mb={4} color={headingColor}>
                        Learn by Doing
                    </Heading>
                    <Text color={textColor} fontSize="lg" maxW="4xl" mx="auto" lineHeight="tall">
                        This simulator provides an interactive environment to understand fundamental 
                        operating system concepts. Experiment with different algorithms, visualize 
                        their behavior, and test your knowledge with built-in assessments.
                    </Text>
                </Box>
            </Container>
        </Box>
    );
}