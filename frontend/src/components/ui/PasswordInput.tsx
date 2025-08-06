import { Button, Input, Box } from "@chakra-ui/react";
import { useState } from "react";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { getToggleButtonStyle, createInputStyle } from "./auth-styles";
import type { PasswordInputProps } from "../../types/auth";

export function PasswordInput({ 
  placeholder, 
  value, 
  onChange, 
  required = false, 
  minLength,
  focusColor = "#3B82F6"
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputStyleWithFocus = createInputStyle(focusColor);

  return (
    <Box position="relative">
      <Input
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        minLength={minLength}
        pr={12}
        {...inputStyleWithFocus}
      />
      <Button
        {...getToggleButtonStyle()}
        position="absolute"
        right={2}
        top="50%"
        transform="translateY(-50%)"
        onClick={() => setShowPassword(!showPassword)}
        type="button"
      >
        {showPassword ? <LuEyeOff /> : <LuEye />}
      </Button>
    </Box>
  );
}