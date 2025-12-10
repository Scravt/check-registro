import { useState, useMemo } from 'react';
import { parseArcaFile, parseEntreRiosFile, parseLaboralesFile } from '../utils/parser';
import { getCrossReference } from '../utils/analyzer';

export const useFileProcessor = () => {
    const [files, setFiles] = useState({
        arca: null,
        entreRios: null,
        laborales: null
    });

    const [data, setData] = useState({
        arca: [],
        entreRios: [],
        laborales: []
    });

    const handleFileSelect = (key, file) => {
        setFiles(prev => ({ ...prev, [key]: file }));
    };

    const processFiles = async (onSuccess) => {
        if (!files.arca || !files.entreRios || !files.laborales) {
            alert("Por favor, carga los 3 archivos antes de continuar.");
            return;
        }

        const readFile = (file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsText(file);
            });
        };

        try {
            console.log("Reading files...");
            const [arcaText, entreRiosText, laboralesText] = await Promise.all([
                readFile(files.arca),
                readFile(files.entreRios),
                readFile(files.laborales)
            ]);

            console.log("Files read successfully. Starting parsing...");

            const arcaData = parseArcaFile(arcaText);
            const entreRiosData = parseEntreRiosFile(entreRiosText);
            const laboralesData = parseLaboralesFile(laboralesText);

            console.log("Parsed Data:", {
                arca: arcaData?.length,
                entreRios: entreRiosData?.length,
                laborales: laboralesData?.length,
            });

            setData({
                arca: arcaData,
                entreRios: entreRiosData,
                laborales: laboralesData
            });

            if (onSuccess) onSuccess();

        } catch (error) {
            console.error("Error processing files", error);
            console.log("Error details:", error.message, error.stack);
            alert(`Hubo un error leyendo los archivos: ${error.message}`);
        }
    };

    const crossReferenceData = useMemo(() => {
        // Only calculate if we have data
        if (data.arca.length === 0 || data.entreRios.length === 0) return [];
        return getCrossReference(data.arca, data.entreRios);
    }, [data]);

    return {
        files,
        data,
        crossReferenceData,
        handleFileSelect,
        processFiles
    };
};
