import { Button, Flex, Input } from "@chakra-ui/react";
import { useRef } from "react";
import { LuDownload, LuUpload } from "react-icons/lu";

interface FormImportExportProps {
    exportDataCallback: () => any;
    importDataCallback: (data: any) => void;
}

export default function FormImportExport({
    exportDataCallback,
    importDataCallback,
}: FormImportExportProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const data = exportDataCallback();
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'memory-simulation.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target?.result as string);
                    importDataCallback(data);
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                    alert('Invalid JSON file');
                }
            };
            reader.readAsText(file);
        }
    };

    return (
        <Flex gap="4" justify="center" align="center" wrap="wrap">
            <Button
                onClick={handleExport}
                variant="outline"
                size="sm"
            >
                <LuDownload /> Export Configuration
            </Button>
            
            <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                size="sm"
            >
                <LuUpload /> Import Configuration
            </Button>
            
            <Input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                display="none"
            />
        </Flex>
    );
}