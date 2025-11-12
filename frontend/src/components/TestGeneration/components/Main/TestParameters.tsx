import { Box, Flex, Text } from "@chakra-ui/react";
import { useTestGenColors } from "../../colors.tsx";
import { QuestionCountInput } from "./QuestionCountInput.tsx";
import { DifficultySelector } from "./DifficultySelector.tsx";
import type { TestParametersProps } from "../../types.ts";

export const TestParameters = ({
    numQuestions,
    difficulty,
    questionsError,
    onNumQuestionsChange,
    onDifficultyChange,
    onBlur
}: TestParametersProps) => {
    const {
        cardBg,
        borderColor,
        primaryTextColor
    } = useTestGenColors();

    return (
        <Box
            p={6}
            borderRadius="lg"
            bg={cardBg}
            borderWidth={1}
            borderColor={borderColor}
        >
            <Text 
                fontSize="lg" 
                fontWeight="semibold" 
                color={primaryTextColor} 
                mb={4}
                letterSpacing="tight"
            >
                Parameters
            </Text>

            <Flex direction="column" gap={5}>
                <QuestionCountInput
                    numQuestions={numQuestions}
                    questionsError={questionsError}
                    onNumQuestionsChange={onNumQuestionsChange}
                    onBlur={onBlur}
                />
                
                <DifficultySelector
                    difficulty={difficulty}
                    onDifficultyChange={onDifficultyChange}
                />
            </Flex>
        </Box>
    );
};
