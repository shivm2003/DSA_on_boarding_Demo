import React, { useState, useRef } from 'react';
import { FileCheck, ChevronDown, ChevronUp, Shield, X, Copy, CheckSquare } from 'lucide-react';

const DOC_TYPE_COLORS = {
  PAN: { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8', label: 'PAN Card' },
  AADHAAR: { bg: '#fff7ed', border: '#fed7aa', text: '#c2410c', label: 'Aadhaar Card' },
  GST: { bg: '#ecfdf5', border: '#bbf7d0', text: '#047857', label: 'GST Certificate' },
  UDYAM: { bg: '#f5f3ff', border: '#ddd6fe', text: '#6d28d9', label: 'MSME / Udyam' },
  CHEQUE: { bg: '#fdf2f8', border: '#fbcfe8', text: '#be185d', label: 'Cancelled Cheque' },
  BANK_STATEMENT: { bg: '#fdf2f8', border: '#fbcfe8', text: '#be185d', label: 'Bank Statement' },
  VOTER_ID: { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534', label: 'Voter ID' },
  PASSPORT: { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af', label: 'Passport' },
  DL: { bg: '#fffbeb', border: '#fde68a', text: '#92400e', label: 'Driving License' },
  ELECTRICITY_BILL: { bg: '#fffbeb', border: '#fde68a', text: '#92400e', label: 'Electricity Bill' },
  RENT_AGREEMENT: { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', label: 'Rent Agreement' },
};

const VerificationModal = ({ verificationModalData, setVerificationModalData, handleApproveAndMap }) => {
  const [showRawText, setShowRawText] = useState(false);
  const rawTextRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    if (verificationModalData?.rawText) {
      navigator.clipboard.writeText(verificationModalData.rawText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSelectAll = (e) => {
    e.stopPropagation();
    if (rawTextRef.current) {
      const range = document.createRange();
      range.selectNodeContents(rawTextRef.current);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  };

  if (!verificationModalData) return null;

  const docType = verificationModalData.docType || 'UNKNOWN';
  const colors = DOC_TYPE_COLORS[docType] || { bg: '#f8fafc', border: '#e2e8f0', text: '#475569', label: docType };
  const fields = verificationModalData.editedData || {};
  const fieldKeys = Object.keys(fields);

  return (
    <div className="ocr-modal-overlay animate-in">
      <div className="ocr-modal-container animate-in" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ocr-modal-header">
          <div className="ocr-modal-header-left">
            <div className="ocr-modal-icon" style={{ background: colors.bg, border: `2px solid ${colors.border}` }}>
              <FileCheck size={22} style={{ color: colors.text }} />
            </div>
            <div>
              <h3 className="ocr-modal-title">Verify Extracted Data</h3>
              <span className="ocr-modal-doc-badge" style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                {colors.label}
              </span>
            </div>
          </div>
        </div>

        {/* Scanning Animation Bar */}
        <div className="ocr-scanning-bar">
          <div className="ocr-scanning-fill"></div>
        </div>

        {/* Body */}
        <div className="ocr-modal-body">
          <div className="ocr-modal-hint">
            <Shield size={14} />
            <span>Please verify the extracted fields before mapping to the form.</span>
          </div>

          {fieldKeys.length === 0 ? (
            <p className="ocr-modal-empty">No specific data fields were extracted from this document.</p>
          ) : (
            <div className="ocr-field-grid">
              {fieldKeys.map(key => (
                <div className="ocr-field-card" key={key}>
                  <label className="ocr-field-label">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
                  <input
                    type="text"
                    className="ocr-field-input"
                    value={fields[key] || ''}
                    onChange={(e) => {
                      setVerificationModalData(prev => ({
                        ...prev,
                        editedData: { ...prev.editedData, [key]: e.target.value }
                      }));
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Collapsible Raw Text */}
          <div className="ocr-raw-toggle" onClick={() => setShowRawText(!showRawText)}>
            <span>Raw OCR Text</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {showRawText && (
                <>
                  <button onClick={handleSelectAll} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '4px 8px', background: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#1e293b' }}>
                    <CheckSquare size={12} /> Select All
                  </button>
                  <button onClick={handleCopy} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '4px 8px', background: copied ? '#bbf7d0' : '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer', color: copied ? '#166534' : '#1e293b' }}>
                    <Copy size={12} /> {copied ? 'Copied!' : 'Copy'}
                  </button>
                </>
              )}
              {showRawText ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
          {showRawText && (
            <div className="ocr-raw-text-box" style={{ position: 'relative' }}>
              <pre ref={rawTextRef} style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', padding: '12px', background: '#f8fafc', borderRadius: '4px', fontSize: '12px' }}>
                {verificationModalData.rawText || 'No raw text available'}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="ocr-modal-footer">
          <button className="btn btn-primary" onClick={handleApproveAndMap}>
            <FileCheck size={16} />
            Approve & Map
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;
