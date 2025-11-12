import type { ChangeEvent } from "react";
import { Box, Flex, Text, Input, Badge } from "@chakra-ui/react";
import { useTestGenColors } from "../../colors.tsx";
import type { QuestionCountInputProps } from '../../types.ts';

export const QuestionCountInput = ({
    numQuestions,
    questionsError,
    onNumQuestionsChange,
    onBlur
}: QuestionCountInputProps) => {
    const {
        labelColor,
        borderColor,
        errorColor,
        primaryTextColor
    } = useTestGenColors();

    return (
        <Box>
            <Flex alignItems="center" justifyContent="space-between" mb={2}>
                <Text fontSize="sm" fontWeight="semibold" color={labelColor}>
                    Number of Questions
                </Text>
                <Badge 
                    colorScheme="blue" 
                    fontSize="xs" 
                    px={3} 
                    py={1} 
                    borderRadius="md"
                    fontWeight="medium"
                >
                    {numQuestions} {parseInt(numQuestions) === 1 ? 'question' : 'questions'}
                </Badge>
            </Flex>
            <Input 
                type="number" 
                value={numQuestions} 
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const value = e.target.value;
                    if (value === '' || parseInt(value) < 1) {
                        onNumQuestionsChange('1');
                    } else if (parseInt(value) > 10) {
                        onNumQuestionsChange('10');
                    } else {
                        onNumQuestionsChange(value);
                    }
                }}
                onBlur={onBlur}
                placeholder="Enter number (1-10)"
                borderColor={questionsError ? errorColor : borderColor}
                _focus={{ 
                    borderColor: questionsError ? errorColor : "blue.500",
                    shadow: "0 0 0 1px " + (questionsError ? errorColor : "blue.500")
                }}
                _hover={{ borderColor: questionsError ? errorColor : "blue.300" }}
                min={1}
                max={10}
                color={primaryTextColor}
                size="lg"
                fontWeight="medium"
            />
            {questionsError && (
                <Text color={errorColor} fontSize="sm" mt={2} fontWeight="medium">
                    Please enter between 1 and 10 questions
                </Text>
            )}
        </Box>
    );
};
