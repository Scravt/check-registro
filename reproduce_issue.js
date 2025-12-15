
const lines = [
    "20041243393AT0LA CABAITA COLONA N 1                                      000000                    3170    BASAVILBASO                                                 05000020149902025-09-08-17.03.54.372988",
    "20045181651AT0Sin nombre                                                  000000          0    0    3272    HERRERA                                                     05000020121122007-01-19-17.15.49.493557",
    "20059554949AT0ZONA RURAL                                                  000000          0    0    3116    CRESPO                                                      05031166021902006-08-03-16.19.57.010710",
    "20100745683AT0GUALEGUAYCHU                                                000867                    3100    PARANA                                                      05000015236402006-08-06-21.18.31.028850",
    "20108759403AT0TEJEIRO MARTINEZ                                            000555                    3100    PARANA                                                      05000010000002006-09-13-18.19.25.033972"
];

function testParser(lines) {
    lines.forEach((line, index) => {
        console.log(`--- Line ${index + 1} ---`);
        const distinctLine = line.replace(/\r/g, '');

        let localidad = 'NOT FOUND';
        let postal = 'NOT FOUND';

        const suffixRegex = /\s+(\d{13})(\d{4}-\d{2}-\d{2}-[\d\.]+)$/;
        const match = distinctLine.match(suffixRegex);

        if (match) {
            console.log("Suffix found");
            const textBefore = distinctLine.substring(0, match.index);
            console.log("Text before:", `"${textBefore}"`);

            // Current regex in codebase
            // const localityMatch = textBefore.match(/\s+(\d{4})\s+([^\s].*)$/);

            // Proposed greedy regex
            const localityMatch = textBefore.match(/.*\s(\d{4})\s+([^\s].*)$/);

            if (localityMatch) {
                postal = localityMatch[1];
                localidad = localityMatch[2].trim();
            }
        } else {
            console.log("Suffix NOT found");
        }

        console.log(`Result: [${postal}] ${localidad}`);
    });
}

testParser(lines);
