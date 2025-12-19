import { useState, useMemo } from 'react';
import { parseArcaFile, parseLsdDefinitivosFile, parseSidrelFile } from '../utils/parser';
import { getCrossReference } from '../utils/analyzer';

export const useFileProcessor = () => {
    const [files, setFiles] = useState({
        arca: null,
        lsdDefinitivos: null,
        sidrel: null
    });

    const [data, setData] = useState({
        arca: [],
        lsdDefinitivos: [],
        sidrel: []
    });

    const handleFileSelect = (key, file) => {
        setFiles(prev => ({ ...prev, [key]: file }));
    };

    const processFiles = async (onSuccess) => {
        // Validation: verify all required files. User implies SIDREL is now critical for analysis.
        // Assuming all 4 might be uploaded, but for analysis ARCA & SIDREL are key.
        // SAL702 & LABORALES are just for looking up data.
        if (!files.arca || !files.sidrel || !files.lsdDefinitivos) {
            alert("Por favor, carga todos los archivos requeridos (ARCA, LSD Definitivos, SIDREL).");
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
            const [arcaText, lsdDefinitivosText, sidrelText] = await Promise.all([
                readFile(files.arca),
                readFile(files.lsdDefinitivos),
                readFile(files.sidrel)
            ]);

            console.log("Files read successfully. Starting parsing...");

            const arcaData = parseArcaFile(arcaText);
            const lsdDefinitivosData = parseLsdDefinitivosFile(lsdDefinitivosText);
            const sidrelData = parseSidrelFile(sidrelText);

            console.log("Parsed Data:", {
                arca: arcaData?.length,
                lsdDefinitivos: lsdDefinitivosData?.length,
                sidrel: sidrelData?.length,
            });

            setData({
                arca: arcaData,
                lsdDefinitivos: lsdDefinitivosData,
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
        if (!data.arca || data.arca.length === 0 || !data.sidrel || data.sidrel.length === 0) return [];
        return getCrossReference(data.arca, data.sidrel);
    }, [data.arca, data.sidrel]);

    const lsdCrossReference = useMemo(() => {
        // Analysis: LSD (Employers) vs SIDREL
        if (!data.lsdDefinitivos || data.lsdDefinitivos.length === 0 || !data.sidrel || data.sidrel.length === 0) return [];

        // Filter only Employers (Tipo 01)
        const lsdEmployers = data.lsdDefinitivos.filter(item => item.tipo === 'EMPLEADOR');
        return getCrossReference(lsdEmployers, data.sidrel);
    }, [data.lsdDefinitivos, data.sidrel]);

    return {
        files,
        data,
        crossReferenceData,
        lsdCrossReference,
        handleFileSelect,
        processFiles
    };
};
