import { Box, Flex, Text, Badge } from "@chakra-ui/react";
import { useTestGenColors } from "../../colors.tsx";
import type { DifficultySelectorProps } from '../../types.ts';

export const DifficultySelector = ({
    difficulty,
    onDifficultyChange
}: DifficultySelectorProps) => {
    const {
        labelColor,
        borderColor,
        boxBg,
        hoverBg,
        primaryTextColor
    } = useTestGenColors();

    return (
        <Box>
            <Flex mb={2} alignItems="center" justifyContent="space-between">
                <Text fontSize="sm" fontWeight="semibold" color={labelColor}>
                    Difficulty Level
                </Text>
                <Badge 
                    colorScheme={
                        difficulty === 'easy' ? 'green' : 
                        difficulty === 'medium' ? 'orange' : 
                        'red'
                    }
                    fontSize="xs"
                    px={3}
                    py={1}
                    borderRadius="md"
                    textTransform="capitalize"
                    fontWeight="medium"
                >
                    {difficulty}
                </Badge>
            </Flex>
            <Flex gap={3} flexDirection={{ base: "column", md: "row" }}>
                <Box
                    as="button"
                    flex="1"
                    minW={{ base: "auto", sm: "100px" }}
                    px={4}
                    py={3}
                    borderRadius="md"
                    borderWidth="2px"
                    borderColor={difficulty === 'easy' ? 'green.500' : borderColor}
                    bg={difficulty === 'easy' ? 'green.50' : boxBg}
                    color={difficulty === 'easy' ? 'green.700' : primaryTextColor}
                    fontWeight="semibold"
                    fontSize="sm"
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{
                        borderColor: 'green.400',
                        bg: difficulty === 'easy' ? 'green.100' : hoverBg,
                        transform: 'translateY(-1px)'
                    }}
                    _active={{
                        transform: 'translateY(0)'
                    }}
                    onClick={() => onDifficultyChange('easy')}
                >
                    Easy
                </Box>
                <Box
                    as="button"
                    flex="1"
                    minW={{ base: "auto", sm: "100px" }}
                    px={4}
                    py={3}
                    borderRadius="md"
                    borderWidth="2px"
                    borderColor={difficulty === 'medium' ? 'orange.500' : borderColor}
                    bg={difficulty === 'medium' ? 'orange.50' : boxBg}
                    color={difficulty === 'medium' ? 'orange.700' : primaryTextColor}
                    fontWeight="semibold"
                    fontSize="sm"
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{
                        borderColor: 'orange.400',
                        bg: difficulty === 'medium' ? 'orange.100' : hoverBg,
                        transform: 'translateY(-1px)'
                    }}
                    _active={{
                        transform: 'translateY(0)'
                    }}
                    onClick={() => onDifficultyChange('medium')}
                >
                    Medium
                </Box>
                <Box
                    as="button"
                    flex="1"
                    minW={{ base: "auto", sm: "100px" }}
                    px={4}
                    py={3}
                    borderRadius="md"
                    borderWidth="2px"
                    borderColor={difficulty === 'hard' ? 'red.500' : borderColor}
                    bg={difficulty === 'hard' ? 'red.50' : boxBg}
                    color={difficulty === 'hard' ? 'red.700' : primaryTextColor}
                    fontWeight="semibold"
                    fontSize="sm"
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{
                        borderColor: 'red.400',
                        bg: difficulty === 'hard' ? 'red.100' : hoverBg,
                        transform: 'translateY(-1px)'
                    }}
                    _active={{
                        transform: 'translateY(0)'
                    }}
                    onClick={() => onDifficultyChange('hard')}
                >
                    Hard
                </Box>
            </Flex>
        </Box>
    );
};
