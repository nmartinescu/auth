import { Flex, Heading, Text } from "@chakra-ui/react";
import type { AuthHeaderProps } from "../../types/auth";

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <Flex direction="column" align="center" mb={8}>
      <Heading
        size="lg"
        fontWeight="semibold"
        color="#111827"
        mb={2}
      >
        {title}
      </Heading>
      <Text color="gray.600" textAlign="center">
        {subtitle}
      </Text>
    </Flex>
  );
}