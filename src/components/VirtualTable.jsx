
import React from 'react';
// The installed version of react-window seems to export 'List' instead of 'FixedSizeList'
// based on inspection of node_modules/react-window/dist/react-window.js
// "Ae as List" see output above.
import { List as FixedSizeList } from 'react-window';
import './VirtualTable.css';

const List = FixedSizeList;

const Row = ({ index, style, data }) => {
    const item = data[index];

    const cuit = item.cuit || '';
    const content = item.display || item.raw || '';

    return (
        <div style={style} className={`table-row ${index % 2 === 0 ? 'even' : 'odd'}`}>
            <span className="row-index">{index + 1}</span>
            <span className="row-cuit">{cuit}</span>
            <span className="row-content" title={content}>{content}</span>
        </div>
    );
};

const VirtualTable = ({ data, height = 500 }) => {
    if (!data || data.length === 0) {
        return (
            <div className="empty-table-state">
                <p>No hay datos para mostrar</p>
            </div>
        );
    }

    return (
        <div className="virtual-table-container glass-panel">
            <div className="table-header">
                <span className="header-index">#</span>
                <span className="header-cuit">CUIT</span>
                <span className="header-content">Contenido / Razón Social</span>
            </div>
            <div className="table-body">
                <List
                    height={height}
                    itemCount={data.length}
                    itemSize={45}
                    width={'100%'}
                    itemData={data}
                >
                    {Row}
                </List>
            </div>
            <div className="table-footer">
                Total: {data.length.toLocaleString()} registros
            </div>
        </div>
    );
};

export default VirtualTable;
