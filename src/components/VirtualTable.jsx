
import React from 'react';
import './VirtualTable.css';

const VirtualTable = ({ data, height = 500 }) => {
    if (!data || data.length === 0) {
        return (
            <div className="empty-table-state">
                <p>No hay datos para mostrar</p>
            </div>
        );
    }

    // Safety limit: only render first 2000 items to avoid freezing browser without virtualization.
    // The user can export full data if needed.
    const MAX_ITEMS = 2000;
    const displayData = data.slice(0, MAX_ITEMS);
    const isTruncated = data.length > MAX_ITEMS;

    return (
        <div className="virtual-table-container glass-panel" style={{ height: height, display: 'flex', flexDirection: 'column' }}>
            <div className="table-header">
                <span className="header-index">#</span>
                <span className="header-cuit">CUIT</span>
                <span className="header-content">Contenido / Razón Social</span>
            </div>
            <div className="table-body" style={{ overflowY: 'auto', flex: 1 }}>
                {displayData.map((item, index) => (
                    <div key={index} className={`table-row ${index % 2 === 0 ? 'even' : 'odd'}`} style={{ height: '45px' }}>
                        <span className="row-index">{index + 1}</span>
                        <span className="row-cuit">{item.cuit || ''}</span>
                        <span className="row-content" title={item.display || item.raw || ''}>
                            {item.display || item.raw || ''}
                        </span>
                    </div>
                ))}
                {isTruncated && (
                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        ⚠ Mostrando los primeros {MAX_ITEMS} registros. Exporte a Excel para ver todo.
                    </div>
                )}
            </div>
            <div className="table-footer">
                Total: {data.length.toLocaleString()} registros
            </div>
        </div>
    );
};

export default VirtualTable;
