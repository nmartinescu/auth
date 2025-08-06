import type { ButtonProps } from "@chakra-ui/react";
import { useColorModeValue } from "./color-mode";

// Base input styling function that supports dark mode
export const getInputStyle = () => {
  const borderColor = useColorModeValue("#E5E7EB", "#4A5568");
  const hoverBorderColor = useColorModeValue("#9CA3AF", "#718096");
  const placeholderColor = useColorModeValue("#9CA3AF", "#A0AEC0");
  
  return {
    borderBottom: `3px solid ${borderColor}`,
    borderRight: `3px solid ${borderColor}`,
    borderRadius: "md",
    bg: useColorModeValue("white", "#2D3748"),
    color: useColorModeValue("#1A202C", "#F7FAFC"),
    borderColor: borderColor,
    _hover: {
      borderColor: hoverBorderColor,
    },
    _placeholder: {
      color: placeholderColor,
    },
  };
};

// Input style with custom focus color
export const createInputStyle = (focusColor: string) => {
  const baseStyle = getInputStyle();
  return {
    ...baseStyle,
    _focus: {
      borderColor: focusColor,
      boxShadow: `0 0 0 1px ${focusColor}`,
    },
  };
};

// Legacy input style for backward compatibility
export const inputStyle = {
  borderBottom: "3px solid #E5E7EB",
  borderRight: "3px solid #E5E7EB",
  borderRadius: "md",
  _hover: {
    borderColor: "#9CA3AF",
  },
};

// Base button styling
const baseButtonStyle: ButtonProps = {
  variant: "solid",
  size: "lg",
  width: "100%",
  color: "white",
  _hover: {
    scale: 0.98,
  },
};

// Primary button (login) - blue theme
export const primaryButtonStyle: ButtonProps = {
  ...baseButtonStyle,
  bg: "#3B82F6",
  borderBottom: "3px solid #1E40AF",
  borderRight: "3px solid #1E40AF",
  _hover: {
    ...baseButtonStyle._hover,
    bg: "#2563EB",
  },
  _active: {
    bg: "#1D4ED8",
  },
};

// Success button (register) - green theme
export const successButtonStyle: ButtonProps = {
  ...baseButtonStyle,
  bg: "#10B981",
  borderBottom: "3px solid #059669",
  borderRight: "3px solid #059669",
  _hover: {
    ...baseButtonStyle._hover,
    bg: "#059669",
  },
  _active: {
    bg: "#047857",
  },
};

// Toggle button for password visibility with dark mode support
export const getToggleButtonStyle = (): ButtonProps => {
  const textColor = useColorModeValue("gray.500", "gray.400");
  const hoverBg = useColorModeValue("gray.100", "gray.600");
  
  return {
    variant: "ghost",
    size: "sm",
    color: textColor,
    _hover: {
      bg: hoverBg,
    },
  };
};

// Legacy toggle button style
export const toggleButtonStyle: ButtonProps = {
  variant: "ghost",
  size: "sm",
  color: "gray.500",
  _hover: {
    bg: "gray.100",
  },
};

// Container styling
export const authContainerStyle = {
  minH: "100vh",
  align: "center" as const,
  justify: "center" as const,
  p: 4,
};

// Auth box styling function that supports dark mode
export const getAuthBoxStyle = () => {
  const borderColor = useColorModeValue("#E5E7EB", "#4A5568");
  const shadow = useColorModeValue("lg", "dark-lg");
  
  return {
    w: "full",
    maxW: "400px",
    p: 8,
    borderRadius: "lg",
    borderBottom: `5px solid ${borderColor}`,
    borderRight: `5px solid ${borderColor}`,
    boxShadow: shadow,
  };
};

// Legacy auth box style for backward compatibility
export const authBoxStyle = {
  w: "full",
  maxW: "400px",
  p: 8,
  borderRadius: "lg",
  borderBottom: "5px solid #E5E7EB",
  borderRight: "5px solid #E5E7EB",
  boxShadow: "lg",
};

// Theme colors
export const authTheme = {
  primary: {
    main: "#3B82F6",
    focus: "#3B82F6",
    link: "blue.500",
  },
  success: {
    main: "#10B981",
    focus: "#10B981",
    link: "green.500",
  },
} as const;