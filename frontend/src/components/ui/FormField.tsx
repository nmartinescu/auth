import { Box, Text } from "@chakra-ui/react";
import type { FormFieldProps } from "../../types/auth";

export function FormField({ label, icon, children }: FormFieldProps) {
  return (
    <Box w="full">
      <Text
        fontSize="sm"
        fontWeight="medium"
        color="gray.600"
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