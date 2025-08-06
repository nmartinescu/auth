import { Flex, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useColorModeValue } from "./color-mode";
import type { AuthFooterProps } from "../../types/auth";

export function AuthFooter({ 
  linkText, 
  linkTo, 
  linkLabel, 
  linkColor = "blue.500",
  additionalText 
}: AuthFooterProps) {
  const textColor = useColorModeValue("gray.500", "gray.400");
  const additionalTextColor = useColorModeValue("gray.400", "gray.500");
  const dynamicLinkColor = useColorModeValue(linkColor, linkColor === "blue.500" ? "#63B3ED" : "#68D391");

  return (
    <Flex direction="column" align="center" gap={3} mt={6}>
      <Text fontSize="sm" color={textColor} textAlign="center">
        {linkText}{" "}
        <Link to={linkTo}>
          <Text
            as="span"
            color={dynamicLinkColor}
            cursor="pointer"
            _hover={{ textDecoration: "underline" }}
          >
            {linkLabel}
          </Text>
        </Link>
      </Text>
      {additionalText && (
        <Text fontSize="sm" color={additionalTextColor} textAlign="center">
          {additionalText}
        </Text>
      )}
    </Flex>
  );
}