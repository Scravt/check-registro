
import React, { useState, useMemo } from 'react';
import { FileUp, Database, Download, FileSpreadsheet, File as FileIcon } from 'lucide-react';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

import FileUploader from './components/FileUploader';
import VirtualTable from './components/VirtualTable';
import { parseArcaFile, parseEntreRiosFile, parseLaboralesFile } from './utils/parser';
import { getCrossReference } from './utils/analyzer';

import './App.css';

function App() {
  const [step, setStep] = useState('intro'); // intro, upload, results
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
  const [activeTab, setActiveTab] = useState('results'); // 'loaded', 'results'
  const [viewingFile, setViewingFile] = useState('arca'); // for 'loaded' tab

  const handleFileSelect = (key, file) => {
    setFiles(prev => ({ ...prev, [key]: file }));
  };

  const processFiles = async () => {
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
        arcaSample: arcaData?.[0],
      });

      setData({
        arca: arcaData,
        entreRios: entreRiosData,
        laborales: laboralesData
      });

      setStep('results');
    } catch (error) {
      console.error("Error processing files", error); // Log full object
      console.log("Error details:", error.message, error.stack);
      alert(`Hubo un error leyendo los archivos: ${error.message}`);
    }
  };

  const crossReferenceData = useMemo(() => {
    if (step !== 'results') return [];
    return getCrossReference(data.arca, data.entreRios);
  }, [data, step]);

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Reporte de Entrecruzamiento", 14, 22);

    doc.setFontSize(11);
    doc.text(`Total encontrados: ${crossReferenceData.length}`, 14, 30);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 36);

    const tableData = crossReferenceData.map((item, index) => [
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

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(crossReferenceData.map(item => ({
      CUIT: item.cuit,
      Contenido: item.display
    })));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Resultados");
    XLSX.writeFile(wb, "resultado-entrecruzamiento.xlsx");
  };

  /* RENDER BLOCKS */

  const renderIntro = () => (
    <div className="intro-screen animate-fade-in">
      <h1>Sistema de Detección de Empleadores</h1>
      <p className="subtitle">Herramienta de control y auditoría cruzada</p>

      <div className="info-card glass-panel">
        <p>
          Este sistema permite identificar empleadores registrados en <strong>ARCA</strong> que no figuran en el padrón de la <strong>Secretaría de Trabajo de Entre Ríos</strong>.
        </p>
        <p style={{ marginTop: '1rem' }}>
          El proceso es 100% local y seguro. Sus datos no salen de este navegador.
        </p>
      </div>

      <button className="btn btn-primary" onClick={() => setStep('upload')}>
        Comenzar Análisis <FileUp size={20} />
      </button>
    </div>
  );

  const renderUpload = () => (
    <div className="upload-screen animate-fade-in">
      <header className="header-compact">
        <h2>Carga de Datos</h2>
        <p>Introduce los 3 archivos requeridos para el análisis.</p>
      </header>

      <div className="upload-grid">
        <FileUploader
          title="1. Archivo ARCA (Domicilio Explotación)"
          fileStatus={files.arca}
          onFileSelect={(f) => handleFileSelect('arca', f)}
        />
        <FileUploader
          title="2. Padrón Entre Ríos"
          fileStatus={files.entreRios}
          onFileSelect={(f) => handleFileSelect('entreRios', f)}
        />
        <FileUploader
          title="3. Relaciones Laborales"
          fileStatus={files.laborales}
          onFileSelect={(f) => handleFileSelect('laborales', f)}
        />
      </div>

      <div className="actions">
        <button className="btn btn-secondary" onClick={() => setStep('intro')}>
          Volver
        </button>
        <button
          className="btn btn-primary"
          onClick={processFiles}
          disabled={!files.arca || !files.entreRios || !files.laborales}
        >
          Procesar y Cruzar Datos <Database size={20} />
        </button>
      </div>
    </div>
  );

  const renderResults = () => (
    <div className="results-screen animate-fade-in">
      <header className="results-header">
        <h2>Resultados del Análisis</h2>
        <div className="export-actions">
          <button className="btn btn-secondary" onClick={() => setStep('upload')}>Nueva Carga</button>
          <div className="separator"></div>
          <button className="btn btn-primary" onClick={exportExcel}>
            <FileSpreadsheet size={18} /> Excel
          </button>
          <button className="btn btn-primary" onClick={exportPDF}>
            <FileIcon size={18} /> PDF
          </button>
        </div>
      </header>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'results' ? 'active' : ''}`}
          onClick={() => setActiveTab('results')}
        >
          Entrecruzamiento (ARCA vs E.Rios)
        </button>
        <button
          className={`tab ${activeTab === 'loaded' ? 'active' : ''}`}
          onClick={() => setActiveTab('loaded')}
        >
          Datos Cargados
        </button>
      </div>

      {activeTab === 'results' ? (
        <div className="results-view">
          <div className="stats-bar glass-panel">
            <div className="stat-item">
              <span className="label">En ARCA</span>
              <span className="value">{data.arca.length.toLocaleString()}</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="label">En Entre Ríos</span>
              <span className="value">{data.entreRios.length.toLocaleString()}</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item highlight">
              <span className="label">No Registrados en Prov.</span>
              <span className="value error">{crossReferenceData.length.toLocaleString()}</span>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <VirtualTable data={crossReferenceData} height={600} />
          </div>
        </div>
      ) : (
        <div className="loaded-view">
          <div className="sub-tabs">
            <button className={viewingFile === 'arca' ? 'active' : ''} onClick={() => setViewingFile('arca')}>ARCA</button>
            <button className={viewingFile === 'entreRios' ? 'active' : ''} onClick={() => setViewingFile('entreRios')}>Entre Ríos</button>
            <button className={viewingFile === 'laborales' ? 'active' : ''} onClick={() => setViewingFile('laborales')}>Rel. Laborales</button>
          </div>
          <VirtualTable data={data[viewingFile]} height={550} />
        </div>
      )}
    </div>
  );

  return (
    <div className="app-container">
      {step === 'intro' && renderIntro()}
      {step === 'upload' && renderUpload()}
      {step === 'results' && renderResults()}
    </div>
  );
}

export default App;
