
import React, { useRef, useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import './FileUploader.css';

const FileUploader = ({ title, accept = ".txt", onFileSelect, fileStatus }) => {
    const inputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleClick = () => {
        inputRef.current.click();
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            onFileSelect(e.target.files[0]);
        }
    };

    return (
        <div className="file-uploader-container">
            <h3>{title}</h3>
            <div
                className={`drop-zone glass-panel ${isDragging ? 'dragging' : ''} ${fileStatus?.name ? 'has-file' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                <input
                    type="file"
                    ref={inputRef}
                    onChange={handleChange}
                    accept={accept}
                    style={{ display: 'none' }}
                />

                <div className="icon-wrapper">
                    {fileStatus ? <CheckCircle size={40} color="var(--success)" /> : <Upload size={40} />}
                </div>

                <div className="text-content">
                    {fileStatus ? (
                        <>
                            <p className="filename">{fileStatus.name}</p>
                            <p className="filesize">{(fileStatus.size / 1024).toFixed(2)} KB</p>
                        </>
                    ) : (
                        <>
                            <p className="instruction">Arrastra tu archivo aquí</p>
                            <p className="sub-instruction">o haz clic para buscar</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FileUploader;
