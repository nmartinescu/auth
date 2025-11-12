import type { ChangeEvent } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { useTestGenColors } from "../../colors.tsx";
import type { TopicSelectorProps } from "../../types.ts";

export const TopicSelector = ({
    includeScheduling,
    includeMemory,
    includeDisk,
    onSchedulingChange,
    onMemoryChange,
    onDiskChange
}: TopicSelectorProps) => {
    const {
        primaryTextColor,
        sectionBg,
        sectionBorderColor,
        hoverBg
    } = useTestGenColors();

    return (
        <Box 
            p={6} 
            borderRadius="lg" 
            bg={sectionBg} 
            borderWidth={1}
            borderColor={sectionBorderColor}
        >
            <Text 
                fontSize="lg" 
                fontWeight="semibold" 
                color={primaryTextColor} 
                mb={4}
                letterSpacing="tight"
            >
                Topics
            </Text>
            
            <Flex direction="column" gap={3}>
                <Box
                    as="label"
                    display="flex"
                    alignItems="center"
                    gap={3}
                    p={3}
                    borderRadius="md"
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{ bg: hoverBg }}
                >
                    <input
                        type="checkbox"
                        checked={includeScheduling}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => onSchedulingChange(e.target.checked)}
                        style={{
                            width: '20px',
                            height: '20px',
                            cursor: 'pointer',
                            accentColor: '#3182ce'
                        }}
                    />
                    <Text color={primaryTextColor} fontWeight="medium" fontSize="md">
                        CPU Scheduling
                    </Text>
                </Box>

                <Box
                    as="label"
                    display="flex"
                    alignItems="center"
                    gap={3}
                    p={3}
                    borderRadius="md"
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{ bg: hoverBg }}
                >
                    <input
                        type="checkbox"
                        checked={includeMemory}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => onMemoryChange(e.target.checked)}
                        style={{
                            width: '20px',
                            height: '20px',
                            cursor: 'pointer',
                            accentColor: '#3182ce'
                        }}
                    />
                    <Text color={primaryTextColor} fontWeight="medium" fontSize="md">
                        Memory Management
                    </Text>
                </Box>

                <Box
                    as="label"
                    display="flex"
                    alignItems="center"
                    gap={3}
                    p={3}
                    borderRadius="md"
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{ bg: hoverBg }}
                >
                    <input
                        type="checkbox"
                        checked={includeDisk}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => onDiskChange(e.target.checked)}
                        style={{
                            width: '20px',
                            height: '20px',
                            cursor: 'pointer',
                            accentColor: '#3182ce'
                        }}
                    />
                    <Text color={primaryTextColor} fontWeight="medium" fontSize="md">
                        Disk Scheduling
                    </Text>
                </Box>
            </Flex>
        </Box>
    );
};
