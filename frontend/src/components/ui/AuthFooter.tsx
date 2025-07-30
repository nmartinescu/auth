import { Flex, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import type { AuthFooterProps } from "../../types/auth";

export function AuthFooter({ 
  linkText, 
  linkTo, 
  linkLabel, 
  linkColor = "blue.500",
  additionalText 
}: AuthFooterProps) {
  return (
    <Flex direction="column" align="center" gap={3} mt={6}>
      <Text fontSize="sm" color="gray.500" textAlign="center">
        {linkText}{" "}
        <Link to={linkTo}>
          <Text
            as="span"
            color={linkColor}
            cursor="pointer"
            _hover={{ textDecoration: "underline" }}
          >
            {linkLabel}
          </Text>
        </Link>
      </Text>
      {additionalText && (
        <Text fontSize="sm" color="gray.400" textAlign="center">
          {additionalText}
        </Text>
      )}
    </Flex>
  );
}