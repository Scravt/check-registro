import React, { useState, useEffect, useMemo } from 'react';
import { FileUp, Database, FileSpreadsheet, File as FileIcon } from 'lucide-react';

import FileUploader from './components/FileUploader';
import VirtualTable from './components/VirtualTable';
import { useFileProcessor } from './hooks/useFileProcessor';
import { exportPDF, exportExcel } from './utils/exporter';

import './App.css';

// Column Definitions
const DEFAULT_COLUMNS = [
  { key: 'cuit', label: 'CUIT', className: 'cuit' },
  { key: 'cp', label: 'CP', className: 'cp' },
  { key: 'calle', label: 'Calle', className: 'calle' },
  { key: 'numero', label: 'N°', className: 'nro' },
  { key: 'localidad', label: 'Localidad', className: 'localidad' },
  { key: 'raw', label: 'Info Original', className: 'content', render: (item) => item.raw ? item.raw.substring(0, 30) + '...' : (item.display || '') }
];

const LSD_COLUMNS = [
  { key: 'cuit', label: 'CUIT', className: 'cuit' },
  { key: 'display', label: 'Razón Social', className: 'razon' }, // display map to Razón Social for LSD
  { key: 'calle', label: 'Calle', className: 'calle' },
  { key: 'numero', label: 'N°', className: 'nro' },
  { key: 'cp', label: 'CP', className: 'cp' },
  { key: 'localidad', label: 'Localidad', className: 'localidad' }
];

function App() {
  /* STATE */
  const [step, setStep] = useState('intro');
  const [activeTab, setActiveTab] = useState('lsdResults');
  const [viewingFile, setViewingFile] = useState('arca');

  // Filter State (Lifted from VirtualTable)
  const [filter, setFilter] = useState('');
  const [localityFilter, setLocalityFilter] = useState('');

  const {
    files,
    data,
    crossReferenceData,
    lsdCrossReference,
    handleFileSelect,
    processFiles
  } = useFileProcessor();

  // Reset filters when context changes
  useEffect(() => {
    setFilter('');
    setLocalityFilter('');
  }, [activeTab, viewingFile]);

  // Compute Filtered Data
  const currentData = useMemo(() => {
    switch (activeTab) {
      case 'results': return crossReferenceData;
      case 'lsdResults': return lsdCrossReference;
      case 'loaded': return data[viewingFile] || [];
      default: return [];
    }
  }, [activeTab, crossReferenceData, lsdCrossReference, data, viewingFile]);

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
        <p>Introduce los 3 archivos requeridos para el análisis.</p>
      </header>

      <div className="upload-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
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
          title="3. LSD Definitivos"
          fileStatus={files.lsdDefinitivos}
          onFileSelect={(f) => handleFileSelect('lsdDefinitivos', f)}
        />
      </div>

      <div className="actions">
        <button className="btn btn-secondary" onClick={() => setStep('intro')}>
          Volver
        </button>
        <button
          className="btn btn-primary"
          onClick={handleProcess}
          disabled={!files.arca || !files.lsdDefinitivos || !files.sidrel}
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
          className={`tab ${activeTab === 'lsdResults' ? 'active' : ''}`}
          onClick={() => setActiveTab('lsdResults')}
          style={{ order: -1 }} // Visual order trick or just rearrange DOM. Better rearrange DOM.
        >
          ARCA Sueldos vs SIDREL
        </button>
        <button
          className={`tab ${activeTab === 'loaded' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('loaded');
            // Default to arca if restricted view
            if (viewingFile !== 'lsdDefinitivos') {
              setViewingFile('arca');
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
              columns={DEFAULT_COLUMNS}
            />
          </div>
        </div>
      ) : activeTab === 'lsdResults' ? (
        <div className="results-view">
          <div className="stats-bar glass-panel">
            <div className="stat-item">
              <span className="label">En ARCA Sueldos (LSD - Empleadores)</span>
              <span className="value">{data.lsdDefinitivos.filter(i => i.tipo === 'EMPLEADOR').length.toLocaleString()}</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="label">En SIDREL</span>
              <span className="value">{data.sidrel.length.toLocaleString()}</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item highlight">
              <span className="label">No Registrados en SIDREL</span>
              <span className="value error">{lsdCrossReference.length.toLocaleString()}</span>
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
              columns={LSD_COLUMNS}
            />
          </div>
        </div>
      ) : (
        <div className="loaded-view">
          <div className="sub-tabs">
            <button className={viewingFile === 'arca' ? 'active' : ''} onClick={() => setViewingFile('arca')}>ARCA</button>
            <button className={viewingFile === 'sidrel' ? 'active' : ''} onClick={() => setViewingFile('sidrel')}>SIDREL</button>
            <button className={viewingFile === 'lsdDefinitivos' ? 'active' : ''} onClick={() => setViewingFile('lsdDefinitivos')}>LSD Definitivos</button>
          </div>
          <VirtualTable
            data={filteredData}
            height={550}
            filter={filter}
            setFilter={setFilter}
            localityFilter={localityFilter}
            setLocalityFilter={setLocalityFilter}
            columns={DEFAULT_COLUMNS}
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
