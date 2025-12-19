
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
// Specific parser for ARCA (Domicilios Explotacion)
// Specific parser for ARCA (Domicilios Explotacion)
export const parseArcaFile = (content) => {
    const lines = content.split('\n');
    const parsedData = [];

    // User provided regex adapted:
    // 1. ^(\d{11})       -> CUIT (11 digits)
    // 2. .{3}            -> Skip 3 chars (AT0)
    // 3. (.*?)           -> CALLE (Lazy capture)
    // 4. (\d{6})         -> NUMERO (6 digits)
    // 5. .*?             -> Skip middle junk
    // 6. (\d{1,4})       -> CP (1 to 4 digits, adapted from user's \d{4} for robustness)
    // 7. \s+             -> Spaces
    // 8. (.*?)           -> CIUDAD (Lazy capture)
    // 9. \s+             -> Spaces
    // 10. (\d{13}.*)$    -> FECHA/SUFIJO (Blob at end)
    const regex = /^(\d{11}).{3}(.*?)(\d{6}).*?(\d{1,4})\s+(.*?)\s+(\d{13}.*)$/;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line || line.trim().length === 0) continue;

        const distinctLine = line.replace(/\r/g, '');
        const match = distinctLine.match(regex);

        if (match) {
            parsedData.push({
                cuit: match[1],
                calle: match[2].trim(),       // "gualeguaychu"
                numero: parseInt(match[3], 10), // "000867" -> 867
                cp: match[4],                 // "3100"
                localidad: match[5].trim(),   // "parana"
                // fecha: match[6],           // Not requested for display yet

                // Keep raw for compatibility if needed, but display is now composed
                raw: distinctLine,
                display: `${match[2].trim()} ${parseInt(match[3], 10)}` // Calle + Num for display column
            });
        } else {
            // Fallback for lines that don't match the strict regex but start with CUIT
            // We can use the previous logic or just skip/show raw.
            // Given user confidence in their parser, we might just skip or simple fallback.
            const cuit = distinctLine.substring(0, 11);
            if (/^\d{11}$/.test(cuit)) {
                parsedData.push({
                    cuit: cuit,
                    localidad: '',
                    calle: '',
                    numero: '',
                    cp: '',
                    raw: distinctLine,
                    display: distinctLine.substring(11).trim()
                });
            }
        }
    }

    return parsedData;
};

// Specific parser for SIDREL
export const parseSidrelFile = (content) => {
    const lines = content.split('\n');
    const parsedData = [];

    // Helper for clearing spaces
    const getVal = (cols, index) => cols[index] ? cols[index].trim() : null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line || !line.includes(';')) continue;

        const cols = line.split(';');
        // Basic validation based on user prompt (13 columns expected: indices 0-12)
        if (cols.length < 12) continue;

        // --- ADDRESS LOGIC ---
        const rawDomicilio = getVal(cols, 7); // "DOMICILIO"
        let calle = rawDomicilio;
        let numero = null;

        if (rawDomicilio) {
            const numeroMatch = rawDomicilio.match(/(\d+)$/);
            if (numeroMatch) {
                numero = parseInt(numeroMatch[1], 10);
                calle = rawDomicilio.replace(numeroMatch[0], '').trim();
            }
        }

        // --- BUILD OBJECT ---
        parsedData.push({
            // Core identifiers
            cuit: getVal(cols, 5),
            razon_social: getVal(cols, 1),
            estado: getVal(cols, 12),

            // Location (Normalized)
            ubicacion: {
                calle: calle ? calle.toLowerCase() : null,
                numero: numero,
                localidad_registrada: getVal(cols, 6) ? getVal(cols, 6).toLowerCase() : null,
                domicilio_original: rawDomicilio
            },

            // Contact
            contacto: {
                email_principal: getVal(cols, 2) ? getVal(cols, 2).toLowerCase() : null,
                email_secundario: getVal(cols, 3) ? getVal(cols, 3).toLowerCase() : null,
            },

            // Activity
            actividad: {
                descripcion: getVal(cols, 8),
                codigo: getVal(cols, 9),
                tipo_empresa: getVal(cols, 10),
                fecha_alta: getVal(cols, 0),
                cantidad_empleados: parseInt(getVal(cols, 4)) || 0
            },

            // Metadata
            meta: {
                usuario_registro: getVal(cols, 11)
            },

            // Flat properties for table compatibility
            display: getVal(cols, 1), // Razon social as display
            raw: line
        });
    }

    return parsedData;
};

/**
 * Parser para archivos de Libro de Sueldos Digital (LSD/HFLSD)
 * Formato de ancho fijo (Fixed Width).
 */
export const parseLSDLine = (line) => {
    if (!line || line.trim().length === 0) return null;

    // El tipo de registro son los primeros 2 caracteres
    const type = line.substring(0, 2);

    switch (type) {
        // --- TIPO 01: CABECERA EMPLEADOR (Datos de la Empresa) ---
        case '01': {
            // Regex explicada:
            // ^01\d*?           -> Empieza con 01 seguido de números basura (non-greedy)
            // (\d{11})          -> CAPTURA 1: CUIT (Los últimos 11 dígitos antes del nombre)
            // ([A-ZÑ\s\.,&]+?)  -> CAPTURA 2: Razón Social (Letras, espacios, puntos, comas)
            // \s+               -> Espacios obligatorios
            // 20\d{4}M          -> Ancla: Fecha del periodo (ej: 202511M)
            // .*?               -> Basura intermedia (IDs de sistema)
            // ([A-Z0-9\s\.]+?)  -> CAPTURA 3: Calle (ej: CETTOUR o DR. CETTOUR)
            // \s+               -> Espacios antes del número
            // (\d{1,6})         -> CAPTURA 4: Número/Altura (ej: 2006)
            // \s+               -> Espacios
            // ([A-Z\s]+?)       -> CAPTURA 5: Localidad (ej: SAN JOSE)
            // \s+               -> Espacios
            // (\d{4})           -> CAPTURA 6: Código Postal (ej: 3283)

            const regex01 = /^01\d*?(\d{11})([A-ZÑ\s\.,&]+?)\s+20\d{4}M.*?([A-Z0-9\s\.]+?)\s+(\d{1,6})\s+([A-Z\s]+?)\s+(\d{4})/;

            const match = line.match(regex01);

            if (!match) {
                // Log only first 5 mismatches to avoid console spam
                if (window.lsdMismatchCount === undefined) window.lsdMismatchCount = 0;
                if (window.lsdMismatchCount < 5) {
                    console.warn("LSD 01 Mismatch:", line);
                    window.lsdMismatchCount++;
                }
            }

            if (match) {
                let cleanCalle = match[3].trim();
                // User fix: "number. street" -> remove number and dot
                if (cleanCalle.includes('.')) {
                    const parts = cleanCalle.split('.');
                    if (parts.length > 1) {
                        // Join back in case there are multiple dots (e.g., "Av.")
                        cleanCalle = parts.slice(1).join('.').trim();
                    }
                }

                return {
                    registro: '01',
                    tipo: 'EMPLEADOR',
                    cuit: match[1],
                    razon_social: match[2].trim(),
                    ubicacion: {
                        calle: cleanCalle,
                        numero: parseInt(match[4], 10),
                        localidad: match[5].trim(),
                        cp: match[6],
                        direccion_completa: `${cleanCalle} ${match[4]}, ${match[5].trim()}, Entre Rios`
                    },
                    // Adding flat properties for VirtualTable compatibility
                    display: match[2].trim(),
                    calle: cleanCalle,
                    localidad: match[5].trim(),
                    numero: parseInt(match[4], 10),
                    cp: match[6]
                };
            }
            return { registro: '01', error: 'Formato no reconocido', raw: line };
        }

        // --- TIPO 02: DATOS DEL EMPLEADO ---
        case '02': {
            // Intentamos capturar Nombre y CUIL
            // Patrón: 02 + basura + Nombre + Espacios + Periodo + CUIL
            // Ejemplo: ...VERA, MICAELA... 202511... 20385422142
            const regex02 = /^02\d+?([A-ZÑ\s\.,]+?)\s+20\d{6}/;
            const match = line.match(regex02);

            return {
                registro: '02',
                tipo: 'EMPLEADO',
                nombre: match ? match[1].trim() : "Desconocido",
                // raw: line // Descomentar si necesitas toda la linea
            };
        }

        // --- TIPO 03: CONCEPTOS (Sueldos) ---
        case '03': {
            // Ejemplo: 03... SUELDO MENSUAL ... 110000
            const regex03 = /^03\d+\s+([A-Z0-9\.\/\-\s]+?)\s+\d/;
            const match = line.match(regex03);

            return {
                registro: '03',
                tipo: 'CONCEPTO',
                descripcion: match ? match[1].trim() : "Concepto Varios"
            };
        }

        // --- TIPO 05: FAMILIARES/ADICIONALES ---
        case '05': {
            const regex05 = /^05\d+?([A-ZÑ\s\.,]+?)\s+20\d{6}/;
            const match = line.match(regex05);
            return {
                registro: '05',
                tipo: 'FAMILIAR',
                nombre: match ? match[1].trim() : "Familiar"
            };
        }

        default:
            return null; // Ignoramos líneas desconocidas o vacías
    }
};

export const parseLsdDefinitivosFile = (content) => {
    const lines = content.split('\n');
    const parsedData = [];

    // Estructura Jerárquica:
    // Mantenemos una referencia al "Empleador Actual" para agrupar a sus empleados si quisieras
    // Pero por ahora devolvemos la lista plana como pediste.

    lines.forEach(line => {
        const parsed = parseLSDLine(line);
        if (parsed) {
            parsedData.push(parsed);
        }
    });

    return parsedData;
};
