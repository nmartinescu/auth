import { createContext } from "react";

// Define the type inline to avoid import issues
interface MemoryManagementFormContextType {
    isEditMode: boolean;
    setIsEditMode: (isEditMode: boolean) => void;
    frameCount: number;
    setFrameCount: (frameCount: number) => void;
    pageReferences: number[];
    setPageReferences: (pageReferences: number[]) => void;
    onSubmit?: () => void;
}

export const MemoryManagementFormContext = createContext<MemoryManagementFormContextType>(
    {} as MemoryManagementFormContextType
);