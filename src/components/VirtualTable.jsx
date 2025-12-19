
import './VirtualTable.css';

const VirtualTable = ({
    data,
    height = 500,
    filter = '',
    setFilter = () => { },
    localityFilter = '',
    setLocalityFilter = () => { },
    columns = [
        { key: 'cuit', label: 'CUIT', className: 'cuit' },
        { key: 'cp', label: 'CP', className: 'cp' },
        { key: 'calle', label: 'Calle', className: 'calle' },
        { key: 'numero', label: 'N°', className: 'nro' },
        { key: 'localidad', label: 'Localidad', className: 'localidad' },
        { key: 'raw', label: 'Info Original', className: 'content', render: (item) => item.raw ? item.raw.substring(0, 30) + '...' : (item.display || '') }
    ]
}) => {
    if (!data) {
        return (
            <div className="empty-table-state">
                <p>No hay datos para mostrar</p>
            </div>
        );
    }

    // Data is assumed to be passed already filtered from parent
    const filteredData = data;

    // Safety limit: only render first 2000 items to avoid freezing browser without virtualization.
    // The user can export full data if needed.
    const MAX_ITEMS = 2000;
    const displayData = filteredData.slice(0, MAX_ITEMS);
    const isTruncated = filteredData.length > MAX_ITEMS;

    return (
        <div className="virtual-table-container glass-panel" style={{ height: height, display: 'flex', flexDirection: 'column' }}>
            <div className="table-controls" style={{ padding: '0.75rem', borderBottom: '1px solid var(--card-border)', display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    placeholder="Filtrar por CUIT / Calle..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    style={{
                        flex: 1,
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--card-border)',
                        background: 'rgba(0,0,0,0.2)',
                        color: 'var(--text-main)',
                        outline: 'none',
                        textTransform: 'uppercase'
                    }}
                />
                <input
                    type="text"
                    placeholder="Filtrar por Localidad..."
                    value={localityFilter}
                    onChange={(e) => setLocalityFilter(e.target.value)}
                    style={{
                        flex: 1,
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--card-border)',
                        background: 'rgba(0,0,0,0.2)',
                        color: 'var(--text-main)',
                        outline: 'none',
                        textTransform: 'uppercase'
                    }}
                />
            </div>
            <div className="table-header">
                <span className="header-index">#</span>
                {columns.map((col, idx) => (
                    <span key={idx} className={`header-${col.className}`}>{col.label}</span>
                ))}
            </div>
            <div className="table-body" style={{ overflowY: 'auto', flex: 1 }}>
                {displayData.map((item, index) => (
                    <div key={index} className={`table-row ${index % 2 === 0 ? 'even' : 'odd'}`} style={{ height: '45px' }}>
                        <span className="row-index">{index + 1}</span>
                        {columns.map((col, idx) => (
                            <span key={idx} className={`row-${col.className}`} title={item[col.key] || ''}>
                                {col.render ? col.render(item) : (item[col.key] || (col.key === 'cp' ? '-' : ''))}
                            </span>
                        ))}
                    </div>
                ))}
                {isTruncated && (
                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        ⚠ Mostrando los primeros {MAX_ITEMS} registros. Exporte a Excel para ver todo.
                    </div>
                )}
                {displayData.length === 0 && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No se encontraron resultados.
                    </div>
                )}
            </div>
            <div className="table-footer">
                Mostrando: {filteredData.length.toLocaleString()}
            </div>
        </div>
    );
};

export default VirtualTable;

