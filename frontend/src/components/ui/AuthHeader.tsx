import { Flex, Heading, Text } from "@chakra-ui/react";
import { useColorModeValue } from "./color-mode";
import type { AuthHeaderProps } from "../../types/auth";

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  const titleColor = useColorModeValue("#111827", "#F7FAFC");
  const subtitleColor = useColorModeValue("gray.600", "gray.300");

  return (
    <Flex direction="column" align="center" mb={8}>
      <Heading
        size="lg"
        fontWeight="semibold"
        color={titleColor}
        mb={2}
      >
        {title}
      </Heading>
      <Text color={subtitleColor} textAlign="center">
        {subtitle}
      </Text>
    </Flex>
  );
}