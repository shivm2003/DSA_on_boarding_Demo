import React from 'react';

const VerificationModal = ({ verificationModalData, setVerificationModalData, handleApproveAndMap }) => {
  if (!verificationModalData) return null;

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-content glass-panel" style={{ width: '500px', maxHeight: '80vh', overflowY: 'auto', backgroundColor: '#fff', padding: '2rem', borderRadius: '8px' }}>
        <div className="flex justify-between items-center mb-4 border-bottom pb-2">
          <h3>Verify Extracted Data</h3>
          <span className="badge badge-primary">{verificationModalData.docType}</span>
        </div>
        <p className="text-sm text-muted mb-4">Please verify and edit the extracted fields before mapping them to the form.</p>

        {Object.keys(verificationModalData.editedData).length === 0 ? (
          <p className="text-sm text-muted">No specific data fields were extracted from this document.</p>
        ) : (
          <div className="form-grid">
            {Object.keys(verificationModalData.editedData).map(key => (
              <div className="input-group full-width" key={key}>
                <label>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
                <input
                  type="text"
                  value={verificationModalData.editedData[key] || ''}
                  onChange={(e) => {
                    setVerificationModalData(prev => ({
                      ...prev,
                      editedData: {
                        ...prev.editedData,
                        [key]: e.target.value
                      }
                    }));
                  }}
                />
              </div>
            ))}
          </div>
        )}

        <div className="mt-4">
          <h4 className="text-sm font-semibold mb-2 text-muted">Raw Data (For Verification)</h4>
          <textarea
            className="form-control"
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#f9f9f9', fontSize: '0.875rem' }}
            rows="6"
            readOnly
            value={verificationModalData.rawText || 'No raw text available'}
          />
        </div>

        <div className="flex justify-end gap-3 mt-5">
          <button className="btn btn-secondary" onClick={() => setVerificationModalData(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleApproveAndMap}>Approve & Map</button>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;
