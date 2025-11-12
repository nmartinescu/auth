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
import { useColorModeValue } from "../../ui/color-mode";
import { testSessionManager } from "../../../services/testSessionManager";
import type { TestPageProps, TestConfig } from '../types.ts';

const TestPage: React.FC<TestPageProps> = ({ onTestStart }) => {
    const [includeScheduling, setIncludeScheduling] = useState(true);
    const [includeMemory, setIncludeMemory] = useState(false);
    const [includeDisk, setIncludeDisk] = useState(false);
    const [numQuestions, setNumQuestions] = useState("5");
    const [difficulty, setDifficulty] = useState("easy");
    const [touched, setTouched] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const questionsError =
        (includeScheduling || includeMemory || includeDisk) && touched && (!numQuestions || parseInt(numQuestions, 10) < 1);
    
    const handleStartTest = async () => {
        if (!includeScheduling && !includeMemory && !includeDisk) {
            setError("Please select at least one test type (scheduling, memory, or disk).");
            return;
        }

        if (questionsError) {
            setTouched(true);
            return;
        }

        setIsStarting(true);
        setError(null);

        try {
            const config: TestConfig = {
                includeScheduling,
                includeMemory,
                includeDisk,
                numQuestions: parseInt(numQuestions, 10),
                difficulty: difficulty as 'easy' | 'medium' | 'hard'
            };

            const session = await testSessionManager.startTest(config);
            
            if (onTestStart) {
                onTestStart(session.id);
            }
        } catch (err) {
            console.error('Failed to start test:', err);
            setError('Failed to start test. Please try again.');
        } finally {
            setIsStarting(false);
        }
    };

    // UI Colors
    const boxBg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const errorColor = useColorModeValue("red.500", "red.300");
    const labelColor = useColorModeValue("gray.600", "gray.300");
    const errorBg = useColorModeValue("red.50", "red.900");
    const errorBorderColor = useColorModeValue("red.200", "red.600");
    const primaryTextColor = useColorModeValue("gray.900", "white");
    const selectBg = useColorModeValue("white", "gray.700");

    return (
        <Flex
            maxW="1200px"
            w="90%"
            mx="auto"
            flexDirection="column"
            gap="10"
            mt="10"
            mb="10"
        >
            <Heading size="lg" mb={6} color={primaryTextColor}>Test Configuration</Heading>
            
            <Box 
                p={6} 
                borderWidth={1} 
                borderRadius="lg" 
                shadow="md" 
                bg={boxBg} 
                borderColor={borderColor}
            >
                <Flex direction="column" gap={5}>
                    {error && (
                        <Box p={4} borderRadius="md" bg={errorBg} border="1px solid" borderColor={errorBorderColor}>
                            <Text color={errorColor} fontSize="sm">
                                {error}
                            </Text>
                        </Box>
                    )}

                    <Box>
                        <label>
                            <Flex alignItems="center" gap={2}>
                                <input 
                                    type="checkbox" 
                                    checked={includeScheduling} 
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setIncludeScheduling(e.target.checked)}
                                    style={{ marginRight: '8px' }}
                                />
                                <Text color={primaryTextColor}>Include scheduling questions</Text>
                            </Flex>
                        </label>
                    </Box>

                    <Box>
                        <label>
                            <Flex alignItems="center" gap={2}>
                                <input 
                                    type="checkbox" 
                                    checked={includeMemory} 
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setIncludeMemory(e.target.checked)}
                                    style={{ marginRight: '8px' }}
                                />
                                <Text color={primaryTextColor}>Include memory management questions</Text>
                            </Flex>
                        </label>
                    </Box>

                    <Box>
                        <label>
                            <Flex alignItems="center" gap={2}>
                                <input 
                                    type="checkbox" 
                                    checked={includeDisk} 
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setIncludeDisk(e.target.checked)}
                                    style={{ marginRight: '8px' }}
                                />
                                <Text color={primaryTextColor}>Include disk scheduling questions</Text>
                            </Flex>
                        </label>
                    </Box>

                    {(includeScheduling || includeMemory || includeDisk) && (
                        <Box>
                            <Text fontSize="sm" fontWeight="medium" color={labelColor} mb={2}>
                                Number of questions
                            </Text>
                            <Input 
                                type="number" 
                                value={numQuestions} 
                                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                    const value = e.target.value;
                                    // Prevent empty values, set minimum to 1
                                    if (value === '' || parseInt(value) < 1) {
                                        setNumQuestions('1');
                                    } else if (parseInt(value) > 10) {
                                        setNumQuestions('10');
                                    } else {
                                        setNumQuestions(value);
                                    }
                                }}
                                onBlur={() => {
                                    setTouched(true);
                                    // Ensure we have a valid value on blur
                                    if (!numQuestions || parseInt(numQuestions) < 1) {
                                        setNumQuestions('1');
                                    }
                                }}
                                placeholder="Enter number of questions (1-10)"
                                borderColor={questionsError ? errorColor : undefined}
                                _focus={{ borderColor: questionsError ? errorColor : "blue.500" }}
                                min={1}
                                max={10}
                                color={primaryTextColor}
                            />
                            {questionsError && (
                                <Text color={errorColor} fontSize="sm" mt={1}>
                                    Please enter a valid number of questions (1-10)
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
                                backgroundColor: selectBg,
                                borderColor: borderColor,
                                color: "black",
                                border: `1px solid ${borderColor}`
                            }}
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                        >
                            <option value="easy" style={{ backgroundColor: selectBg, color: "black" }}>Easy</option>
                            <option value="medium" style={{ backgroundColor: selectBg, color: "black" }}>Medium</option>
                            <option value="hard" style={{ backgroundColor: selectBg, color: "black" }}>Hard</option>
                        </select>
                    </Box>

                    <Button 
                        colorScheme="blue" 
                        onClick={handleStartTest}
                        disabled={(!includeScheduling && !includeMemory && !includeDisk) || ((includeScheduling || includeMemory || includeDisk) && questionsError) || isStarting}
                        mt={4}
                    >
                        {isStarting ? "Generating questions..." : "Start Test"}
                    </Button>
                </Flex>
            </Box>
        </Flex>
    );
};

export default TestPage;
