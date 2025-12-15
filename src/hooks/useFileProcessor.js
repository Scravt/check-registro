import { useState, useMemo } from 'react';
import { parseArcaFile, parseEntreRiosFile, parseLaboralesFile, parseSidrelFile } from '../utils/parser';
import { getCrossReference } from '../utils/analyzer';

export const useFileProcessor = () => {
    const [files, setFiles] = useState({
        arca: null,
        entreRios: null,
        laborales: null,
        sidrel: null
    });

    const [data, setData] = useState({
        arca: [],
        entreRios: [],
        laborales: [],
        sidrel: []
    });

    const handleFileSelect = (key, file) => {
        setFiles(prev => ({ ...prev, [key]: file }));
    };

    const processFiles = async (onSuccess) => {
        // Validation: verify all required files. User implies SIDREL is now critical for analysis.
        // Assuming all 4 might be uploaded, but for analysis ARCA & SIDREL are key.
        // SAL702 & LABORALES are just for looking up data.
        if (!files.arca || !files.sidrel || !files.entreRios || !files.laborales) {
            alert("Por favor, carga todos los archivos requeridos (ARCA, SAL702, Relaciones Laborales, SIDREL).");
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
            const [arcaText, entreRiosText, laboralesText, sidrelText] = await Promise.all([
                readFile(files.arca),
                readFile(files.entreRios),
                readFile(files.laborales),
                readFile(files.sidrel)
            ]);

            console.log("Files read successfully. Starting parsing...");

            const arcaData = parseArcaFile(arcaText);
            const entreRiosData = parseEntreRiosFile(entreRiosText);
            const laboralesData = parseLaboralesFile(laboralesText);
            const sidrelData = parseSidrelFile(sidrelText);

            console.log("Parsed Data:", {
                arca: arcaData?.length,
                entreRios: entreRiosData?.length,
                laborales: laboralesData?.length,
                sidrel: sidrelData?.length,
            });

            setData({
                arca: arcaData,
                entreRios: entreRiosData,
                laborales: laboralesData,
                sidrel: sidrelData
            });

            if (onSuccess) onSuccess();

        } catch (error) {
            console.error("Error processing files", error);
            console.log("Error details:", error.message, error.stack);
            alert(`Hubo un error leyendo los archivos: ${error.message}`);
        }
    };

    const crossReferenceData = useMemo(() => {
        // Analysis: ARCA vs SIDREL
        if (data.arca.length === 0 || data.sidrel.length === 0) return [];
        return getCrossReference(data.arca, data.sidrel);
    }, [data]);

    return {
        files,
        data,
        crossReferenceData,
        handleFileSelect,
        processFiles
    };
};
