import React, { useRef } from 'react';
import { Smartphone, CheckCircle, FileText, Shield, Printer, Users, Building2, MapPin, CreditCard, ClipboardCheck, UserCheck, AlertCircle } from 'lucide-react';
import { BASE_DOCS, ENTITY_ADDITIONAL_DOCS, KYC_DOC_TYPE_LABELS } from '../constants';

const Step5ESigning = ({ formData, setFormData, handleInputChange }) => {
  const appFormRef = useRef(null);
  const rcuFormRef = useRef(null);

  // ── Consent handlers ──
  const handleConsentChange = (e) => {
    setFormData(prev => ({ ...prev, esignConsent: e.target.checked }));
  };

  const handleSendEsignOtp = () => {
    setFormData(prev => ({
      ...prev,
      esignOtpSent: true,
      esignOtpError: '',
      esignOtpVerified: false
    }));
  };

  const handleVerifyEsignOtp = () => {
    setFormData(prev => {
      const isValid = prev.esignOtp === '12345';
      return {
        ...prev,
        esignOtpVerified: isValid,
        esignOtpError: isValid ? '' : 'Invalid OTP. Please use 12345.',
        esignOtpSent: !isValid
      };
    });
  };

  const handleOpenInNewTab = (ref) => {
    if (!ref.current) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Application Form</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 24px; color: #1a202c; font-size: 13px; }
            .app-form-header { display: flex; align-items: center; gap: 16px; padding-bottom: 16px; border-bottom: 3px solid #9b1b30; margin-bottom: 24px; }
            .app-form-header img { height: 48px; }
            .app-form-header h1 { font-size: 20px; color: #9b1b30; margin: 0; }
            .app-form-header p { font-size: 12px; color: #718096; margin: 4px 0 0; }
            .app-section { margin-bottom: 20px; }
            .app-section-title { font-size: 14px; font-weight: 700; color: #9b1b30; padding: 6px 12px; background: #fdf2f4; border-left: 4px solid #9b1b30; margin-bottom: 12px; }
            .app-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; }
            .app-field { padding: 6px 0; border-bottom: 1px dotted #e2e8f0; }
            .app-field-label { font-size: 11px; color: #718096; text-transform: uppercase; letter-spacing: 0.5px; }
            .app-field-value { font-size: 13px; font-weight: 600; color: #1a202c; margin-top: 2px; }
            .app-field.full { grid-column: span 2; }
            .doc-check { display: flex; align-items: center; gap: 8px; padding: 4px 0; }
            .doc-check .check { color: #047857; font-weight: 700; }
            .doc-check .cross { color: #dc2626; font-weight: 700; }
            .mandatory-star { color: #dc2626; }
            .rcu-header { background: #1a202c; color: #fff; padding: 16px; text-align: center; margin-bottom: 20px; }
            .rcu-header h2 { margin: 0; font-size: 18px; }
            .rcu-header p { margin: 4px 0 0; font-size: 12px; opacity: 0.8; }
            @media print { body { padding: 12px; } }
          </style>
        </head>
        <body>${ref.current.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
  };

  // ── Helper: render a field row ──
  const renderField = (label, value, mandatory = false, fullWidth = false) => (
    <div className={`app-field${fullWidth ? ' full' : ''}`}>
      <div className="app-field-label">
        {label} {mandatory && <span className="mandatory-star">*</span>}
      </div>
      <div className="app-field-value">{value || '—'}</div>
    </div>
  );

  // ── Helper: check if doc uploaded ──
  const isDocUploaded = (key) => !!formData[key];

  const isNonIndividual = formData.entityType !== 'Individual';
  const isPartnership = formData.entityType === 'Partnership' || formData.entityType === 'Private/Public Ltd Company';

  const getMissingFields = () => {
    const missing = [];
    if (!formData.companyName) missing.push({ key: 'companyName', label: 'Company / Vendor Name', type: 'text' });
    if (!formData.dateOfInc) missing.push({ key: 'dateOfInc', label: 'Date of Incorporation / DOB', type: 'date' });
    if (!formData.registeredAddress) missing.push({ key: 'registeredAddress', label: 'Registered Address', type: 'text' });
    if (!formData.pincode) missing.push({ key: 'pincode', label: 'Pincode', type: 'text', maxLength: 6 });
    if (!formData.state) missing.push({ key: 'state', label: 'State', type: 'text' });
    if (!formData.city) missing.push({ key: 'city', label: 'City', type: 'text' });
    
    if (formData.entityType === 'Partnership' || formData.entityType === 'Private/Public Ltd Company') {
      if (!formData.numberOfPartners) missing.push({ key: 'numberOfPartners', label: 'Number of Partners/Directors', type: 'number', min: 1, max: 10 });
    }
    
    return missing;
  };

  const missingFields = getMissingFields();

  return (
    <div className="step-content animate-fade-in esign-section">
      <h2 className="esign-title">E-Signing & Submission</h2>
      <div className="esign-divider"></div>

      {missingFields.length > 0 && (
        <div className="esign-card mb-6" style={{ borderLeft: '4px solid #dc2626' }}>
          <div className="esign-card-header">
            <div className="esign-card-titles">
              <h3 style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <AlertCircle size={20} />
                Missing Mandatory Information
              </h3>
              <p style={{ marginTop: '8px' }}>Please fill in the following mandatory fields based on your Entity Type ({formData.entityType}) before proceeding to e-signing.</p>
            </div>
          </div>
          <div className="esign-card-inner-divider"></div>
          <div className="form-grid" style={{ padding: '0 24px 24px' }}>
            {missingFields.map(field => (
              <div className="input-group" key={field.key}>
                <label>{field.label} <span className="text-error">*</span></label>
                <input
                  type={field.type}
                  name={field.key}
                  value={formData[field.key] || ''}
                  onChange={handleInputChange}
                  maxLength={field.maxLength}
                  min={field.min}
                  max={field.max}
                  style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {missingFields.length === 0 && (
        <>
      {/* ─── Section A: E-Sign Link ─── */}
      <div className="esign-card mb-6">
        <div className="esign-card-header">
          <div className="status-indicator"></div>
          <div className="esign-card-titles">
            <h3>Agreement Generation</h3>
            <p>The Agreement is ready for e-signing via Leegality.</p>
          </div>
        </div>
        <div className="esign-card-inner-divider"></div>
        <div className="esign-input-section">
          <label className="esign-label">Mobile Number for E-Sign Link</label>
          <input
            type="tel"
            name="esignPhone"
            className="esign-input"
            value={formData.esignPhone !== undefined ? formData.esignPhone : (formData.phone || '')}
            onChange={handleInputChange}
            maxLength={10}
          />
          <button className="btn btn-primary esign-btn" onClick={() => alert('E-Sign link sent to ' + (formData.esignPhone !== undefined ? formData.esignPhone : formData.phone))}>
            <Smartphone size={16} />
            Send E-Sign Link
          </button>
        </div>
      </div>

      {/* ─── Section B: SPOC Consent ─── */}
      <div className="consent-section">
        <div className="consent-header">
          <Shield size={20} />
          <h3>SPOC Consent & Verification</h3>
        </div>
        <div className="consent-body">
          <div className="consent-spoc-info">
            <div className="consent-spoc-avatar">
              {(formData.spocName || 'S').charAt(0).toUpperCase()}
            </div>
            <div>
              <strong>{formData.spocName || 'SPOC'}</strong>
              <span className="consent-spoc-code">{formData.spocEmployeeCode || ''}</span>
            </div>
          </div>

          <label className="consent-checkbox-wrapper">
            <input
              type="checkbox"
              checked={formData.esignConsent || false}
              onChange={handleConsentChange}
              className="consent-checkbox"
            />
            <span className="consent-text">
              I, <strong>{formData.spocName || '[SPOC Name]'}</strong>, hereby confirm that all the information provided in this onboarding application has been thoroughly verified and is accurate to the best of my knowledge. I authorize the submission of this application for final processing.
            </span>
          </label>

          {/* OTP Section */}
          <div className="consent-otp-section">
            <button
              className="btn btn-primary"
              onClick={handleSendEsignOtp}
              disabled={!formData.esignConsent || formData.esignOtpVerified}
            >
              <Smartphone size={16} />
              {formData.esignOtpVerified ? 'OTP Verified' : 'Send OTP'}
            </button>

            {formData.esignOtpSent && !formData.esignOtpVerified && (
              <div className="consent-otp-row">
                <input
                  type="text"
                  name="esignOtp"
                  value={formData.esignOtp || ''}
                  onChange={handleInputChange}
                  placeholder="Enter OTP"
                  maxLength={5}
                  className="consent-otp-input"
                />
                <button className="btn btn-primary" onClick={handleVerifyEsignOtp}>
                  Verify OTP
                </button>
              </div>
            )}

            {formData.esignOtpError && (
              <p className="text-error text-sm mt-1">{formData.esignOtpError}</p>
            )}
            {formData.esignOtpVerified && (
              <div className="consent-verified-badge">
                <CheckCircle size={16} />
                <span>OTP Verified Successfully — Application forms are now visible below.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Section C: Application Summary Form (visible after OTP verified) ─── */}
      {formData.esignOtpVerified && (
        <>
          <div className="form-preview-cards">
            <div className="form-preview-card" onClick={() => handleOpenInNewTab(appFormRef)}>
              <div className="form-preview-icon" style={{ background: 'linear-gradient(135deg, #fdf2f4, #fce7eb)' }}>
                <FileText size={28} style={{ color: '#9b1b30' }} />
              </div>
              <div className="form-preview-info">
                <h4>DSA Onboarding Application</h4>
                <p>Click to view full application form in new tab</p>
              </div>
            </div>
            <div className="form-preview-card" onClick={() => handleOpenInNewTab(rcuFormRef)}>
              <div className="form-preview-icon" style={{ background: 'linear-gradient(135deg, #edf2f7, #e2e8f0)' }}>
                <Shield size={28} style={{ color: '#2d3748' }} />
              </div>
              <div className="form-preview-info">
                <h4>RCU Verification Report</h4>
                <p>Click to view RCU report in new tab</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'none' }}>
            <div className="app-form" ref={appFormRef}>
              {/* Header with Logo */}
              <div className="app-form-header">
                <img src="/Logo.png" alt="Company Logo" className="app-form-logo" />
                <div>
                  <h1>DSA Onboarding Application</h1>
                  <p>Vendor Empanelment & Registration Form</p>
                </div>
                <div className="app-form-meta">
                  <div className="app-field-label">Application ID</div>
                  <div className="app-field-value">{formData.dsaCode || 'DRAFT'}</div>
                  <div className="app-field-label" style={{ marginTop: 4 }}>Date</div>
                  <div className="app-field-value">{formData.spocDate || new Date().toLocaleDateString('en-IN')}</div>
                </div>
              </div>

              {/* Company Details */}
              <div className="app-section">
                <div className="app-section-title">
                  <Building2 size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                  Company / Vendor Details
                </div>
                <div className="app-grid">
                  {renderField('Company / Vendor Name', formData.companyName, true)}
                  {renderField('Entity Type', formData.entityType, true)}
                  {renderField('Vendor Category', formData.vendorCategory)}
                  {renderField('Date of Incorporation / DOB', formData.dateOfInc)}
                  {isNonIndividual && renderField('Number of Partners/Directors', formData.numberOfPartners)}
                  {renderField('CIN', formData.cin)}
                </div>
              </div>

              {/* GST Details */}
              {isNonIndividual && formData.gstCertificateUpload && (
                <div className="app-section">
                  <div className="app-section-title">GST Details</div>
                  <div className="app-grid">
                    {renderField('GST Number', formData.gstNumber, true)}
                    {renderField('GST Address', formData.gstAddress, false, true)}
                  </div>
                </div>
              )}

              {/* MSME Details */}
              {formData.udyamCertificateUpload && (
                <div className="app-section">
                  <div className="app-section-title">MSME Details</div>
                  <div className="app-grid">
                    {renderField('Company / Vendor Name', formData.companyName, true)}
                    {renderField('MSME / Udyam Number', formData.msmeNumber, true)}
                    {renderField('Date of Incorporation', formData.dateOfInc, true)}
                    {renderField('Date of Commencement', formData.dateOfCommencement, true)}
                    {renderField('Registered Address', formData.registeredAddress, true, true)}
                  </div>
                </div>
              )}

              {/* Personal / Key Person Details */}
              <div className="app-section">
                <div className="app-section-title">
                  <UserCheck size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                  Personal / Key Person Details
                </div>
                {formData.entityType === 'Individual' ? (
                  <div className="app-grid">
                    {renderField('Full Name', formData.fullName, true)}
                    {renderField("Father's Name", formData.fatherName)}
                    {renderField('Date of Birth', formData.dob, true)}
                    {renderField('Address', formData.personalAddress, false, true)}
                  </div>
                ) : (
                  (formData.partnerDetails || []).map((partner, i) => (
                    <div key={i} className="app-partner-block">
                      <div className="app-partner-label">
                        {formData.entityType === 'Private/Public Ltd Company' ? `Director ${i + 1}` : `Partner ${i + 1}`}
                      </div>
                      <div className="app-grid">
                        {renderField('Full Name', partner.fullName, true)}
                        {renderField("Father's Name", partner.fatherName)}
                        {renderField('Date of Birth', partner.dob)}
                        {renderField('Designation', partner.designation)}
                        {renderField('Address', partner.personalAddress, false, true)}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Official Address */}
              <div className="app-section">
                <div className="app-section-title">
                  <MapPin size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                  Official Address
                </div>
                <div className="app-grid">
                  {renderField('Registered Address', formData.registeredAddress, true, true)}
                  {renderField('Pincode', formData.pincode, true)}
                  {renderField('State', formData.state, true)}
                  {renderField('City', formData.city, true)}
                </div>
              </div>

              {/* Serving State */}
              <div className="app-section">
                <div className="app-section-title">Serving State</div>
                <div className="app-grid">
                  {renderField('Service States', (formData.serviceState || []).join(', '))}
                  {renderField('Serving Branch', formData.serviceBranch)}
                </div>
              </div>

              {/* Contact Details */}
              <div className="app-section">
                <div className="app-section-title">Contact Details</div>
                <div className="app-grid">
                  {renderField('Email', formData.email, true)}
                  {renderField('Primary Phone', formData.phone, true)}
                  {renderField('Alternate Phone', formData.altContactNumber)}
                </div>
              </div>

              {/* KYC Details */}
              <div className="app-section">
                <div className="app-section-title">
                  <ClipboardCheck size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                  KYC & Additional Details
                </div>
                <div className="app-grid">
                  {isNonIndividual && renderField('Company PAN', formData.companyPan, true)}
                  {renderField('Individual PAN', formData.individualPan, true)}
                  {renderField('Aadhaar Number', formData.aadharNumber)}
                  {renderField('KYC Document Type', KYC_DOC_TYPE_LABELS[formData.kycDocumentType] || formData.kycDocumentType)}
                  {renderField('KYC Document Number', formData.kycDocumentNumber)}
                </div>
              </div>

              {/* Banking Details */}
              <div className="app-section">
                <div className="app-section-title">
                  <CreditCard size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                  Banking Details
                </div>
                <div className="app-grid">
                  {renderField('Bank Name', formData.bankName, true)}
                  {renderField('Account Number', formData.accountNumber, true)}
                  {renderField('IFSC Code', formData.ifscCode, true)}
                </div>
              </div>

              {/* Reference Details */}
              <div className="app-section">
                <div className="app-section-title">
                  <Users size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                  Reference Details
                </div>
                <div className="app-grid">
                  <div className="app-ref-block">
                    <strong className="app-ref-title">Reference 1</strong>
                    {renderField('Name', formData.ref1Name, true)}
                    {renderField('Mobile', formData.ref1Mobile, true)}
                    {renderField('Address', formData.ref1Address)}
                    {renderField('Pincode', formData.ref1Pincode)}
                  </div>
                  <div className="app-ref-block">
                    <strong className="app-ref-title">Reference 2</strong>
                    {renderField('Name', formData.ref2Name, true)}
                    {renderField('Mobile', formData.ref2Mobile, true)}
                    {renderField('Address', formData.ref2Address)}
                    {renderField('Pincode', formData.ref2Pincode)}
                  </div>
                </div>
              </div>

              {/* SPOC Details */}
              <div className="app-section">
                <div className="app-section-title">SPOC Details</div>
                <div className="app-grid">
                  {renderField('Name', formData.spocName)}
                  {renderField('Employee Code', formData.spocEmployeeCode)}
                  {renderField('Date', formData.spocDate)}
                </div>
              </div>

              {/* Documents Checklist */}
              <div className="app-section">
                <div className="app-section-title">
                  <FileText size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                  Uploaded Documents
                </div>
                <div className="app-doc-checklist">
                  {BASE_DOCS.map(doc => (
                    <div className="doc-check" key={doc.key}>
                      <span className={isDocUploaded(doc.key) ? 'check' : 'cross'}>
                        {isDocUploaded(doc.key) ? '✓' : '✗'}
                      </span>
                      <span>{doc.label}</span>
                      {doc.mandatory && <span className="mandatory-star">*</span>}
                    </div>
                  ))}
                  {ENTITY_ADDITIONAL_DOCS[formData.entityType] && ENTITY_ADDITIONAL_DOCS[formData.entityType].map(doc => (
                    <div className="doc-check" key={doc.key}>
                      <span className={isDocUploaded(doc.key) ? 'check' : 'cross'}>
                        {isDocUploaded(doc.key) ? '✓' : '✗'}
                      </span>
                      <span>{doc.label}</span>
                      {doc.mandatory && <span className="mandatory-star">*</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Signature Line */}
              <div className="app-form-footer">
                <div className="app-signature-line" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                  <div className="app-sig-box">
                    <div className="app-sig-label">Applicant Signature</div>
                  </div>
                  <div className="app-sig-box">
                    <div className="app-sig-label">SPOC Signature</div>
                  </div>
                </div>
              </div>
            </div>

          {/* ─── Section D: RCU Form ─── */}
          <div className="rcu-form-wrapper">
            <div className="rcu-form" ref={rcuFormRef}>
              {/* RCU Header */}
              <div className="rcu-header">
                <img src="/Logo.png" alt="Logo" style={{ height: 36, marginBottom: 8, filter: 'brightness(10)' }} />
                <h2>Risk Control Unit (RCU) Report</h2>
                <p>Confidential — For Internal Use Only</p>
              </div>

              {/* Business Details */}
              <div className="app-section">
                <div className="rcu-section-title">
                  <Building2 size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                  Business Details
                </div>
                <div className="app-grid">
                  {renderField('Company / Vendor Name', formData.companyName, true)}
                  {renderField('Entity Type', formData.entityType, true)}
                  {renderField('Registered Address', formData.registeredAddress, true, true)}
                  {renderField('State', formData.state)}
                  {renderField('City', formData.city)}
                  {renderField('Pincode', formData.pincode)}
                  {isNonIndividual && formData.gstNumber && renderField('GST Number', formData.gstNumber)}
                  {renderField('PAN', formData.individualPan || formData.companyPan)}
                </div>
              </div>

              {/* MSME Details */}
              {formData.udyamCertificateUpload && (
                <div className="app-section">
                  <div className="rcu-section-title">
                    <FileText size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                    MSME Details
                  </div>
                  <div className="app-grid">
                    {renderField('Company / Vendor Name', formData.companyName, true)}
                    {renderField('MSME / Udyam Number', formData.msmeNumber, true)}
                    {renderField('Date of Incorporation', formData.dateOfInc, true)}
                    {renderField('Date of Commencement', formData.dateOfCommencement, true)}
                    {renderField('Registered Address', formData.registeredAddress, true, true)}
                  </div>
                </div>
              )}

              {/* Key Person Verification */}
              <div className="app-section">
                <div className="rcu-section-title">
                  <UserCheck size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                  Key Person Verification
                </div>
                {formData.entityType === 'Individual' ? (
                  <div className="app-grid">
                    {renderField('Full Name', formData.fullName, true)}
                    {renderField("Father's Name", formData.fatherName)}
                    {renderField('Date of Birth', formData.dob)}
                    {renderField('PAN', formData.individualPan)}
                  </div>
                ) : (
                  (formData.partnerDetails || []).map((partner, i) => (
                    <div key={i} className="app-partner-block">
                      <div className="app-partner-label">
                        {formData.entityType === 'Private/Public Ltd Company' ? `Director ${i + 1}` : `Partner ${i + 1}`}
                      </div>
                      <div className="app-grid">
                        {renderField('Full Name', partner.fullName, true)}
                        {renderField('Designation', partner.designation)}
                        {renderField('PAN', partner.pan)}
                        {renderField('Date of Birth', partner.dob)}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Business References */}
              <div className="app-section">
                <div className="rcu-section-title">
                  <Users size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                  Business References
                </div>
                <div className="app-grid">
                  <div className="app-ref-block">
                    <strong className="app-ref-title">Reference 1</strong>
                    {renderField('Name', formData.ref1Name, true)}
                    {renderField('Mobile', formData.ref1Mobile, true)}
                    {renderField('Address', formData.ref1Address)}
                    {renderField('Pincode', formData.ref1Pincode)}
                  </div>
                  <div className="app-ref-block">
                    <strong className="app-ref-title">Reference 2</strong>
                    {renderField('Name', formData.ref2Name, true)}
                    {renderField('Mobile', formData.ref2Mobile, true)}
                    {renderField('Address', formData.ref2Address)}
                    {renderField('Pincode', formData.ref2Pincode)}
                  </div>
                </div>
              </div>

              {/* Document Verification */}
              <div className="app-section">
                <div className="rcu-section-title">
                  <FileText size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                  Document Verification Status
                </div>
                <div className="rcu-doc-table">
                  <div className="rcu-doc-row rcu-doc-header-row">
                    <span>Document</span>
                    <span>Status</span>
                    <span>Mandatory</span>
                  </div>
                  {BASE_DOCS.map(doc => (
                    <div className="rcu-doc-row" key={doc.key}>
                      <span>{doc.label}</span>
                      <span className={isDocUploaded(doc.key) ? 'rcu-status-ok' : 'rcu-status-missing'}>
                        {isDocUploaded(doc.key) ? 'Uploaded' : 'Missing'}
                      </span>
                      <span>{doc.mandatory ? 'Yes' : 'No'}</span>
                    </div>
                  ))}
                  {ENTITY_ADDITIONAL_DOCS[formData.entityType] && ENTITY_ADDITIONAL_DOCS[formData.entityType].map(doc => (
                    <div className="rcu-doc-row" key={doc.key}>
                      <span>{doc.label}</span>
                      <span className={isDocUploaded(doc.key) ? 'rcu-status-ok' : 'rcu-status-missing'}>
                        {isDocUploaded(doc.key) ? 'Uploaded' : 'Missing'}
                      </span>
                      <span>{doc.mandatory ? 'Yes' : 'No'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* RCU Remarks */}
              <div className="app-section">
                <div className="rcu-section-title">
                  <AlertCircle size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                  RCU Officer Remarks
                </div>
                <textarea
                  name="rcuRemarks"
                  value={formData.rcuRemarks || ''}
                  onChange={handleInputChange}
                  placeholder="Enter RCU verification remarks..."
                  rows={4}
                  className="rcu-remarks-textarea"
                />
              </div>

              {/* RCU Footer */}
              <div className="app-form-footer">
                <div className="app-signature-line">
                  <div className="app-sig-box">
                    <div className="app-sig-label">Channel Manager</div>
                  </div>
                  <div className="app-sig-box">
                    <div className="app-sig-label">RCU Officer</div>
                  </div>
                  <div className="app-sig-box">
                    <div className="app-sig-label">Compliance Head</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </>
      )}
        </>
      )}
    </div>
  );
};

export default Step5ESigning;
