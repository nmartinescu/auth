import { Box, Heading, VStack, Flex, HStack, Text, Badge, Button } from "@chakra-ui/react";
import { useColorModeValue } from "../../../ui/color-mode";
import { getDifficultyColor } from "../../colors";
import type { QuestionDetailsProps } from "../../types";

const QuestionDetails = ({
  session,
  onViewQuestion,
  boxBg,
  borderColor,
  textColor,
  primaryTextColor
}: QuestionDetailsProps) => {
  return (
    <Box
      p={6}
      borderWidth={1}
      borderRadius="lg"
      shadow="md"
      bg={boxBg}
      borderColor={borderColor}
    >
      <Heading size="md" mb={4} color={primaryTextColor}>
        Question Details
      </Heading>

      <VStack gap={4} align="stretch">
        {session.questions.map((question, index) => {
          const userAnswer = session.userAnswers.find(
            (answer) => answer.questionId === question.id
          );
          const isAnswered = !!userAnswer;
          const isCorrect = userAnswer?.isCorrect || false;
          const score = userAnswer?.score || 0;

          return (
            <Box
              key={question.id}
              p={4}
              border="2px"
              borderColor={
                isAnswered
                  ? isCorrect
                    ? useColorModeValue("green.200", "green.600")
                    : useColorModeValue("red.200", "red.600")
                  : borderColor
              }
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
                        borderRadius="full"
                        px={5}
                        _hover={{
                          bg: useColorModeValue("gray.50", "gray.600"),
                          transform: "translateY(-1px)",
                          boxShadow: "sm"
                        }}
                        _active={{
                          transform: "translateY(0)"
                        }}
                        transition="all 0.2s"
                      >
                        Review
                      </Button>
                    </>
                  ) : (
                    <Badge colorScheme="gray">Not Answered</Badge>
                  )}
                </HStack>
              </Flex>
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
};

export default QuestionDetails;
