import { useState, useEffect } from 'react';
import { STEPS } from '../constants';
import { normalizePhoneValue, normalizeDateValue } from '../helpers';

/**
 * Core form state hook – owns the formData object,
 * navigation (currentStep), and generic input handlers.
 */
export const useFormState = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const [formData, setFormData] = useState({
    // Document Uploads
    panUpload: null,
    idProofUpload: null,
    addressProofUpload: null,
    gstCertificateUpload: null,
    udyamCertificateUpload: null,
    bankStatementUpload: null,
    cancelledChequeUpload: null,
    photoUpload: null,
    dsaTrainingPhotoUpload: null,
    enrollmentLetterUpload: null,
    firmRegistrationUpload: null,
    shopEstablishmentUpload: null,
    officeAddressProofUpload: null,
    partnershipDeedUpload: null,
    incorporationCertificateUpload: null,
    moaUpload: null,
    aoaUpload: null,
    parsedDocuments: {},

    partnerUploads: [],
    payoutOption: '0.50',
    payoutApprovalUpload: null,
    paymentMode: '',
    paymentPhoneNumber: '',
    paymentOtpSent: false,
    paymentOtp: '',
    lockedFields: {},

    // Banking
    bankName: '',
    accountNumber: '',
    ifscCode: '',

    // OCR Files
    idProofFile: null,
    addressProofFile: null,

    // Company / Vendor Details
    vendorCategory: 'DSA',
    companyName: '',
    entityType: 'Individual',
    numberOfPartners: 0,
    partnerDetails: [],
    partnerBankDetails: [],
    partnerOcrDetails: [],
    dateOfInc: '',
    dateOfCommencement: '',
    classOfActivity: '',
    cin: '',
    annualTurnover: '',
    yearsOfExperience: '',

    // Address
    registeredAddress: '',
    state: '',
    city: '',
    pincode: '',
    serviceLocations: '',
    serviceState: [],
    serviceCity: '',
    serviceBranch: '',

    // Contact & OTP
    email: '',
    phone: '',
    altContactNumber: '',
    altPhoneOtp: '',
    showAltPhoneOtp: false,
    altPhoneVerified: false,
    altPhoneOtpError: '',
    esignConsent: false,
    cmConsent: false,
    cmConsentOtp: '',
    showCmConsentOtp: false,
    cmConsentVerified: false,
    cmConsentOtpError: '',
    phoneOtp: '',
    emailOtp: '',
    showPhoneOtp: false,
    showEmailOtp: false,
    phoneVerified: false,
    emailVerified: false,
    phoneOtpError: '',
    emailOtpError: '',
    partnerCountError: '',

    // Personal
    fullName: '',
    fatherName: '',
    dob: '',
    designation: '',
    personalMobile: '',
    personalAddress: '',

    // KYC
    companyPan: '',
    individualPan: '',
    aadharNumber: '',
    kycDocumentType: '',
    kycDocumentNumber: '',
    additionalDocumentType: '',
    gstNumber: '',
    gstAddress: '',
    msmeRegistered: 'No',
    msmeNumber: '',
    idType: 'Voter ID',
    keyClients: '',

    // Reference Details (2 references for all entity types)
    ref1Name: '',
    ref1Mobile: '',
    ref1Address: '',
    ref1Pincode: '',
    ref2Name: '',
    ref2Mobile: '',
    ref2Address: '',
    ref2Pincode: '',

    // SPOC Details (auto-filled from logged-in user via useEffect below)
    spocName: '',
    spocEmployeeCode: '',
    spocDate: '',

    // Assessment
    assessedByName: 'Shivam Mishra',
    assessedByDepartment: 'BSG',
    assessedByDesignation: 'Manager',
    meetingDate: new Date().toISOString().split('T')[0],

    // E-Sign Consent & OTP
    esignConsent: false,
    esignOtpSent: false,
    esignOtp: '',
    esignOtpVerified: false,
    esignOtpError: '',

    // RCU
    rcuRemarks: ''
  });

  // ── Auto-fill SPOC from logged-in user ──
  useEffect(() => {
    try {
      const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();

      setFormData(prev => ({
        ...prev,
        spocName: prev.spocName || userData.display_name || '',
        spocEmployeeCode: prev.spocEmployeeCode || userData.username || '',
        spocDate: prev.spocDate || `${dd}-${mm}-${yyyy}`
      }));
    } catch {
      // sessionStorage not available or invalid JSON
    }
  }, []);

  // ── Navigation ──
  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // ── Generic input handler ──
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (['phone', 'altContactNumber', 'personalMobile', 'ref1Mobile', 'ref2Mobile'].includes(name)) {
      newValue = normalizePhoneValue(value);
    }
    if (['dateOfInc', 'dob', 'meetingDate', 'dateOfCommencement'].includes(name)) {
      newValue = normalizeDateValue(value);
    }

    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  // ── Multi-select (service states) ──
  const handleMultiSelectChange = (e) => {
    const { name } = e.target;
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, [name]: selectedOptions }));
  };

  const removeSelectedState = (stateToRemove) => {
    setFormData(prev => ({
      ...prev,
      serviceState: prev.serviceState.filter(s => s !== stateToRemove)
    }));
  };

  return {
    currentStep,
    setCurrentStep,
    formData,
    setFormData,
    nextStep,
    prevStep,
    handleInputChange,
    handleMultiSelectChange,
    removeSelectedState
  };
};
