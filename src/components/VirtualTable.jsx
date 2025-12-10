
import React from 'react';
import './VirtualTable.css';

const VirtualTable = ({ data, height = 500 }) => {
    const [filter, setFilter] = React.useState('');

    if (!data || data.length === 0) {
        return (
            <div className="empty-table-state">
                <p>No hay datos para mostrar</p>
            </div>
        );
    }

    const filteredData = React.useMemo(() => {
        if (!filter) return data;
        const lowerFilter = filter.toLowerCase();
        return data.filter(item =>
            (item.cuit && item.cuit.includes(lowerFilter)) ||
            (item.display && item.display.toLowerCase().includes(lowerFilter))
        );
    }, [data, filter]);

    // Safety limit: only render first 2000 items to avoid freezing browser without virtualization.
    // The user can export full data if needed.
    const MAX_ITEMS = 2000;
    const displayData = filteredData.slice(0, MAX_ITEMS);
    const isTruncated = filteredData.length > MAX_ITEMS;

    return (
        <div className="virtual-table-container glass-panel" style={{ height: height, display: 'flex', flexDirection: 'column' }}>
            <div className="table-controls" style={{ padding: '0.75rem', borderBottom: '1px solid var(--card-border)' }}>
                <input
                    type="text"
                    placeholder="Filtrar por CUIT..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--card-border)',
                        background: 'rgba(0,0,0,0.2)',
                        color: 'var(--text-main)',
                        outline: 'none'
                    }}
                />
            </div>
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
                {displayData.length === 0 && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No se encontraron resultados para "{filter}"
                    </div>
                )}
            </div>
            <div className="table-footer">
                Mostrando: {filteredData.length.toLocaleString()} / Total: {data.length.toLocaleString()}
            </div>
        </div>
    );
};

export default VirtualTable;
