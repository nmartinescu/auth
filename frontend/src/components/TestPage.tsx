import React, { useState } from "react";
import type { ChangeEvent } from "react";
import { 
    Box, 
    Flex, 
    Heading, 
    Input, 
    Button, 
    Text
} from "@chakra-ui/react";
import { useColorModeValue } from "./ui/color-mode";

const TestPage: React.FC = () => {
    const [includeScheduling, setIncludeScheduling] = useState(false);
    const [numQuestions, setNumQuestions] = useState("");
    const [difficulty, setDifficulty] = useState("easy");
    const [touched, setTouched] = useState(false);

    const questionsError =
        includeScheduling && touched && (!numQuestions || parseInt(numQuestions, 10) < 1);
    
    const handleStartTest = () => {
        console.log({
            includeScheduling,
            numQuestions: includeScheduling ? parseInt(numQuestions, 10) : null,
            difficulty
        });
    };

    // UI Colors
    const boxBg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const errorColor = useColorModeValue("red.500", "red.300");
    const labelColor = useColorModeValue("gray.600", "gray.300");

    return (
        <Flex
            maxW="1200px"
            w="90%"
            mx="auto"
            flexDirection="column"
            gap="10"
            mt="10"
        >
            <Heading size="lg" mb={6}>Test Configuration</Heading>
            
            <Box 
                p={6} 
                borderWidth={1} 
                borderRadius="lg" 
                shadow="md" 
                bg={boxBg} 
                borderColor={borderColor}
            >
                <Flex direction="column" gap={5}>
                    <Box>
                        <label>
                            <Flex alignItems="center" gap={2}>
                                <input 
                                    type="checkbox" 
                                    checked={includeScheduling} 
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setIncludeScheduling(e.target.checked)}
                                    style={{ marginRight: '8px' }}
                                />
                                <Text>Include scheduling questions</Text>
                            </Flex>
                        </label>
                    </Box>

                    {includeScheduling && (
                        <Box>
                            <Text fontSize="sm" fontWeight="medium" color={labelColor} mb={2}>
                                Number of questions
                            </Text>
                            <Input 
                                type="number" 
                                value={numQuestions} 
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setNumQuestions(e.target.value)}
                                onBlur={() => setTouched(true)}
                                placeholder="Enter number of questions"
                                borderColor={questionsError ? errorColor : undefined}
                                _focus={{ borderColor: questionsError ? errorColor : "blue.500" }}
                                min={1}
                            />
                            {questionsError && (
                                <Text color={errorColor} fontSize="sm" mt={1}>
                                    Please enter a valid number of questions (minimum 1)
                                </Text>
                            )}
                        </Box>
                    )}

                    <Box>
                        <Text fontSize="sm" fontWeight="medium" color={labelColor} mb={2}>
                            Difficulty level
                        </Text>
                        <select
                            style={{
                                width: "100%",
                                padding: "8px",
                                borderWidth: "1px",
                                borderRadius: "0.375rem",
                                backgroundColor: boxBg,
                                borderColor: borderColor
                            }}
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                        >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </Box>

                    <Button 
                        colorScheme="blue" 
                        onClick={handleStartTest}
                        disabled={includeScheduling && questionsError}
                        mt={4}
                    >
                        Start Test
                    </Button>
                </Flex>
            </Box>
        </Flex>
    );
};

export default TestPage;
