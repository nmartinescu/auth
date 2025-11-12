import { Box, Flex, Heading, Badge } from "@chakra-ui/react";
import { useTestGenColors, getDifficultyColor } from "../../colors";
import type { QuestionHeaderProps } from "../../types";

const QuestionHeader = ({ questionNumber, totalQuestions, difficulty }: QuestionHeaderProps) => {
    const { primaryTextColor, progressBg } = useTestGenColors();
    const progress = (questionNumber / totalQuestions) * 100;
    return (
        <Box>
            <Flex justifyContent="space-between" alignItems="center" mb={4}>
                <Heading size="lg" color={primaryTextColor}>Question {questionNumber} of {totalQuestions}</Heading>
                <Badge colorScheme={getDifficultyColor(difficulty)} fontSize="md" px={3} py={1} borderRadius="md">{difficulty.toUpperCase()}</Badge>
            </Flex>
            <Box h="4px" bg={progressBg} borderRadius="md" mb={4}>
                <Box h="100%" bg="blue.500" borderRadius="md" width={`${progress}%`} transition="width 0.3s ease-in-out" />
            </Box>
        </Box>
    );
};

export default QuestionHeader;
