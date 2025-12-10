import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const exportPDF = (data) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Reporte de Entrecruzamiento", 14, 22);

    doc.setFontSize(11);
    doc.text(`Total encontrados: ${data.length}`, 14, 30);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 36);

    const tableData = data.map((item, index) => [
        index + 1,
        item.cuit,
        item.display ? item.display.substring(0, 50) : ''
    ]);

    autoTable(doc, {
        head: [['#', 'CUIT', 'Detalle']],
        body: tableData,
        startY: 44,
    });

    doc.save("reporte-entrecruzamiento.pdf");
};

export const exportExcel = (data) => {
    const ws = XLSX.utils.json_to_sheet(data.map(item => ({
        CUIT: item.cuit,
        Contenido: item.display
    })));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Resultados");
    XLSX.writeFile(wb, "resultado-entrecruzamiento.xlsx");
};
