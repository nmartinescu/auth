import type { ReactElement } from "react";

// Types for the reusable button components
export interface ActionButtonProps {
    onClick: () => void;
    icon: ReactElement;
    "aria-label"?: string;
    disabled?: boolean;
    size?: "sm" | "md" | "lg";
}

export interface FormActionButtonsProps {
    onReset: () => void;
    onEdit: () => void;
    isEditMode: boolean;
    resetIcon?: ReactElement;
    editIcon?: ReactElement;
    saveIcon?: ReactElement;
}

export interface ActionButtonGroupProps {
    children: React.ReactNode;
    justify?: "start" | "center" | "end" | "space-between";
    gap?: string | number;
    mt?: string | number;
}