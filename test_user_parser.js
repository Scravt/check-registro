
const lines = [
    "20041243393AT0LA CABAITA COLONA N 1                                      000000                    3170    BASAVILBASO                                                 05000020149902025-09-08-17.03.54.372988",
    "20045181651AT0Sin nombre                                                  000000          0    0    3272    HERRERA                                                     05000020121122007-01-19-17.15.49.493557",
    "20059554949AT0ZONA RURAL                                                  000000          0    0    3116    CRESPO                                                      05031166021902006-08-03-16.19.57.010710",
    "20100745683AT0GUALEGUAYCHU                                                000867                    3100    PARANA                                                      05000015236402006-08-06-21.18.31.028850",
    "20108759403AT0TEJEIRO MARTINEZ                                            000555                    3100    PARANA                                                      05000010000002006-09-13-18.19.25.033972",
    // Hypothetical line for the '100' case to test robustness
    "20108759403AT0TEJEIRO MARTINEZ                                            000555                    100     PARANA                                                      05000010000002006-09-13-18.19.25.033972"
];

function testUserParser(lines) {
    const regex = /^(\d{11}).{3}(.*?)(\d{6}).*?(\d{4})\s+(.*?)\s+(\d{13}.*)$/;

    lines.forEach((line, index) => {
        console.log(`--- Line ${index + 1} ---`);
        const cleanLine = line.replace(/\r/g, '');
        const match = cleanLine.match(regex);

        if (match) {
            console.log("MATCH FOUND:");
            console.log("CUIT:", match[1]);
            console.log("Calle:", match[2].trim());
            console.log("Numero:", match[3]);
            console.log("CP:", match[4]);
            console.log("Ciudad:", match[5].trim());
            console.log("Fecha:", match[6]);
        } else {
            console.log("NO MATCH for regex.");
            // Debug failure
            // Check if parts match
            const cuit = cleanLine.substring(0, 11);
            console.log("Starts with CUIT:", /^\d{11}/.test(cuit));
        }
    });
}

testUserParser(lines);
