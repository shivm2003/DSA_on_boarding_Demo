import { useState } from 'react';
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
    payoutOption: 'A',
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

    // KYC
    companyPan: '',
    individualPan: '',
    aadharNumber: '',
    kycDocumentType: '',
    kycDocumentNumber: '',
    gstNumber: '',
    msmeRegistered: 'No',
    msmeNumber: '',
    idType: 'Voter ID',
    keyClients: '',

    // References
    refName: '',
    refContact: '',
    refRelationship: '',
    refEmail: '',

    // Assessment / SPOC
    assessedByName: 'Shivam Mishra',
    assessedByDepartment: 'BSG',
    assessedByDesignation: 'Manager',
    meetingDate: new Date().toISOString().split('T')[0],
    spocName: '',
    spocDesignation: '',
    spocEmail: '',
    spocPhone: '',

    // Reference Locations
    ref1Inst: '',
    ref1Location: '',
    ref2Inst: '',
    ref2Location: ''
  });

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

    if (['phone', 'altContactNumber', 'personalMobile', 'spocPhone'].includes(name)) {
      newValue = normalizePhoneValue(value);
    }
    if (['dateOfInc', 'dob', 'meetingDate'].includes(name)) {
      newValue = normalizeDateValue(value);
    }

    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  // ── Multi-select (service states) ──
  const handleMultiSelectChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, serviceState: selectedOptions }));
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
