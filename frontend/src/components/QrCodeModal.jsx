import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { X, Download, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function QrCodeModal({ isOpen, onClose, shortUrl, title }) {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && canvasRef.current && shortUrl) {
      QRCode.toCanvas(
        canvasRef.current,
        shortUrl,
        {
          width: 240,
          margin: 2,
          color: {
            dark: '#0a0f1d', // Match app background
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error('Failed to generate QR Code:', error);
        }
      );
    }
  }, [isOpen, shortUrl]);

  if (!isOpen) return null;

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr_${title.replace(/\s+/g, '_').toLowerCase()}.png`;
      a.click();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>QR Code Scanner</h3>
          <button className="btn-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="qr-container">
            <canvas ref={canvasRef}></canvas>
          </div>
          
          <div className="url-preview-box">
            <span className="url-label">Short Link:</span>
            <span className="url-text mono">{shortUrl}</span>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleCopy}>
            {copied ? <Check size={16} color="var(--success)" /> : <Copy size={16} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button className="btn btn-primary" onClick={handleDownload}>
            <Download size={16} />
            <span>Download PNG</span>
          </button>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(3, 7, 18, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1.5rem;
        }

        .modal-content {
          max-width: 400px;
          width: 100%;
          padding: 1.75rem;
          border-radius: var(--radius-lg);
          background: #0f172a; /* Solid dark color with transparency */
          border: 1px solid var(--border-color);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .modal-header h3 {
          font-size: 1.25rem;
          color: white;
        }

        .btn-close {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          border-radius: 50%;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
        }

        .btn-close:hover {
          color: white;
          background: rgba(255, 255, 255, 0.05);
        }

        .modal-body {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
          margin-bottom: 1.5rem;
        }

        .qr-container {
          background: white;
          padding: 1rem;
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-md);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .qr-container canvas {
          display: block;
        }

        .url-preview-box {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 0.75rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .url-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
        }

        .url-text {
          font-size: 0.85rem;
          color: var(--accent-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
        }

        .modal-footer .btn {
          flex: 1;
        }
      `}</style>
    </div>
  );
}
