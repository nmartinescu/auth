import { Box, Text } from "@chakra-ui/react";
import { useColorModeValue } from "./color-mode";
import type { FormFieldProps } from "../../types/auth";

export function FormField({ label, icon, children }: FormFieldProps) {
  const labelColor = useColorModeValue("gray.600", "gray.300");

  return (
    <Box w="full">
      <Text
        fontSize="sm"
        fontWeight="medium"
        color={labelColor}
        mb={2}
        display="flex"
        alignItems="center"
        gap={2}
      >
        {icon}
        {label}
      </Text>
      {children}
    </Box>
  );
}