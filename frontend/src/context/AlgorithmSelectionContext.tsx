import { createContext } from "react";

// Define the type inline to avoid import issues
interface AlgorithmSelectionContextType {
    selectedAlgorithm: string[];
    setSelectedAlgorithm: (algorithm: string[]) => void;
    algorithms: any;
}

export const AlgorithmSelectionContext =
    createContext<AlgorithmSelectionContextType>(
        {} as AlgorithmSelectionContextType
    );
