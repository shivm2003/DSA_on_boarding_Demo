import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, FileText, Eye, X } from 'lucide-react';
import { BASE_DOCS, ENTITY_ADDITIONAL_DOCS, KYC_DOCUMENT_OPTIONS } from '../constants';

const Step1Documents = ({
  formData,
  setFormData,
  handleEntityTypeChange,
  isVerificationLocked,
  docParseStatus,
  handleDocumentUpload,
  extractionStatus,
  renderVerificationTag,
  handlePartnerDocumentUpload,
  addPartner,
  validationError
}) => {
  const [previewModal, setPreviewModal] = useState(null); // { url, name }

  const getUploadedLabel = (value) => {
    if (!value) return '';
    if (Array.isArray(value)) return value.map(file => file.name).join(', ');
    return value.name || value.filename || String(value);
  };

  const handlePreview = (e, fileData) => {
    e.preventDefault();
    e.stopPropagation();
    if (!fileData) return;
    const fileToPreview = Array.isArray(fileData) ? fileData[0] : fileData;
    if (fileToPreview instanceof File || fileToPreview instanceof Blob) {
      const url = URL.createObjectURL(fileToPreview);
      setPreviewModal({ url, name: fileToPreview.name });
    }
  };

  const closePreview = () => {
    if (previewModal?.url) URL.revokeObjectURL(previewModal.url);
    setPreviewModal(null);
  };

  const validateKycFiles = (files, selectedType) => {
    const option = KYC_DOCUMENT_OPTIONS.find(item => item.value === selectedType);
    if (!option) {
      alert('Please select KYC document type first.');
      return false;
    }

    const pdfFiles = files.filter(file => file.name.toLowerCase().endsWith('.pdf'));
    const imageFiles = files.filter(file => /\.(jpe?g|png)$/i.test(file.name));

    if (option.requiresPdfOnly) {
      if (files.length !== 1 || pdfFiles.length !== 1) {
        alert(`${option.label} must be uploaded as one PDF file only.`);
        return false;
      }
      return true;
    }

    if (pdfFiles.length === 1 && files.length === 1) return true;
    if (pdfFiles.length === 0 && imageFiles.length >= 2 && imageFiles.length === files.length) return true;

    alert(`${option.label} requires either one PDF or minimum two image files.`);
    return false;
  };

  const handleKycTypeChange = (event) => {
    const selectedType = event.target.value;
    setFormData(prev => {
      const parsedDocuments = { ...(prev.parsedDocuments || {}) };
      delete parsedDocuments.addressProofUpload;

      return {
        ...prev,
        kycDocumentType: selectedType,
        kycDocumentNumber: '',
        addressProofUpload: null,
        parsedDocuments
      };
    });
  };

  const renderKycUploadField = (label, desc, mandatory) => {
    const selectedOption = KYC_DOCUMENT_OPTIONS.find(option => option.value === formData.kycDocumentType);
    const fileUploaded = !!formData.addressProofUpload;
    const accept = selectedOption?.requiresPdfOnly ? '.pdf' : '.pdf,.jpg,.jpeg,.png';

    return (
      <div className="input-group full-width" key="addressProofUpload">
        <div className="doc-label-row">
          <label>{label}</label>
          {mandatory
            ? <span className="badge-mandatory">Mandatory</span>
            : <span className="badge-optional">Optional</span>
          }
        </div>

        <div className="file-upload-row">
          <div className={`file-upload-zone${fileUploaded ? ' has-file' : ''}`}>
            {docParseStatus.addressProofUpload === 'parsing' ? (
              <div className="flex flex-col items-center justify-center text-muted" style={{ padding: '1rem' }}>
                <Loader2 size={32} className="spin mb-2" />
                <p>Parsing document...</p>
              </div>
            ) : (
              <>
                {fileUploaded && (
                  <button
                    className="preview-btn"
                    title="Preview Document"
                    onClick={(e) => handlePreview(e, formData.addressProofUpload)}
                  >
                    <Eye size={18} />
                  </button>
                )}
                <FileText size={24} className="mb-1 text-muted" />

                <select
                  name="kycDocumentType"
                  value={formData.kycDocumentType || ''}
                  onChange={handleKycTypeChange}
                  style={{ position: 'relative', zIndex: 3, fontSize: '0.75rem', padding: '4px 8px', maxWidth: '180px', borderRadius: '4px', border: '1px solid var(--border-default)', outline: 'none' }}
                >
                  <option value="">Select KYC Type</option>
                  {KYC_DOCUMENT_OPTIONS.map(option => (
                    <option value={option.value} key={option.value}>{option.label}</option>
                  ))}
                </select>

                <p style={{ marginTop: '8px' }}>{fileUploaded ? `Uploaded: ${getUploadedLabel(formData.addressProofUpload)}` : desc}</p>
                <input
                  type="file"
                  multiple={!selectedOption?.requiresPdfOnly}
                  disabled={!formData.kycDocumentType}
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (!validateKycFiles(files, formData.kycDocumentType)) {
                      e.target.value = '';
                      return;
                    }
                    handleDocumentUpload('addressProofUpload', files, formData.kycDocumentType);
                  }}
                  accept={accept}
                />
                {renderVerificationTag(formData.addressProofUpload, extractionStatus.companyOcr.addressProofUpload)}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderUploadField = (fieldKey, label, desc, hasOcr = false, mandatory = true) => {
    if (fieldKey === 'addressProofUpload') {
      return renderKycUploadField(label, desc, mandatory);
    }

    const fileUploaded = !!formData[fieldKey];
    return (
      <div className="input-group full-width" key={fieldKey}>
        <div className="doc-label-row">
          <label>{label}</label>
          {mandatory
            ? <span className="badge-mandatory">Mandatory</span>
            : <span className="badge-optional">Optional</span>
          }
        </div>
        <div className="file-upload-row">
          <div className={`file-upload-zone${fileUploaded ? ' has-file' : ''}`}>
            {docParseStatus[fieldKey] === 'parsing' ? (
              <div className="flex flex-col items-center justify-center text-muted" style={{ padding: '1rem' }}>
                <Loader2 size={32} className="spin mb-2" />
                <p>Parsing document...</p>
              </div>
            ) : (
              <>
                {fileUploaded && (
                  <button
                    className="preview-btn"
                    title="Preview Document"
                    onClick={(e) => handlePreview(e, formData[fieldKey])}
                  >
                    <Eye size={18} />
                  </button>
                )}
                <FileText size={24} className="mb-2 text-muted" />
                <p>{fileUploaded ? `✓ ${formData[fieldKey].name}` : desc}</p>
                <input
                  type="file"
                  onChange={(e) => handleDocumentUpload(fieldKey, e.target.files[0])}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                {hasOcr && extractionStatus.companyOcr[fieldKey] !== undefined &&
                  renderVerificationTag(formData[fieldKey], extractionStatus.companyOcr[fieldKey])}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const additionalDocs = ENTITY_ADDITIONAL_DOCS[formData.entityType] || [];
  const allDocFields = [...BASE_DOCS, ...additionalDocs].map(d => d.key);
  const uploaded = allDocFields.filter(f => !!formData[f]).length;
  const pct = Math.round((uploaded / allDocFields.length) * 100);

  return (
    <div className={`step-content animate-fade-in${isVerificationLocked ? ' locked-step' : ''}`} inert={isVerificationLocked ? "" : undefined}>
      {isVerificationLocked && (
        <div className="locked-overlay">Verification complete. Pages 1–4 are read-only after verification.</div>
      )}
      <div className="flex justify-between items-center border-bottom mb-4 pb-2">
        <h2>Document Upload with OCR</h2>
        <span className="badge badge-success">Essential Documents</span>
      </div>

      <p className="mb-6 text-sm text-muted">Select the entity type and upload the required documents. Partnership allows adding multiple partners.</p>

      <div className="form-grid">
        <div className="input-group full-width">
          <label>Entity Type</label>
          <select name="entityType" value={formData.entityType} onChange={handleEntityTypeChange}>
            <option value="Individual">Individual</option>
            <option value="Proprietorship">Proprietorship</option>
            <option value="Partnership">Partnership</option>
            <option value="Private/Public Ltd Company">Private/Public Ltd Company</option>
          </select>
        </div>
      </div>

      <div className="section-divider"></div>

      <div className="doc-upload-progress">
        <span>{uploaded} / {allDocFields.length} documents uploaded</span>
        <div className="doc-upload-progress-bar">
          <div className="doc-upload-progress-fill" style={{ width: `${pct}%` }}></div>
        </div>
        <span style={{ fontWeight: 700 }}>{pct}%</span>
      </div>

      <h3 className="section-subheading mt-4">Common Required Documents</h3>
      <p className="text-sm text-muted mb-3">These documents are required for all entity types.</p>
      <div className="form-grid">
        {BASE_DOCS.map(doc =>
          renderUploadField(doc.key, doc.label, doc.desc, doc.hasOcr, doc.mandatory)
        )}
      </div>

      {ENTITY_ADDITIONAL_DOCS[formData.entityType] && (
        <>
          <div className="section-divider mt-6"></div>
          <h3 className="section-subheading mt-4">
            {formData.entityType === 'Proprietorship'
              ? 'Additional Documents — Proprietorship (Minimum one required Documents)'
              : formData.entityType === 'Partnership'
                ? 'Additional Documents — Partnership Firm (Minimum one required Documents)'
                : `Additional Documents — ${formData.entityType}`
            }
          </h3>
          <p className="text-sm text-muted mb-3">
            {formData.entityType === 'Proprietorship' && 'Required for Proprietorship Firm registration.'}
            {formData.entityType === 'Partnership' && 'Required for Partnership Firm registration.'}
            {formData.entityType === 'Private/Public Ltd Company' && 'Required for company incorporation and directors.'}
          </p>
          <div className="form-grid">
            {ENTITY_ADDITIONAL_DOCS[formData.entityType].map(doc =>
              renderUploadField(doc.key, doc.label, doc.desc, doc.hasOcr, doc.mandatory)
            )}
          </div>
          {validationError && <p className="text-error text-sm mt-2">{validationError}</p>}
        </>
      )}

      {(formData.entityType === 'Partnership' || formData.entityType === 'Private/Public Ltd Company') && (
        <>
          <div className="section-divider mt-6"></div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="section-subheading">
              {formData.entityType === 'Private/Public Ltd Company' ? 'Director Document Uploads' : 'Partner Document Uploads'}
            </h3>
          </div>

          {formData.partnerUploads.map((partner, index) => (
            <div className="partner-card glass-panel mt-4" key={index}>
              <div className="flex justify-between items-center mb-3">
                <h4>{formData.entityType === 'Private/Public Ltd Company' ? `Director ${index + 1}` : `Partner ${index + 1}`}</h4>
                <span className="badge badge-secondary">{formData.entityType === 'Private/Public Ltd Company' ? 'Director Documents' : 'Partner Documents'}</span>
              </div>
              <div className="form-grid">
                <div className="input-group full-width">
                  <label>Address Proof</label>
                  <div className={`file-upload-zone${partner.addressProofUpload ? ' has-file' : ''}`}>
                    <FileText size={24} className="mb-2 text-muted" />
                    <p>{partner.addressProofUpload ? `✓ ${partner.addressProofUpload.name}` : 'Upload partner address proof'}</p>
                    <input
                      type="file"
                      onChange={(e) => handlePartnerDocumentUpload(index, 'addressProofUpload', e.target.files[0])}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    {renderVerificationTag(partner.addressProofUpload, extractionStatus.partnerOcr[index]?.addressProofUpload)}
                  </div>
                </div>

                <div className="input-group full-width">
                  <label>PAN Card</label>
                  <div className={`file-upload-zone${partner.panCardUpload ? ' has-file' : ''}`}>
                    <FileText size={24} className="mb-2 text-muted" />
                    <p>{partner.panCardUpload ? `✓ ${partner.panCardUpload.name}` : 'Upload partner PAN card'}</p>
                    <input
                      type="file"
                      onChange={(e) => handlePartnerDocumentUpload(index, 'panCardUpload', e.target.files[0])}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    {renderVerificationTag(partner.panCardUpload, extractionStatus.partnerOcr[index]?.panCardUpload)}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-end mt-5">
            <button type="button" className="btn btn-secondary" onClick={addPartner}>
              {formData.entityType === 'Private/Public Ltd Company' ? 'Add Director' : 'Add Partner'}
            </button>
          </div>
        </>
      )}

      {previewModal && createPortal(
        <div className="doc-preview-overlay" onClick={closePreview}>
          <div className="doc-preview-container" onClick={(e) => e.stopPropagation()}>
            <div className="doc-preview-header">
              <span className="doc-preview-filename">{previewModal.name}</span>
              <button className="doc-preview-close" onClick={closePreview} title="Close preview">
                <X size={18} />
              </button>
            </div>
            <iframe src={previewModal.url} title="Document preview" className="doc-preview-iframe" />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Step1Documents;