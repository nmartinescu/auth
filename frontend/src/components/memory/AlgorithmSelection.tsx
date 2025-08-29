import { useContext } from "react";
import { SelectContent, SelectItem, SelectRoot, SelectTrigger, SelectValueText } from "@chakra-ui/react";
import { AlgorithmSelectionContext } from "../../context/AlgorithmSelectionContext";

export default function AlgorithmSelection() {
    const { selectedAlgorithm, setSelectedAlgorithm, algorithms } = useContext(AlgorithmSelectionContext);

    return (
        <SelectRoot
            collection={algorithms}
            value={selectedAlgorithm}
            onValueChange={(e) => setSelectedAlgorithm(e.value)}
            size="lg"
            width="300px"
        >
            <SelectTrigger>
                <SelectValueText placeholder="Select algorithm" />
            </SelectTrigger>
            <SelectContent>
                {algorithms.items.map((algorithm: any) => (
                    <SelectItem item={algorithm} key={algorithm.value}>
                        {algorithm.label} - {algorithm.description}
                    </SelectItem>
                ))}
            </SelectContent>
        </SelectRoot>
    );
}