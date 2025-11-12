import {
    Box,
    Flex,
    Heading,
    Text,
    Button,
    VStack,
    HStack,
    Badge,
    Grid,
    GridItem
} from "@chakra-ui/react";
import { useColorModeValue } from "../../ui/color-mode";
import type { TestResultsProps } from "../types.ts";

const TestResults = ({
    session,
    summary,
    onRestart,
    onViewQuestion
}: TestResultsProps) => {
    // UI Colors
    const boxBg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const textColor = useColorModeValue("gray.600", "gray.300");
    const primaryTextColor = useColorModeValue("gray.900", "white");

    const getScoreColor = (percentage: number) => {
        if (percentage >= 80) return "green";
        if (percentage >= 60) return "yellow";
        return "red";
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'green';
            case 'medium': return 'yellow';
            case 'hard': return 'red';
            default: return 'gray';
        }
    };

    const formatDuration = (minutes: number) => {
        if (minutes < 1) return "< 1 minute";
        if (minutes < 60) return `${Math.round(minutes)} minutes`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = Math.round(minutes % 60);
        return `${hours}h ${remainingMinutes}m`;
    };

    return (
        <Flex
            maxW="1200px"
            w="90%"
            mx="auto"
            flexDirection="column"
            gap="6"
            mt="6"
            pb="10"
        >
            {/* Header */}
            <Box textAlign="center">
                <Heading size="xl" mb={2} color={primaryTextColor}>Test Completed!</Heading>
                <Text fontSize="lg" color={textColor}>
                    Here are your results
                </Text>
            </Box>

            {/* Overall Results */}
            <Box 
                p={8} 
                borderWidth={1} 
                borderRadius="lg" 
                shadow="md" 
                bg={boxBg} 
                borderColor={borderColor}
                textAlign="center"
            >
                <VStack gap={6}>
                    <Badge 
                        colorScheme={getScoreColor(summary.percentage)} 
                        fontSize="2xl" 
                        p={4} 
                        borderRadius="md"
                    >
                        {summary.percentage}%
                    </Badge>
                    
                    <Grid templateColumns="repeat(auto-fit, minmax(150px, 1fr))" gap={6} w="100%">
                        <GridItem textAlign="center">
                            <Text fontSize="sm" color={textColor}>Questions Answered</Text>
                            <Text fontSize="xl" fontWeight="bold" color={primaryTextColor}>
                                {summary.answeredQuestions} / {summary.totalQuestions}
                            </Text>
                        </GridItem>
                        <GridItem textAlign="center">
                            <Text fontSize="sm" color={textColor}>Correct Answers</Text>
                            <Text fontSize="xl" fontWeight="bold" color="green.500">
                                {summary.correctAnswers}
                            </Text>
                        </GridItem>
                        <GridItem textAlign="center">
                            <Text fontSize="sm" color={textColor}>Total Score</Text>
                            <Text fontSize="xl" fontWeight="bold" color={primaryTextColor}>
                                {summary.totalScore} / {summary.answeredQuestions * 100}
                            </Text>
                        </GridItem>
                        <GridItem textAlign="center">
                            <Text fontSize="sm" color={textColor}>Duration</Text>
                            <Text fontSize="xl" fontWeight="bold" color={primaryTextColor}>
                                {formatDuration(summary.duration)}
                            </Text>
                        </GridItem>
                    </Grid>
                </VStack>
            </Box>

            {/* Question Details */}
            <Box 
                p={6} 
                borderWidth={1} 
                borderRadius="lg" 
                shadow="md" 
                bg={boxBg} 
                borderColor={borderColor}
            >
                <Heading size="md" mb={4} color={primaryTextColor}>Question Details</Heading>
                
                <VStack gap={4} align="stretch">
                    {session.questions.map((question, index) => {
                        const userAnswer = session.userAnswers.find(answer => answer.questionId === question.id);
                        const isAnswered = !!userAnswer;
                        const isCorrect = userAnswer?.isCorrect || false;
                        const score = userAnswer?.score || 0;
                        
                        return (
                            <Box 
                                key={question.id}
                                p={4} 
                                border="2px" 
                                borderColor={isAnswered ? (isCorrect ? useColorModeValue("green.200", "green.600") : useColorModeValue("red.200", "red.600")) : borderColor} 
                                borderRadius="md"
                                bg={useColorModeValue("gray.50", "gray.700")}
                            >
                                <Flex justifyContent="space-between" alignItems="center">
                                    <HStack>
                                        <Text fontWeight="semibold" color={primaryTextColor}>
                                            Question {index + 1}
                                        </Text>
                                        <Badge colorScheme={getDifficultyColor(question.difficulty)}>
                                            {question.difficulty}
                                        </Badge>
                                        <Text fontSize="sm" color={textColor}>
                                            {question.algorithm}
                                            {question.quantum && ` (Q=${question.quantum})`}
                                        </Text>
                                    </HStack>
                                    
                                    <HStack>
                                        {isAnswered ? (
                                            <>
                                                <Badge colorScheme={isCorrect ? "green" : "red"}>
                                                    {score}/100
                                                </Badge>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => onViewQuestion(index)}
                                                    color={primaryTextColor}
                                                    borderColor={borderColor}
                                                    _hover={{ bg: useColorModeValue("gray.50", "gray.600") }}
                                                >
                                                    Review
                                                </Button>
                                            </>
                                        ) : (
                                            <Badge colorScheme="gray">
                                                Not Answered
                                            </Badge>
                                        )}
                                    </HStack>
                                </Flex>
                            </Box>
                        );
                    })}
                </VStack>
            </Box>

            {/* Test Configuration Summary */}
            <Box 
                p={6} 
                borderWidth={1} 
                borderRadius="lg" 
                shadow="md" 
                bg={boxBg} 
                borderColor={borderColor}
            >
                <Heading size="md" mb={4} color={primaryTextColor}>Test Configuration</Heading>
                
                <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
                    <GridItem>
                        <Text fontSize="sm" color={textColor}>Difficulty Level</Text>
                        <Badge colorScheme={getDifficultyColor(session.config.difficulty)} fontSize="md">
                            {session.config.difficulty.toUpperCase()}
                        </Badge>
                    </GridItem>
                    <GridItem>
                        <Text fontSize="sm" color={textColor}>Total Questions</Text>
                        <Text fontSize="lg" fontWeight="semibold" color={primaryTextColor}>{session.config.numQuestions}</Text>
                    </GridItem>
                    <GridItem>
                        <Text fontSize="sm" color={textColor}>Test Type</Text>
                        <Text fontSize="lg" fontWeight="semibold" color={primaryTextColor}>CPU Scheduling</Text>
                    </GridItem>
                    <GridItem>
                        <Text fontSize="sm" color={textColor}>Started</Text>
                        <Text fontSize="lg" fontWeight="semibold" color={primaryTextColor}>
                            {session.startTime.toLocaleString()}
                        </Text>
                    </GridItem>
                </Grid>
            </Box>

            {/* Actions */}
            <Flex justifyContent="center" gap={4} mt={6}>
                <Button 
                    colorScheme="blue" 
                    size="lg"
                    onClick={onRestart}
                >
                    Take Another Test
                </Button>
            </Flex>
        </Flex>
    );
};

export default TestResults;
