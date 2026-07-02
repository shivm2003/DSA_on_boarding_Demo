import React, { useState } from 'react';
import { FIELD_DOC_TYPE_MAP } from '../constants';
import { initPartnerUpload, initPartnerOcrStatus, initPartnerOcrOutput } from '../helpers';

/**
 * Document upload, OCR parsing, auto-populate, and verification modal logic.
 */
export const useDocumentUpload = (formData, setFormData) => {
  const [activeExtraction, setActiveExtraction] = useState(null);
  const [docParseStatus, setDocParseStatus] = useState({});
  const [verificationModalData, setVerificationModalData] = useState(null);

  const [extractionStatus, setExtractionStatus] = useState({
    companyBank: false,
    partnerBanks: [],
    companyOcr: {
      panUpload: false,
      idProofUpload: false,
      addressProofUpload: false,
      gstCertificateUpload: false,
      msmeCertificateUpload: false,
      udyamCertificateUpload: false
    },
    partnerOcr: []
  });

  const [ocrOutputs, setOcrOutputs] = useState({
    company: {
      panUpload: '',
      idProofUpload: '',
      addressProofUpload: '',
      gstCertificateUpload: '',
      msmeCertificateUpload: '',
      udyamCertificateUpload: ''
    },
    partners: []
  });

  // ── Auto-populate form fields from OCR extraction ──
  const autoPopulateFields = (fieldName, docType, ext) => {
    setFormData(prev => {
      const updates = { ...prev };
      const newLocks = {};
      if (!ext) return updates;

      if (docType === 'PAN') {
        if (ext.pan_number) {
          const panField = prev.entityType === 'Individual' ? 'individualPan' : 'companyPan';
          updates[panField] = ext.pan_number;
        }
        if (ext.name) { updates.fullName = ext.name; newLocks.fullName = true; }
        if (ext.father_name) { updates.fatherName = ext.father_name; newLocks.fatherName = true; }
        if (ext.date_of_birth) { updates.dob = ext.date_of_birth; newLocks.dob = true; }
      }

      if (docType === 'AADHAAR') {
        if (ext.aadhaar_number) { updates.aadharNumber = ext.aadhaar_number; newLocks.aadharNumber = true; }
        if (ext.address) { updates.registeredAddress = ext.address; newLocks.registeredAddress = true; }
        if (ext.name && !updates.fullName) { updates.fullName = ext.name; newLocks.fullName = true; }
        if (ext.dob && !updates.dob) { updates.dob = ext.dob; newLocks.dob = true; }
        if (ext.pincode) { updates.pincode = ext.pincode; newLocks.pincode = true; }
        if (ext.state) { updates.state = ext.state; newLocks.state = true; }
      }

      if (docType === 'GST') {
        if (ext.gstin) { updates.gstNumber = ext.gstin; newLocks.gstNumber = true; }
        if (ext.legal_name) { updates.companyName = ext.legal_name; newLocks.companyName = true; }
      }

      if (docType === 'UDYAM') {
        if (ext.enterprise_name) { updates.companyName = ext.enterprise_name; newLocks.companyName = true; }
        if (ext.official_address) { updates.registeredAddress = ext.official_address; newLocks.registeredAddress = true; }
        if (ext.state) updates.state = ext.state;
        if (ext.district) { updates.city = ext.district; newLocks.city = true; }
        if (ext.pincode) updates.pincode = ext.pincode;
      }

      if (docType === 'CHEQUE' || docType === 'BANK_STATEMENT') {
        if (ext.bank_name) { updates.bankName = ext.bank_name; newLocks.bankName = true; }
        if (ext.account_number) { updates.accountNumber = ext.account_number; newLocks.accountNumber = true; }
        if (ext.ifsc_code) { updates.ifscCode = ext.ifsc_code; newLocks.ifscCode = true; }
      }

      if (docType === 'MSME') {
        updates.msmeRegistered = 'Yes';
        newLocks.msmeRegistered = true;
      }

      if (docType === 'VENDOR_INCOME') {
        if (ext.entity_name && !updates.companyName) { updates.companyName = ext.entity_name; newLocks.companyName = true; }
        if (ext.pan_number) {
          const panField = prev.entityType === 'Individual' ? 'individualPan' : 'companyPan';
          if (!updates[panField]) { updates[panField] = ext.pan_number; newLocks[panField] = true; }
        }
      }

      if (docType === 'DSA_APPLICATION') {
        if (ext.applicant_name && !updates.companyName) updates.companyName = ext.applicant_name;
        if (ext.pan_number) {
          const panField = prev.entityType === 'Individual' ? 'individualPan' : 'companyPan';
          if (!updates[panField]) { updates[panField] = ext.pan_number; newLocks[panField] = true; }
        }
        if (ext.phone && !updates.phone) updates.phone = ext.phone;
        if (ext.email && !updates.email) updates.email = ext.email;
      }

      if (docType === 'PROFILE_CV') {
        if (ext.name && !updates.fullName) { updates.fullName = ext.name; newLocks.fullName = true; }
        if (ext.phone && !updates.phone) updates.phone = ext.phone;
        if (ext.email && !updates.email) updates.email = ext.email;
      }

      if (docType === 'FIRM_REGISTRATION' || docType === 'SHOP_ESTABLISHMENT' || docType === 'PARTNERSHIP_DEED') {
        const firmName = ext.firm_name || ext.shop_name;
        if (firmName && !updates.companyName) updates.companyName = firmName;
        const addr = ext.registered_address || ext.shop_address;
        if (addr && !updates.registeredAddress) updates.registeredAddress = addr;
      }

      if (docType === 'INCORPORATION_CERTIFICATE' || docType === 'AOA' || docType === 'MOA') {
        if (ext.company_name && !updates.companyName) updates.companyName = ext.company_name;
        if (ext.cin && !updates.cin) updates.cin = ext.cin;
        if (ext.incorporation_date && !updates.dateOfInc) updates.dateOfInc = ext.incorporation_date;
      }

      return updates;
    });
  };

  // ── Company document upload with auto-parse ──
  const handleDocumentUpload = async (fieldName, file) => {
    if (!file) return;

    setFormData(prev => ({ ...prev, [fieldName]: file }));
    setExtractionStatus(prev => ({
      ...prev,
      companyOcr: { ...prev.companyOcr, [fieldName]: false }
    }));
    setOcrOutputs(prev => ({
      ...prev,
      company: { ...prev.company, [fieldName]: '' }
    }));

    const expectedDocType = FIELD_DOC_TYPE_MAP[fieldName] || 'ANY';

    if (expectedDocType === 'ANY') {
      setDocParseStatus(prev => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
      return;
    }

    setDocParseStatus(prev => ({ ...prev, [fieldName]: 'parsing' }));

    const formPayload = new FormData();
    formPayload.append('file', file);
    formPayload.append('documentType', expectedDocType);

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/parse', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formPayload,
      });
      const result = await response.json();

      if (!result.success) throw new Error(result.error || 'Parse failed');

      const detectedType = result.metadata?.document_type || 'UNKNOWN';
      const isMatch = expectedDocType === 'ANY' || detectedType === expectedDocType || detectedType === 'UNKNOWN';

      setExtractionStatus(prev => ({
        ...prev,
        companyOcr: { ...prev.companyOcr, [fieldName]: true }
      }));
      setOcrOutputs(prev => ({
        ...prev,
        company: { ...prev.company, [fieldName]: result.raw_text || '' }
      }));

      setDocParseStatus(prev => ({
        ...prev,
        [fieldName]: isMatch ? 'match' : 'mismatch'
      }));

      setVerificationModalData({
        fieldName,
        docType: detectedType,
        extractedData: result.extracted_data || {},
        editedData: result.extracted_data || {},
        rawText: result.raw_text || result.markdown || 'No raw text available'
      });

    } catch (err) {
      console.error('[AUTO-PARSE] Error:', err);
      setDocParseStatus(prev => ({ ...prev, [fieldName]: 'error' }));
    }
  };

  // ── Approve OCR results and map to form ──
  const handleApproveAndMap = () => {
    if (!verificationModalData) return;
    const { fieldName, docType, editedData } = verificationModalData;
    autoPopulateFields(fieldName, docType, editedData);
    setVerificationModalData(null);
  };

  // ── Partner document upload ──
  const handlePartnerDocumentUpload = (index, fieldName, file) => {
    setFormData(prev => {
      const partnerUploads = [...prev.partnerUploads];
      partnerUploads[index] = {
        ...partnerUploads[index],
        [fieldName]: file
      };
      return { ...prev, partnerUploads };
    });
    setExtractionStatus(prev => {
      const partnerOcr = [...prev.partnerOcr];
      partnerOcr[index] = {
        ...partnerOcr[index],
        [fieldName]: false
      };
      return { ...prev, partnerOcr };
    });
    setOcrOutputs(prev => {
      const partners = [...prev.partners];
      partners[index] = {
        ...partners[index],
        [fieldName]: ''
      };
      return { ...prev, partners };
    });
  };

  // ── Add a new partner slot ──
  const addPartner = () => {
    setFormData(prev => ({
      ...prev,
      partnerUploads: [...prev.partnerUploads, initPartnerUpload()],
      numberOfPartners: prev.numberOfPartners + 1
    }));
    setExtractionStatus(prev => ({
      ...prev,
      partnerOcr: [...prev.partnerOcr, initPartnerOcrStatus()]
    }));
    setOcrOutputs(prev => ({
      ...prev,
      partners: [...prev.partners, initPartnerOcrOutput()]
    }));
  };

  // ── UI Helpers ──
  const renderVerificationTag = (isUploaded, isVerified) => {
    if (!isUploaded) return null;
    return (
      <span className={`badge ${isVerified ? 'badge-success' : 'badge-warning'}`}>
        {isVerified ? 'Verified' : 'Not Verified'}
      </span>
    );
  };

  const shouldShowOcrOutput = (fieldName) => {
    return activeExtraction === `companyOcr-${fieldName}` || extractionStatus.companyOcr[fieldName];
  };

  const getCompanyOcrText = (fieldName) => {
    const defaultText = 'name - Shahsi';
    return ocrOutputs.company[fieldName] || defaultText;
  };

  const renderOcrOutputBox = (fieldName) => {
    if (!shouldShowOcrOutput(fieldName)) return null;
    return (
      <div className="ocr-output-box">
        <strong>OCR Output</strong>
        <pre>{getCompanyOcrText(fieldName)}</pre>
      </div>
    );
  };

  return {
    activeExtraction,
    setActiveExtraction,
    docParseStatus,
    setDocParseStatus,
    verificationModalData,
    setVerificationModalData,
    extractionStatus,
    setExtractionStatus,
    ocrOutputs,
    setOcrOutputs,
    autoPopulateFields,
    handleDocumentUpload,
    handleApproveAndMap,
    handlePartnerDocumentUpload,
    addPartner,
    renderVerificationTag,
    renderOcrOutputBox
  };
};
