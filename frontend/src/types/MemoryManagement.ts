export interface MemoryManagementFormType {
    isEditMode: boolean;
    setIsEditMode: (isEditMode: boolean) => void;
    frameCount: number;
    setFrameCount: (frameCount: number) => void;
    pageReferences: number[];
    setPageReferences: (pageReferences: number[]) => void;
    onSubmit?: () => void;
}

export interface MemoryAlgorithm {
    label: string;
    value: string;
    description: string;
}