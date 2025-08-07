export interface ProcessData {
    arrivalTime: number;
    burstTime: number;
    io: string;
}

export interface ProcessStatFieldProps {
    label: string;
    value: string;
    isEditMode: boolean;
    textColor: string;
    subtextColor: string;
    borderColor: string;
}

export interface ProcessRowProps {
    index: number;
    value: ProcessData;
    updateProcess: (index: number, key: string, value: any) => void;
    onDelete: (index: number) => void;
    isEditMode: boolean;
}