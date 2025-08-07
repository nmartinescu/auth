import { Button, Flex, IconButton } from "@chakra-ui/react";
import { useColorModeValue } from "./color-mode";
import type {
    ActionButtonProps,
    FormActionButtonsProps,
    ActionButtonGroupProps,
} from "../../types/FormActionButtons";

// Reusable styled action button
export function ActionButton({
    onClick,
    icon,
    disabled = false,
    size = "sm",
    "aria-label": ariaLabel,
    ...props
}: ActionButtonProps) {
    const borderColor = useColorModeValue("#E5E7EB", "#4A5568");
    const iconColor = useColorModeValue("gray.600", "gray.300");
    const buttonHoverBg = useColorModeValue("gray.50", "gray.700");

    return (
        <Button
            variant="outline"
            size={size}
            borderBottom={`3px solid ${borderColor}`}
            borderRight={`3px solid ${borderColor}`}
            onClick={onClick}
            color={iconColor}
            disabled={disabled}
            aria-label={ariaLabel}
            _hover={{ bg: buttonHoverBg }}
            _disabled={{
                opacity: 0.6,
                cursor: "not-allowed",
                _hover: { bg: "transparent" },
            }}
            {...props}
        >
            {icon}
        </Button>
    );
}

// Reusable delete button for table rows
export function DeleteButton({
    onClick,
    icon,
    size = "sm",
    "aria-label": ariaLabel = "Delete item",
    ...props
}: ActionButtonProps) {
    return (
        <IconButton
            size={size}
            variant="ghost"
            onClick={onClick}
            aria-label={ariaLabel}
            color={useColorModeValue("red.600", "red.300")}
            _hover={{
                bg: useColorModeValue("red.50", "red.900"),
            }}
            {...props}
        >
            {icon}
        </IconButton>
    );
}

// Container for action buttons with consistent spacing
export function ActionButtonGroup({
    children,
    justify = "end",
    gap = "2",
    mt = "4",
}: ActionButtonGroupProps) {
    return (
        <Flex justify={justify} gap={gap} mt={mt}>
            {children}
        </Flex>
    );
}

// Pre-configured form action buttons (Reset + Edit/Save)
export function FormActionButtons({
    onReset,
    onEdit,
    isEditMode,
    resetIcon,
    editIcon,
    saveIcon,
}: FormActionButtonsProps) {
    return (
        <ActionButtonGroup>
            <ActionButton
                onClick={onReset}
                icon={resetIcon!}
                aria-label="Reset form"
            />
            <ActionButton
                onClick={onEdit}
                icon={isEditMode ? saveIcon! : editIcon!}
                aria-label={isEditMode ? "Save changes" : "Edit form"}
            />
        </ActionButtonGroup>
    );
}
