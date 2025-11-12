import { useColorModeValue } from "../ui/color-mode";
import type { QuestionColors } from "./types";

export const useTestGenColors = () => ({
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
  textColor: useColorModeValue("gray.600", "gray.300"),
  headerBg: useColorModeValue("gray.50", "gray.700"),
  headerTextColor: useColorModeValue("gray.700", "gray.200"),
  valueColor: useColorModeValue("blue.600", "blue.300"),
  progressBg: useColorModeValue("gray.200", "gray.600"),
});

export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case "easy": return "green";
    case "medium": return "yellow";
    case "hard": return "red";
    default: return "gray";
  }
};

export const useQuestionColors = (): QuestionColors => ({
  boxBg: useColorModeValue("white", "gray.800"),
  borderColor: useColorModeValue("gray.200", "gray.600"),
  headerBg: useColorModeValue("gray.50", "gray.700"),
  textColor: useColorModeValue("gray.600", "gray.300"),
  valueColor: useColorModeValue("blue.600", "blue.300"),
  primaryTextColor: useColorModeValue("gray.900", "white"),
  headerTextColor: useColorModeValue("gray.700", "gray.200"),
  progressBg: useColorModeValue("gray.200", "gray.600")
});