import React, { useState, useEffect, useMemo } from 'react';
import { FileUp, Database, FileSpreadsheet, File as FileIcon } from 'lucide-react';

import FileUploader from './components/FileUploader';
import VirtualTable from './components/VirtualTable';
import { useFileProcessor } from './hooks/useFileProcessor';
import { exportPDF, exportExcel } from './utils/exporter';

import './App.css';

function App() {
  /* STATE */
  const [step, setStep] = useState('intro');
  const [activeTab, setActiveTab] = useState('results');
  const [viewingFile, setViewingFile] = useState('entreRios');

  // Filter State (Lifted from VirtualTable)
  const [filter, setFilter] = useState('');
  const [localityFilter, setLocalityFilter] = useState('');

  const {
    files,
    data,
    crossReferenceData,
    handleFileSelect,
    processFiles
  } = useFileProcessor();

  // Reset filters when context changes
  useEffect(() => {
    setFilter('');
    setLocalityFilter('');
  }, [activeTab, viewingFile]);

  // Compute Filtered Data
  const currentData = activeTab === 'results' ? crossReferenceData : (data[viewingFile] || []);

  const filteredData = useMemo(() => {
    let res = currentData;
    if (!res) return [];

    if (filter) {
      const lowerFilter = filter.toLowerCase();
      res = res.filter(item =>
        (item.cuit && item.cuit.includes(lowerFilter)) ||
        (item.calle && item.calle.toLowerCase().includes(lowerFilter)) ||
        (item.display && item.display.toLowerCase().includes(lowerFilter)) // display usually holds name/razon social
      );
    }

    if (localityFilter) {
      const lowerLoc = localityFilter.toLowerCase();
      res = res.filter(item =>
        item.localidad && item.localidad.toLowerCase().includes(lowerLoc)
      );
    }
    return res;
  }, [currentData, filter, localityFilter]);

  /* HANDLERS */
  const handleProcess = async () => {
    await processFiles(() => setStep('results'));
  };

  /* RENDER BLOCKS */

  const renderIntro = () => (
    <div className="intro-screen animate-fade-in">
      <h1>Sistema de Detección de Empleadores</h1>
      <p className="subtitle">Herramienta de control y auditoría cruzada - ARCA vs SIDREL</p>

      <div className="info-card glass-panel">
        <p>
          Este sistema permite identificar empleadores registrados en <strong>ARCA</strong> que no figuran en el padrón de <strong>SIDREL</strong>.
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
        <p>Introduce los 4 archivos requeridos para el análisis.</p>
      </header>

      <div className="upload-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <FileUploader
          title="1. Archivo ARCA (Domicilio Explotación)"
          fileStatus={files.arca}
          onFileSelect={(f) => handleFileSelect('arca', f)}
        />
        <FileUploader
          title="2. Padrón SIDREL"
          fileStatus={files.sidrel}
          onFileSelect={(f) => handleFileSelect('sidrel', f)}
        />
        <FileUploader
          title="3. Padrón Entre Ríos (SAL702)"
          fileStatus={files.entreRios}
          onFileSelect={(f) => handleFileSelect('entreRios', f)}
        />
        <FileUploader
          title="4. Relaciones Laborales"
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
          onClick={handleProcess}
          disabled={!files.arca || !files.entreRios || !files.laborales || !files.sidrel}
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
          {/* Export filteredData instead of crossReferenceData */}
          <button className="btn btn-primary" onClick={() => exportExcel(filteredData)}>
            <FileSpreadsheet size={18} /> Excel
          </button>
          <button className="btn btn-primary" onClick={() => exportPDF(filteredData)}>
            <FileIcon size={18} /> PDF
          </button>
        </div>
      </header>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'results' ? 'active' : ''}`}
          onClick={() => setActiveTab('results')}
        >
          Entrecruzamiento (ARCA vs SIDREL)
        </button>
        <button
          className={`tab ${activeTab === 'loaded' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('loaded');
            // Default to entreRios (SAL702) if restricted view
            if (viewingFile !== 'entreRios' && viewingFile !== 'laborales') {
              setViewingFile('entreRios');
            }
          }}
        >
          Datos Cargados (Referencias)
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
              <span className="label">En SIDREL</span>
              <span className="value">{data.sidrel.length.toLocaleString()}</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item highlight">
              <span className="label">No Registrados en SIDREL</span>
              <span className="value error">{crossReferenceData.length.toLocaleString()}</span>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <VirtualTable
              data={filteredData}
              height={600}
              filter={filter}
              setFilter={setFilter}
              localityFilter={localityFilter}
              setLocalityFilter={setLocalityFilter}
            />
          </div>
        </div>
      ) : (
        <div className="loaded-view">
          <div className="sub-tabs">
            <button className={viewingFile === 'arca' ? 'active' : ''} onClick={() => setViewingFile('arca')}>ARCA</button>
            <button className={viewingFile === 'sidrel' ? 'active' : ''} onClick={() => setViewingFile('sidrel')}>SIDREL</button>
            <button className={viewingFile === 'entreRios' ? 'active' : ''} onClick={() => setViewingFile('entreRios')}>SAL702 (Entre Ríos)</button>
            <button className={viewingFile === 'laborales' ? 'active' : ''} onClick={() => setViewingFile('laborales')}>Rel. Laborales</button>
          </div>
          <VirtualTable
            data={filteredData}
            height={550}
            filter={filter}
            setFilter={setFilter}
            localityFilter={localityFilter}
            setLocalityFilter={setLocalityFilter}
          />
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
