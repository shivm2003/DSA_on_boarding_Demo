import { useState } from 'react';
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
      udyamCertificateUpload: false
    },
    partnerOcr: []
  });

  const getExtractedValue = (data, ...keys) => {
    for (const key of keys) {
      if (data?.[key] !== undefined && data[key] !== null && data[key] !== '') {
        return data[key];
      }
    }
    return '';
  };

  const normalizeExtractedDate = (value) => {
    if (!value) return '';
    const text = String(value).trim();
    const match = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
    if (!match) return text;

    const [, day, month, yearPart] = match;
    const year = yearPart.length === 2 ? `19${yearPart}` : yearPart;
    return `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const mergeExtractedData = (items) => items.reduce((merged, item) => {
    Object.entries(item || {}).forEach(([key, value]) => {
      if (merged[key] === undefined || merged[key] === '') {
        merged[key] = value;
      }
    });
    return merged;
  }, {});

  const [ocrOutputs, setOcrOutputs] = useState({
    company: {
      panUpload: '',
      idProofUpload: '',
      addressProofUpload: '',
      gstCertificateUpload: '',
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
        const panNumber = getExtractedValue(ext, 'panNumber', 'pan_number');
        const name = getExtractedValue(ext, 'name', 'fullName');
        const fatherName = getExtractedValue(ext, 'fatherName', 'father_name');
        const dateOfBirth = normalizeExtractedDate(getExtractedValue(ext, 'dateOfBirth', 'date_of_birth', 'dob'));

        if (panNumber) {
          const panField = prev.entityType === 'Individual' ? 'individualPan' : 'companyPan';
          updates[panField] = panNumber;
          newLocks[panField] = true;
        }
        if (name) {
          updates.fullName = name;
          newLocks.fullName = true;
          if (prev.entityType === 'Individual') {
            updates.companyName = name;
            newLocks.companyName = true;
          }
        }
        if (fatherName) { updates.fatherName = fatherName; newLocks.fatherName = true; }
        if (dateOfBirth) { updates.dob = dateOfBirth; newLocks.dob = true; }
      }

      if (docType === 'AADHAAR') {
        const dob = normalizeExtractedDate(getExtractedValue(ext, 'dob', 'dateOfBirth', 'date_of_birth'));
        const aadhaarNumber = getExtractedValue(ext, 'aadhaarNumber', 'aadhaar_number');
        const maskedAadhaarNumber = getExtractedValue(ext, 'aadhaarMasked', 'aadhaar_masked');
        if (ext.address) { updates.registeredAddress = ext.address; newLocks.registeredAddress = true; }
        if (ext.pincode) { updates.pincode = ext.pincode; newLocks.pincode = true; }
        if (ext.state) { updates.state = ext.state; newLocks.state = true; }

        if (fieldName === 'addressProofUpload' && maskedAadhaarNumber) {
          updates.aadharNumber = maskedAadhaarNumber;
          newLocks.aadharNumber = true;
        }

        if (fieldName !== 'addressProofUpload') {
          if (aadhaarNumber) { updates.aadharNumber = aadhaarNumber; newLocks.aadharNumber = true; }
          if (aadhaarNumber) { updates.kycDocumentNumber = aadhaarNumber; newLocks.kycDocumentNumber = true; }
          if (ext.name && !updates.fullName) { updates.fullName = ext.name; newLocks.fullName = true; }
          if (dob && !updates.dob) { updates.dob = dob; newLocks.dob = true; }
        }
      }

      if (['VOTER_ID', 'PASSPORT', 'DL', 'ELECTRICITY_BILL', 'RENT_AGREEMENT'].includes(docType)) {
        const address = getExtractedValue(ext, 'address', 'registeredAddress', 'serviceAddress', 'tenantAddress', 'propertyAddress');
        if (address) { updates.registeredAddress = address; newLocks.registeredAddress = true; }
        if (ext.pincode) { updates.pincode = ext.pincode; newLocks.pincode = true; }
        if (ext.state) { updates.state = ext.state; newLocks.state = true; }
        if (ext.city) { updates.city = ext.city; newLocks.city = true; }
      }

      // fallback mapping for any document with address parser output
      if (ext.pincode && !updates.pincode) {
        updates.pincode = ext.pincode;
        newLocks.pincode = true;
      }
      if (ext.address && !updates.registeredAddress) {
        updates.registeredAddress = ext.address;
        newLocks.registeredAddress = true;
      }
      if (ext.state && !updates.state) {
        updates.state = ext.state;
        newLocks.state = true;
      }
      if (ext.city && !updates.city) {
        updates.city = ext.city;
        newLocks.city = true;
      }

      if (docType === 'GST') {
        const legalName = getExtractedValue(ext, 'legalName', 'legal_name');
        if (ext.gstin) { updates.gstNumber = ext.gstin; newLocks.gstNumber = true; }
        if (legalName) { updates.companyName = legalName; newLocks.companyName = true; }
      }

      if (docType === 'UDYAM') {
        const enterpriseName = getExtractedValue(ext, 'enterpriseName', 'enterprise_name');
        const officialAddress = getExtractedValue(ext, 'officialAddress', 'official_address');
        if (enterpriseName) { updates.companyName = enterpriseName; newLocks.companyName = true; }
        if (officialAddress) { updates.registeredAddress = officialAddress; newLocks.registeredAddress = true; }
        if (ext.state) updates.state = ext.state;
        if (ext.district) { updates.city = ext.district; newLocks.city = true; }
        if (ext.pincode) updates.pincode = ext.pincode;
      }

      if (docType === 'CHEQUE' || docType === 'BANK_STATEMENT') {
        const bankName = getExtractedValue(ext, 'bankName', 'bank_name');
        const accountNumber = getExtractedValue(ext, 'accountNumber', 'account_number');
        const ifscCode = getExtractedValue(ext, 'ifscCode', 'ifsc_code');
        if (bankName) { updates.bankName = bankName; newLocks.bankName = true; }
        if (accountNumber) { updates.accountNumber = accountNumber; newLocks.accountNumber = true; }
        if (ifscCode) { updates.ifscCode = ifscCode; newLocks.ifscCode = true; }
      }


      if (docType === 'VENDOR_INCOME') {
        const entityName = getExtractedValue(ext, 'entityName', 'entity_name');
        const panNumber = getExtractedValue(ext, 'panNumber', 'pan_number');
        if (entityName && !updates.companyName) { updates.companyName = entityName; newLocks.companyName = true; }
        if (panNumber) {
          const panField = prev.entityType === 'Individual' ? 'individualPan' : 'companyPan';
          if (!updates[panField]) { updates[panField] = panNumber; newLocks[panField] = true; }
        }
      }

      if (docType === 'DSA_APPLICATION') {
        const applicantName = getExtractedValue(ext, 'applicantName', 'applicant_name');
        const panNumber = getExtractedValue(ext, 'panNumber', 'pan_number');
        if (applicantName && !updates.companyName) updates.companyName = applicantName;
        if (panNumber) {
          const panField = prev.entityType === 'Individual' ? 'individualPan' : 'companyPan';
          if (!updates[panField]) { updates[panField] = panNumber; newLocks[panField] = true; }
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
        const firmName = getExtractedValue(ext, 'firmName', 'firm_name', 'shopName', 'shop_name');
        if (firmName && !updates.companyName) updates.companyName = firmName;
        const addr = getExtractedValue(ext, 'registeredAddress', 'registered_address', 'shopAddress', 'shop_address');
        if (addr && !updates.registeredAddress) updates.registeredAddress = addr;
      }

      if (docType === 'INCORPORATION_CERTIFICATE' || docType === 'AOA' || docType === 'MOA') {
        const companyName = getExtractedValue(ext, 'companyName', 'company_name');
        const incorporationDate = normalizeExtractedDate(getExtractedValue(ext, 'incorporationDate', 'incorporation_date'));
        if (companyName && !updates.companyName) updates.companyName = companyName;
        if (ext.cin && !updates.cin) updates.cin = ext.cin;
        if (incorporationDate && !updates.dateOfInc) updates.dateOfInc = incorporationDate;
      }

      return {
        ...updates,
        lockedFields: {
          ...(prev.lockedFields || {}),
          ...newLocks
        }
      };
    });
  };

  // ── Company document upload with auto-parse ──
  const handleDocumentUpload = async (fieldName, fileInput, overrideDocType = null) => {
    const files = Array.isArray(fileInput) ? fileInput : fileInput ? [fileInput] : [];
    if (files.length === 0) return;

    const uploadValue = files.length === 1 ? files[0] : files;

    setFormData(prev => ({ ...prev, [fieldName]: uploadValue }));
    setExtractionStatus(prev => ({
      ...prev,
      companyOcr: { ...prev.companyOcr, [fieldName]: false }
    }));
    setOcrOutputs(prev => ({
      ...prev,
      company: { ...prev.company, [fieldName]: '' }
    }));

    const expectedDocType = overrideDocType || FIELD_DOC_TYPE_MAP[fieldName] || 'ANY';

    if (expectedDocType === 'ANY') {
      setDocParseStatus(prev => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
      return;
    }

    setDocParseStatus(prev => ({ ...prev, [fieldName]: 'parsing' }));

    try {
      const token = sessionStorage.getItem('token');
      const parseResults = [];

      for (const file of files) {
        const formPayload = new FormData();
        formPayload.append('file', file);
        formPayload.append('documentType', expectedDocType);

        const response = await fetch('http://localhost:5000/api/parse', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formPayload,
        });
        const result = await response.json();

        if (!result.success) throw new Error(result.error || 'Parse failed');
        parseResults.push(result);
      }

      const detectedType = parseResults[0]?.metadata?.document_type || expectedDocType || 'UNKNOWN';
      const isMatch = expectedDocType === 'ANY' || detectedType === expectedDocType || detectedType === 'UNKNOWN';
      const mergedExtractedData = mergeExtractedData(parseResults.map(result => result.extracted_data || {}));
      const rawText = parseResults.map(result => result.raw_text || result.markdown || '').filter(Boolean).join('\n\n--- Next file ---\n\n');

      setExtractionStatus(prev => ({
        ...prev,
        companyOcr: { ...prev.companyOcr, [fieldName]: true }
      }));
      setOcrOutputs(prev => ({
        ...prev,
        company: { ...prev.company, [fieldName]: rawText }
      }));
      setFormData(prev => ({
        ...prev,
        parsedDocuments: {
          ...(prev.parsedDocuments || {}),
          [fieldName]: {
            documentId: parseResults.map(result => result.document_id).filter(Boolean).join(','),
            documentType: detectedType,
            expectedDocType,
            extractedData: mergedExtractedData,
            rawText,
            markdown: parseResults.map(result => result.markdown || '').filter(Boolean).join('\n\n--- Next file ---\n\n'),
            metadata: parseResults.map(result => result.metadata || {}),
            files: files.map(file => ({
              name: file.name,
              size: file.size,
              type: file.type,
              lastModified: file.lastModified
            }))
          }
        }
      }));

      setDocParseStatus(prev => ({
        ...prev,
        [fieldName]: isMatch ? 'match' : 'mismatch'
      }));

      setVerificationModalData({
        fieldName,
        docType: detectedType,
        extractedData: mergedExtractedData,
        editedData: mergedExtractedData,
        rawText: rawText || 'No raw text available'
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
