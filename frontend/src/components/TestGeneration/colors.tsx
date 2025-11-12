import { useColorModeValue } from "../ui/color-mode";

export const useTestGenColors = () => {
  return {
    boxBg: useColorModeValue("white", "gray.800"),
    borderColor: useColorModeValue("gray.200", "gray.600"),
    errorColor: useColorModeValue("red.500", "red.300"),
    labelColor: useColorModeValue("gray.600", "gray.300"),
    errorBg: useColorModeValue("red.50", "red.900"),
    errorBorderColor: useColorModeValue("red.200", "red.600"),
    primaryTextColor: useColorModeValue("gray.900", "white"),
    cardBg: useColorModeValue("gray.50", "gray.750"),
    hoverBg: useColorModeValue("gray.50", "gray.700"),
    sectionBg: useColorModeValue("blue.50", "blue.900"),
    sectionBorderColor: useColorModeValue("blue.200", "blue.700"),
    secondaryTextColor: useColorModeValue("gray.600", "gray.400"),
  };
};
