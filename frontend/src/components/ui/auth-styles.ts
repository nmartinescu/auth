import type { ButtonProps } from "@chakra-ui/react";

// Base input styling
export const inputStyle = {
  borderBottom: "3px solid #E5E7EB",
  borderRight: "3px solid #E5E7EB",
  borderRadius: "md",
  _hover: {
    borderColor: "#9CA3AF",
  },
};

// Input style with custom focus color
export const createInputStyle = (focusColor: string) => ({
  ...inputStyle,
  _focus: {
    borderColor: focusColor,
    boxShadow: `0 0 0 1px ${focusColor}`,
  },
});

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

// Toggle button for password visibility
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