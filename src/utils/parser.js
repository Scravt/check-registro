
export const parseLine = (line) => {
    if (!line || line.trim().length === 0) return null;
    // Basic cleaning
    const distinctLine = line.replace(/\r/g, '');

    // Assumption: First 11 numerical characters are the CUIT
    // We will look for the first sequence of 11 digits
    // But strictly based on the user prompt examples, they seem to be at the start.

    // Let's try to grab the first 11 chars and see if they are digits.
    const potentialCuit = distinctLine.substring(0, 11);

    if (/^\d{11}$/.test(potentialCuit)) {
        return {
            cuit: potentialCuit,
            raw: distinctLine,
            // For display purposes, we might want to extract a name if possible, 
            // but without exact column specs, showing the raw line or a substring is safer.
            // We'll try to guess the name start for better UI
            display: distinctLine.substring(11).trim()
        };
    }

    return null;
};

export const parseFileContent = (content) => {
    const lines = content.split('\n');
    const parsedData = [];

    for (let i = 0; i < lines.length; i++) {
        const output = parseLine(lines[i]);
        if (output) {
            parsedData.push(output);
        }
    }

    return parsedData;
};

// We can just use one generic parser if the CUIT is always at the start. 
// If specific logic is needed per file type later, we can separate them.
export const parseArcaFile = parseFileContent;
export const parseEntreRiosFile = parseFileContent;
export const parseLaboralesFile = parseFileContent;
