import React from 'react';
import { Loader2, FileText } from 'lucide-react';
import { BASE_DOCS, ENTITY_ADDITIONAL_DOCS } from '../constants';

const Step1Documents = ({
  formData,
  handleEntityTypeChange,
  isVerificationLocked,
  docParseStatus,
  handleDocumentUpload,
  extractionStatus,
  renderVerificationTag,
  renderOcrOutputBox,
  handlePartnerDocumentUpload,
  verificationCompleted,
  addPartner
}) => {
  const renderUploadField = (fieldKey, label, desc, hasOcr = false, mandatory = true) => {
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

          {hasOcr && renderOcrOutputBox(fieldKey)}
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
            Additional Documents — {formData.entityType}
          </h3>
          <p className="text-sm text-muted mb-3">
            {formData.entityType === 'Proprietorship' && 'Required for Proprietorship Firm registration.'}
            {formData.entityType === 'Partnership' && 'Required for all partners of the Partnership Firm.'}
            {formData.entityType === 'Private/Public Ltd Company' && 'Required for company incorporation and directors.'}
          </p>
          <div className="form-grid">
            {ENTITY_ADDITIONAL_DOCS[formData.entityType].map(doc =>
              renderUploadField(doc.key, doc.label, doc.desc, doc.hasOcr, doc.mandatory)
            )}
          </div>
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
                  <label>PAN</label>
                  <div className="file-upload-zone">
                    <FileText size={24} className="mb-2 text-muted" />
                    <p>Upload partner PAN document</p>
                    <input
                      type="file"
                      onChange={(e) => handlePartnerDocumentUpload(index, 'panUpload', e.target.files[0])}
                      accept=".pdf,.jpg,.jpeg,.png"
                      disabled={verificationCompleted}
                    />
                    {renderVerificationTag(partner.panUpload, extractionStatus.partnerOcr[index])}
                    {partner.panUpload && <p className="text-success text-sm mt-2">✓ {partner.panUpload.name}</p>}
                  </div>
                </div>
                <div className="input-group full-width">
                  <label>ID Proof</label>
                  <div className="file-upload-zone">
                    <FileText size={24} className="mb-2 text-muted" />
                    <p>Upload partner ID proof</p>
                    <input
                      type="file"
                      onChange={(e) => handlePartnerDocumentUpload(index, 'idProofUpload', e.target.files[0])}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    {renderVerificationTag(partner.idProofUpload, extractionStatus.partnerOcr[index])}
                    {partner.idProofUpload && <p className="text-success text-sm mt-2">✓ {partner.idProofUpload.name}</p>}
                  </div>
                </div>
                <div className="input-group full-width">
                  <label>Address Proof</label>
                  <div className="file-upload-zone">
                    <FileText size={24} className="mb-2 text-muted" />
                    <p>Upload partner address proof</p>
                    <input
                      type="file"
                      onChange={(e) => handlePartnerDocumentUpload(index, 'addressProofUpload', e.target.files[0])}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    {renderVerificationTag(partner.addressProofUpload, extractionStatus.partnerOcr[index])}
                    {partner.addressProofUpload && <p className="text-success text-sm mt-2">✓ {partner.addressProofUpload.name}</p>}
                  </div>
                </div>
                <div className="input-group full-width">
                  <label>GST</label>
                  <div className="file-upload-zone">
                    <FileText size={24} className="mb-2 text-muted" />
                    <p>Upload partner GST document</p>
                    <input
                      type="file"
                      onChange={(e) => handlePartnerDocumentUpload(index, 'gstCertificateUpload', e.target.files[0])}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    {renderVerificationTag(partner.gstCertificateUpload, extractionStatus.partnerOcr[index])}
                    {partner.gstCertificateUpload && <p className="text-success text-sm mt-2">✓ {partner.gstCertificateUpload.name}</p>}
                  </div>
                </div>
                <div className="input-group full-width">
                  <label>MSME Certificate</label>
                  <div className="file-upload-zone">
                    <FileText size={24} className="mb-2 text-muted" />
                    <p>Upload partner MSME certificate</p>
                    <input
                      type="file"
                      onChange={(e) => handlePartnerDocumentUpload(index, 'msmeCertificateUpload', e.target.files[0])}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    {renderVerificationTag(partner.msmeCertificateUpload, extractionStatus.partnerOcr[index])}
                    {partner.msmeCertificateUpload && <p className="text-success text-sm mt-2">✓ {partner.msmeCertificateUpload.name}</p>}
                  </div>
                </div>
                <div className="input-group full-width">
                  <label>Udyam Certificate</label>
                  <div className="file-upload-zone">
                    <FileText size={24} className="mb-2 text-muted" />
                    <p>Upload partner Udyam certificate</p>
                    <input
                      type="file"
                      onChange={(e) => handlePartnerDocumentUpload(index, 'udyamCertificateUpload', e.target.files[0])}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    {renderVerificationTag(partner.udyamCertificateUpload, extractionStatus.partnerOcr[index])}
                    {partner.udyamCertificateUpload && <p className="text-success text-sm mt-2">✓ {partner.udyamCertificateUpload.name}</p>}
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
    </div>
  );
};

export default Step1Documents;
