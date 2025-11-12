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
    selectBg: useColorModeValue("white", "gray.700"),
  };
};
