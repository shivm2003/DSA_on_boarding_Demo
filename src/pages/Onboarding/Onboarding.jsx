import React, { useState, useEffect, useRef } from 'react';
import { Loader2, CheckCircle, FileText, Smartphone } from 'lucide-react';
import QRCode from 'qrcode';
import './Onboarding.css';

const STEPS = [
  'Upload Document',
  'Entity Details',
  'Banking Verification',
  'Additional Documents',
  'Verification',
  'Payout Selection',
  'E-Signing'
];

const VENDOR_CATEGORIES = [
  'DSA', 'Connector', 'Technical', 'Legal', 'RCU', 'PD', 'Legal Recovery', 
  'Collection Vendor', 'Branch Admin Vendors', 'HO Vendors', 'Other'
];

// Removed ID Proof and Address Proof from matrices since they are collected in Step 1 (OCR)
const DOCUMENT_MATRIX = {
  'DSA': ['Vendor Empanelment Form', 'PAN/Form 60', 'Vendor Income', 'Cancelled Cheque', 'Agreement', 'Stamp Paper', 'Profile (CV, Photo)', 'GST & MSME Certificate', 'Declaration from Employee', 'DSA empanelment form', 'Enrollment letter from other FI'],
  'Connector': ['Vendor Empanelment Form', 'PAN/Form 60', 'Vendor Income', 'Cancelled Cheque', 'Agreement', 'Stamp Paper', 'Profile (CV, Photo)', 'GST & MSME Certificate', 'Declaration from vendor on relationship', 'Declaration from Employee', 'DSA empanelment form', 'Enrollment letter from other FI'],
  'Legal': ['Vendor Empanelment Form', 'PAN/Form 60', 'Vendor Income', 'Cancelled Cheque', 'Agreement', 'Stamp Paper', 'Profile (CV, Photo)', 'GST & MSME Certificate', 'Professional Docs', 'Educational Certificates', 'References', 'Legal Degree & Bar Council License'],
  'Technical': ['Vendor Empanelment Form', 'PAN/Form 60', 'Vendor Income', 'Cancelled Cheque', 'Agreement', 'Stamp Paper', 'Profile (CV, Photo)', 'GST & MSME Certificate', 'Professional Docs', 'Educational Certificates', 'References'],
  'RCU': ['Vendor Empanelment Form', 'PAN/Form 60', 'Vendor Income', 'Cancelled Cheque', 'Agreement', 'Stamp Paper', 'GST & MSME Certificate'],
  'Other': ['Vendor Empanelment Form', 'PAN/Form 60', 'Cancelled Cheque']
};

const INDIAN_STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
  'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Dadar and Nagar Haveli', 'Daman and Diu',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir',
  'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
  'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

// QR Code Component
const QRCodeDisplay = ({ email }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      const qrValue = `https://payment.isfc.com/qr/${email || 'user'}`;
      QRCode.toCanvas(canvasRef.current, qrValue, {
        width: 256,
        margin: 1,
        color: {
          dark: '#000',
          light: '#fff'
        }
      });
    }
  }, [email]);

  return (
    <div className="qr-code-container glass-panel p-4 mt-6 text-center">
      <h3 className="mb-4">Scan QR Code to Pay</h3>
      <div className="qr-code-wrapper">
        <canvas ref={canvasRef}></canvas>
      </div>
      <p className="text-sm mt-4 text-muted">Please scan this QR code with your preferred payment app</p>
    </div>
  );
};


const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [activeExtraction, setActiveExtraction] = useState(null);
  const [verificationRunning, setVerificationRunning] = useState(false);
  const [verificationCompleted, setVerificationCompleted] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState({
    pan: false,
    dl: false,
    voter: false,
    udyam: false,
    gst: false
  });
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
  
  const [formData, setFormData] = useState({
    // Step 0: Document Uploads
    panUpload: null,
    idProofUpload: null,
    addressProofUpload: null,
    gstCertificateUpload: null,
    msmeCertificateUpload: null,
    udyamCertificateUpload: null,
    partnerUploads: [],
    payoutOption: 'A',
    paymentMode: '',
    paymentPhoneNumber: '',
    paymentOtpSent: false,
    paymentOtp: '',
    
    // Step 1: Banking
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    
    // Step 2: OCR
    idProofFile: null,
    addressProofFile: null,
    
    // Step 3 & 4: Forms (Pre-populated + Manual)
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
    
    registeredAddress: '',
    state: '',
    city: '',
    pincode: '',
    serviceLocations: '',
    serviceState: [],
    serviceCity: '',
    serviceBranch: '',
    email: '',
    phone: '',
    altContactNumber: '',
    phoneOtp: '',
    emailOtp: '',
    showPhoneOtp: false,
    showEmailOtp: false,
    phoneVerified: false,
    emailVerified: false,
    phoneOtpError: '',
    emailOtpError: '',
    partnerCountError: '',
    
    fullName: '',
    fatherName: '',
    dob: '',
    designation: '',
    personalMobile: '',
    
    companyPan: '',
    individualPan: '',
    aadharNumber: '',
    gstNumber: '',
    msmeRegistered: 'No',
    idType: 'Voter ID',
    keyClients: '',
    
    refName: '',
    refContact: '',
    refRelationship: '',
    refEmail: '',
    
    assessedByName: '',
    assessedByDepartment: '',
    assessedByDesignation: '',
    meetingDate: '',
    
    spocName: '',
    spocDesignation: '',
    spocEmail: '',
    spocPhone: '',
    
    ref1Inst: '',
    ref1Location: '',
    ref2Inst: '',
    ref2Location: ''
  });

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

  const initPartnerDetail = () => ({
    fullName: '',
    dob: '',
    pan: '',
    designation: '',
    role: '',
    sharePercentage: ''
  });

  const initPartnerBank = () => ({
    bankName: '',
    accountNumber: '',
    ifscCode: ''
  });

  const initPartnerOcr = () => ({
    idProofFile: null,
    addressProofFile: null,
    fullName: '',
    dob: '',
    pan: '',
    aadharNumber: ''
  });

  const initPartnerUpload = () => ({
    panUpload: null,
    idProofUpload: null,
    addressProofUpload: null,
    gstCertificateUpload: null,
    msmeCertificateUpload: null,
    udyamCertificateUpload: null
  });

  const initPartnerOcrStatus = () => ({
    panUpload: false,
    idProofUpload: false,
    addressProofUpload: false,
    gstCertificateUpload: false,
    msmeCertificateUpload: false,
    udyamCertificateUpload: false
  });

  const initPartnerOcrOutput = () => ({
    panUpload: '',
    idProofUpload: '',
    addressProofUpload: '',
    gstCertificateUpload: '',
    msmeCertificateUpload: '',
    udyamCertificateUpload: ''
  });

  const adjustPartnerArrays = (count, prev) => {
    const partnerDetails = Array.from({ length: count }, (_, idx) => prev.partnerDetails[idx] || initPartnerDetail());
    const partnerBankDetails = Array.from({ length: count }, (_, idx) => prev.partnerBankDetails[idx] || initPartnerBank());
    const partnerOcrDetails = Array.from({ length: count }, (_, idx) => prev.partnerOcrDetails[idx] || initPartnerOcr());
    return { partnerDetails, partnerBankDetails, partnerOcrDetails };
  };

  const adjustPartnerStatusArray = (count, statusArray = [], initFn) =>
    Array.from({ length: count }, (_, idx) => statusArray[idx] || initFn());

  const adjustStatusArray = (count, statusArray = []) =>
    Array.from({ length: count }, (_, idx) => statusArray[idx] || false);

  const normalizePhoneValue = (value) => value.replace(/\D/g, '').slice(0, 10);
  const normalizeDateValue = (value) => value.replace(/[^0-9-]/g, '');

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

  const handleMultiSelectChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, serviceState: selectedOptions }));
  };

  const removeSelectedState = (stateToRemove) => {
    setFormData(prev => ({
      ...prev,
      serviceState: prev.serviceState.filter(state => state !== stateToRemove)
    }));
  };

  const handleDocumentUpload = (fieldName, file) => {
    setFormData(prev => ({ ...prev, [fieldName]: file }));
    setExtractionStatus(prev => ({
      ...prev,
      companyOcr: {
        ...prev.companyOcr,
        [fieldName]: false
      }
    }));
    setOcrOutputs(prev => ({
      ...prev,
      company: {
        ...prev.company,
        [fieldName]: ''
      }
    }));
  };

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

  const handleSendPhoneOtp = () => {
    setFormData(prev => ({
      ...prev,
      showPhoneOtp: true,
      phoneOtpError: '',
      phoneVerified: false
    }));
  };

  const handleVerifyPhoneOtp = () => {
    setFormData(prev => {
      const isValid = prev.phoneOtp === '12345';
      return {
        ...prev,
        phoneVerified: isValid,
        phoneOtpError: isValid ? '' : 'Invalid OTP. Please use 12345.',
        showPhoneOtp: !isValid
      };
    });
  };

  const handleSendEmailOtp = () => {
    setFormData(prev => ({
      ...prev,
      showEmailOtp: true,
      emailOtpError: '',
      emailVerified: false
    }));
  };

  const handleVerifyEmailOtp = () => {
    setFormData(prev => {
      const isValid = prev.emailOtp === '12345';
      return {
        ...prev,
        emailVerified: isValid,
        emailOtpError: isValid ? '' : 'Invalid OTP. Please use 12345.',
        showEmailOtp: !isValid
      };
    });
  };

  const handleEntityTypeChange = (e) => {
    const value = e.target.value;
    const isPartnership = value === 'Partnership';
    setExtractionStatus(prev => ({
      ...prev,
      partnerBanks: isPartnership ? adjustStatusArray(Math.max(1, formData.numberOfPartners || 1), prev.partnerBanks) : [],
      partnerOcr: isPartnership ? adjustPartnerStatusArray(Math.max(1, formData.numberOfPartners || 1), prev.partnerOcr, initPartnerOcrStatus) : []
    }));
    setOcrOutputs(prev => ({
      ...prev,
      partners: isPartnership ? adjustPartnerStatusArray(Math.max(1, formData.numberOfPartners || 1), prev.partners, initPartnerOcrOutput) : []
    }));
    setFormData(prev => {
      const update = { ...prev, entityType: value };
      if (!isPartnership) {
        update.numberOfPartners = 0;
        update.partnerDetails = [];
        update.partnerBankDetails = [];
        update.partnerOcrDetails = [];
        update.partnerUploads = [];
      } else {
        const count = prev.numberOfPartners || Math.max(1, prev.partnerUploads.length || 1);
        const { partnerDetails, partnerBankDetails, partnerOcrDetails } = adjustPartnerArrays(count, prev);
        update.numberOfPartners = count;
        update.partnerDetails = partnerDetails;
        update.partnerBankDetails = partnerBankDetails;
        update.partnerOcrDetails = partnerOcrDetails;
        update.partnerUploads = prev.partnerUploads.length ? prev.partnerUploads : [initPartnerUpload()];
      }
      return update;
    });
  };

  const handleNumberOfPartnersChange = (e) => {
    const value = Number(e.target.value);
    const count = Number.isNaN(value) ? 0 : Math.min(10, Math.max(0, value));
    const error = count === 0 ? 'Number of partners/directors cannot be 0.' : '';

    setExtractionStatus(prev => ({
      ...prev,
      partnerBanks: adjustStatusArray(count, prev.partnerBanks),
      partnerOcr: adjustPartnerStatusArray(count, prev.partnerOcr, initPartnerOcrStatus)
    }));
    setOcrOutputs(prev => ({
      ...prev,
      partners: adjustPartnerStatusArray(count, prev.partners, initPartnerOcrOutput)
    }));

    setFormData(prev => {
      const updated = { ...prev, numberOfPartners: count, partnerCountError: error };
      if (count > 0) {
        const { partnerDetails, partnerBankDetails, partnerOcrDetails } = adjustPartnerArrays(count, prev);
        updated.partnerDetails = partnerDetails;
        updated.partnerBankDetails = partnerBankDetails;
        updated.partnerOcrDetails = partnerOcrDetails;
      } else {
        updated.partnerDetails = [];
        updated.partnerBankDetails = [];
        updated.partnerOcrDetails = [];
      }
      return updated;
    });
  };

  const handlePartnerDetailChange = (index, name, value) => {
    if (name === 'dob') {
      value = value.replace(/[^0-9-]/g, '');
    }
    setFormData(prev => {
      const partnerDetails = [...prev.partnerDetails];
      partnerDetails[index] = { ...partnerDetails[index], [name]: value };
      return { ...prev, partnerDetails };
    });
  };

  const handlePartnerBankChange = (index, name, value) => {
    setFormData(prev => {
      const partnerBankDetails = [...prev.partnerBankDetails];
      partnerBankDetails[index] = { ...partnerBankDetails[index], [name]: value };
      return { ...prev, partnerBankDetails };
    });
  };

  const handlePartnerOcrChange = (index, name, value) => {
    setFormData(prev => {
      const partnerOcrDetails = [...prev.partnerOcrDetails];
      partnerOcrDetails[index] = { ...partnerOcrDetails[index], [name]: value };
      return { ...prev, partnerOcrDetails };
    });
  };

  const handleCompanyOcrFileChange = (name, file) => {
    setFormData(prev => ({ ...prev, [name]: file }));
  };

  const simulateCompanyBankingExtraction = () => {
    setActiveExtraction('companyBank');
    setTimeout(() => {
      setFormData(prev => {
        return {
          ...prev,
          bankName: prev.bankName || 'ICICI Bank',
          accountNumber: prev.accountNumber || '100001507308',
          ifscCode: prev.ifscCode || 'ICIC0001001',
          companyName: prev.companyName || 'India Shelter Example Pvt Ltd'
        };
      });
      setExtractionStatus(prev => ({ ...prev, companyBank: true }));
      setActiveExtraction(null);
    }, 1500);
  };

  const simulatePartnerBankingExtraction = (index) => {
    setActiveExtraction(`partnerBank-${index}`);
    setTimeout(() => {
      setFormData(prev => {
        const partnerBankDetails = [...prev.partnerBankDetails];
        const existingBank = partnerBankDetails[index] || initPartnerBank();
        partnerBankDetails[index] = {
          ...existingBank,
          bankName: existingBank.bankName || `Partner Bank ${index + 1}`,
          accountNumber: existingBank.accountNumber || `4000${index + 1}000${index + 1}08`,
          ifscCode: existingBank.ifscCode || `ICIC0000${index + 1}`
        };

        return {
          ...prev,
          partnerBankDetails
        };
      });
      setExtractionStatus(prev => {
        const partnerBanks = [...prev.partnerBanks];
        partnerBanks[index] = true;
        return { ...prev, partnerBanks };
      });
      setActiveExtraction(null);
    }, 1500);
  };

  const simulateCompanyOCRExtraction = () => {
    setActiveExtraction('companyOcr');
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        registeredAddress: prev.registeredAddress || 'House No 52, Bhawanipur, Shiv Mandir',
        state: prev.state || 'Uttar Pradesh',
        city: prev.city || 'Varanasi',
        pincode: prev.pincode || '221301',
        fullName: prev.fullName || 'Ashish Phoolchand Pandey',
        dob: prev.dob || '1984-03-31',
        individualPan: prev.individualPan || 'AMJPP1483B'
      }));
      setExtractionStatus(prev => ({ ...prev, companyOcr: true }));
      setActiveExtraction(null);
    }, 2000);
  };

  const viewUploadedFile = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    window.open(url, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  const simulateCompanyDocumentOCRExtraction = (fieldName) => {
    setActiveExtraction(`companyOcr-${fieldName}`);
    setTimeout(() => {
      setExtractionStatus(prev => ({
        ...prev,
        companyOcr: {
          ...prev.companyOcr,
          [fieldName]: true
        }
      }));
      setOcrOutputs(prev => ({
        ...prev,
        company: {
          ...prev.company,
          [fieldName]: fieldName === 'panUpload'
            ? 'name - Shahsi\nPAN: AMJPP1483B'
            : fieldName === 'idProofUpload'
            ? 'name - Shahsi\nID number extracted'
            : fieldName === 'addressProofUpload'
            ? 'name - Shahsi\nAddress: House No 52, Bhawanipur, Shiv Mandir'
            : fieldName === 'gstCertificateUpload'
            ? 'name - Shahsi\nGST Number: 27AABCU9603R1ZV'
            : fieldName === 'msmeCertificateUpload'
            ? 'name - Shahsi\nMSME Registered: Yes'
            : fieldName === 'udyamCertificateUpload'
            ? 'name - Shahsi\nUdyam Registration: Active'
            : 'name - Shahsi'
        }
      }));
      setFormData(prev => {
        if (fieldName === 'panUpload') {
          const panField = prev.entityType === 'Individual' ? 'individualPan' : 'companyPan';
          return { ...prev, [panField]: prev[panField] || 'AMJPP1483B' };
        }
        if (fieldName === 'addressProofUpload') {
          return {
            ...prev,
            registeredAddress: prev.registeredAddress || 'House No 52, Bhawanipur, Shiv Mandir',
            state: prev.state || 'Uttar Pradesh',
            city: prev.city || 'Varanasi',
            pincode: prev.pincode || '221301'
          };
        }
        if (fieldName === 'gstCertificateUpload') {
          return { ...prev, gstNumber: prev.gstNumber || '27AABCU9603R1ZV' };
        }
        if (fieldName === 'msmeCertificateUpload') {
          return { ...prev, msmeRegistered: 'Yes' };
        }
        return prev;
      });
      setActiveExtraction(null);
    }, 1500);
  };

  const simulatePartnerDocumentOCRExtraction = (index, fieldName) => {
    setActiveExtraction(`partnerOcr-${index}-${fieldName}`);
    setTimeout(() => {
      setExtractionStatus(prev => {
        const partnerOcr = [...prev.partnerOcr];
        partnerOcr[index] = {
          ...partnerOcr[index],
          [fieldName]: true
        };
        return { ...prev, partnerOcr };
      });
      setActiveExtraction(null);
    }, 1500);
  };

  const simulatePartnerOCRExtraction = (index) => {
    setActiveExtraction(`partnerOcr-${index}`);
    setTimeout(() => {
      setFormData(prev => {
        const partnerOcrDetails = [...prev.partnerOcrDetails];
        const partnerDetails = [...prev.partnerDetails];
        const existingPartnerOcr = partnerOcrDetails[index] || initPartnerOcr();
        const existingPartnerDetails = partnerDetails[index] || initPartnerDetail();
        const extractedName = existingPartnerOcr.fullName || `Partner ${index + 1} Name`;
        const extractedDob = existingPartnerOcr.dob || '1990-01-01';
        const extractedPan = existingPartnerOcr.pan || `PNRPK000${index + 1}A`;
        const extractedAadhar = existingPartnerOcr.aadharNumber || `1234 5678 90${index + 1}`;

        partnerOcrDetails[index] = {
          ...existingPartnerOcr,
          fullName: extractedName,
          dob: extractedDob,
          pan: extractedPan,
          aadharNumber: extractedAadhar
        };

        partnerDetails[index] = {
          ...existingPartnerDetails,
          fullName: existingPartnerDetails.fullName || extractedName,
          dob: existingPartnerDetails.dob || extractedDob,
          pan: existingPartnerDetails.pan || extractedPan
        };

        return {
          ...prev,
          partnerOcrDetails,
          partnerDetails
        };
      });
      setExtractionStatus(prev => {
        const partnerOcr = [...prev.partnerOcr];
        partnerOcr[index] = true;
        return { ...prev, partnerOcr };
      });
      setActiveExtraction(null);
    }, 2000);
  };

  const isExtracting = (target) => activeExtraction === target;
  const verifiedPartnerBanks = extractionStatus.partnerBanks.filter(Boolean).length;
  const verifiedPartnerOcr = extractionStatus.partnerOcr.filter(Boolean).length;
  const isVerificationLocked = verificationCompleted && currentStep <= 4;

  const handlePayoutSelection = (option) => {
    setFormData(prev => ({ ...prev, payoutOption: option }));
  };

  const handlePaymentModeSelection = (mode) => {
    setFormData(prev => ({ 
      ...prev, 
      paymentMode: mode,
      paymentPhoneNumber: '',
      paymentOtpSent: false,
      paymentOtp: ''
    }));
  };

  const handleSendOtp = () => {
    if (!formData.paymentPhoneNumber || formData.paymentPhoneNumber.length < 10) {
      alert('Please enter a valid phone number');
      return;
    }
    // Simulate sending OTP
    setFormData(prev => ({ ...prev, paymentOtpSent: true }));
    alert(`OTP sent to ${formData.paymentPhoneNumber}`);
  };

  const simulateVerificationRun = () => {
    setVerificationRunning(true);
    setTimeout(() => {
      setVerificationStatus({
        pan: true,
        dl: true,
        voter: true,
        udyam: true,
        gst: true
      });
      setVerificationRunning(false);
      setVerificationCompleted(true);
    }, 2000);
  };

  const serializeFileField = (value) => {
    if (!value) return '';
    return value.name || value.filename || String(value);
  };

  const serializePartnerUpload = (partner) => ({
    panUpload: serializeFileField(partner.panUpload),
    idProofUpload: serializeFileField(partner.idProofUpload),
    addressProofUpload: serializeFileField(partner.addressProofUpload),
    gstCertificateUpload: serializeFileField(partner.gstCertificateUpload),
    msmeCertificateUpload: serializeFileField(partner.msmeCertificateUpload),
    udyamCertificateUpload: serializeFileField(partner.udyamCertificateUpload)
  });

  const serializePartnerOcrDetail = (partner) => ({
    idProofFile: serializeFileField(partner.idProofFile),
    addressProofFile: serializeFileField(partner.addressProofFile),
    fullName: partner.fullName || '',
    dob: partner.dob || '',
    pan: partner.pan || '',
    aadharNumber: partner.aadharNumber || ''
  });

  const buildSubmissionData = (data) => ({
    documentUploads: {
      panUpload: serializeFileField(data.panUpload),
      idProofUpload: serializeFileField(data.idProofUpload),
      addressProofUpload: serializeFileField(data.addressProofUpload),
      gstCertificateUpload: serializeFileField(data.gstCertificateUpload),
      msmeCertificateUpload: serializeFileField(data.msmeCertificateUpload),
      udyamCertificateUpload: serializeFileField(data.udyamCertificateUpload),
      partnerUploads: Array.isArray(data.partnerUploads) ? data.partnerUploads.map(serializePartnerUpload) : [],
      payoutOption: data.payoutOption || ''
    },
    banking: {
      bankName: data.bankName || '',
      accountNumber: data.accountNumber || '',
      ifscCode: data.ifscCode || ''
    },
    ocrFiles: {
      idProofFile: serializeFileField(data.idProofFile),
      addressProofFile: serializeFileField(data.addressProofFile)
    },
    companyDetails: {
      vendorCategory: data.vendorCategory || '',
      companyName: data.companyName || '',
      entityType: data.entityType || '',
      numberOfPartners: data.numberOfPartners || '',
      dateOfInc: data.dateOfInc || '',
      classOfActivity: data.classOfActivity || '',
      cin: data.cin || '',
      annualTurnover: data.annualTurnover || '',
      yearsOfExperience: data.yearsOfExperience || ''
    },
    addressDetails: {
      registeredAddress: data.registeredAddress || '',
      state: data.state || '',
      city: data.city || '',
      pincode: data.pincode || '',
      serviceLocations: data.serviceLocations || '',
      serviceState: Array.isArray(data.serviceState) ? data.serviceState : [],
      serviceCity: data.serviceCity || '',
      serviceBranch: data.serviceBranch || ''
    },
    contactVerification: {
      email: data.email || '',
      phone: data.phone || '',
      altContactNumber: data.altContactNumber || '',
      phoneOtp: data.phoneOtp || '',
      emailOtp: data.emailOtp || '',
      showPhoneOtp: data.showPhoneOtp || false,
      showEmailOtp: data.showEmailOtp || false,
      phoneVerified: data.phoneVerified || false,
      emailVerified: data.emailVerified || false,
      phoneOtpError: data.phoneOtpError || '',
      emailOtpError: data.emailOtpError || '',
      partnerCountError: data.partnerCountError || ''
    },
    personalDetails: {
      fullName: data.fullName || '',
      fatherName: data.fatherName || '',
      dob: data.dob || '',
      designation: data.designation || '',
      personalMobile: data.personalMobile || ''
    },
    kycDetails: {
      companyPan: data.companyPan || '',
      individualPan: data.individualPan || '',
      aadharNumber: data.aadharNumber || '',
      gstNumber: data.gstNumber || '',
      msmeRegistered: data.msmeRegistered === true || data.msmeRegistered === 'Yes',
      idType: data.idType || '',
      keyClients: data.keyClients || ''
    },
    references: {
      refName: data.refName || '',
      refContact: data.refContact || '',
      refRelationship: data.refRelationship || '',
      refEmail: data.refEmail || ''
    },
    assessment: {
      assessedByName: data.assessedByName || '',
      assessedByDepartment: data.assessedByDepartment || '',
      assessedByDesignation: data.assessedByDesignation || '',
      meetingDate: data.meetingDate || '',
      spocName: data.spocName || '',
      spocDesignation: data.spocDesignation || '',
      spocEmail: data.spocEmail || '',
      spocPhone: data.spocPhone || ''
    },
    referenceLocations: {
      ref1Inst: data.ref1Inst || '',
      ref1Location: data.ref1Location || '',
      ref2Inst: data.ref2Inst || '',
      ref2Location: data.ref2Location || ''
    },
    partnerDetails: Array.isArray(data.partnerDetails) ? data.partnerDetails.map((partner) => ({
      fullName: partner.fullName || '',
      dob: partner.dob || '',
      pan: partner.pan || '',
      designation: partner.designation || '',
      role: partner.role || '',
      sharePercentage: partner.sharePercentage || ''
    })) : [],
    partnerBankDetails: Array.isArray(data.partnerBankDetails) ? data.partnerBankDetails.map((partner) => ({
      bankName: partner.bankName || '',
      accountNumber: partner.accountNumber || '',
      ifscCode: partner.ifscCode || ''
    })) : [],
    partnerOcrDetails: Array.isArray(data.partnerOcrDetails) ? data.partnerOcrDetails.map(serializePartnerOcrDetail) : [],
    partnerUploads: Array.isArray(data.partnerUploads) ? data.partnerUploads.map(serializePartnerUpload) : []
  });

  const handleFinalSubmit = () => {
    const submission = {
      id: `APP-${Math.floor(100 + Math.random() * 900)}`,
      name: formData.companyName || formData.fullName || 'Unknown',
      dsaCode: `TEMP-${Math.random().toString(36).slice(2,10).toUpperCase()}`,
      date: new Date().toLocaleDateString('en-GB'),
      status: 'Pending',
      step: 'Review',
      data: buildSubmissionData(formData),
      verificationStatus
    };

    try {
      const existing = JSON.parse(localStorage.getItem('submissions') || '[]');
      existing.unshift(submission);
      localStorage.setItem('submissions', JSON.stringify(existing));
      alert('Submission saved to Review Queue.');
    } catch (err) {
      console.error('Failed to save submission', err);
      alert('Failed to save submission to local storage.');
    }
  };

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

  const requiredDocs = DOCUMENT_MATRIX[formData.vendorCategory] || DOCUMENT_MATRIX['Other'];

  return (
    <div className="onboarding-page">
      <div className="onboarding-header glass-panel">
        <h1 className="page-title">Register New Vendor / DSA</h1>
        <p className="text-muted text-sm mt-1">Smart Registration Flow</p>
        
        <div className="stepper mt-4">
          {STEPS.map((step, index) => (
            <div key={index} className={`step ${index <= currentStep ? 'active' : ''} ${index === currentStep ? 'current' : ''}`}>
              <div className="step-circle">{index + 1}</div>
              <span className="step-label">{step}</span>
              {index < STEPS.length - 1 && <div className="step-line"></div>}
            </div>
          ))}
        </div>
      </div>

      <div className="onboarding-content glass-panel animate-fade-in">
        
        {/* STEP 0: Document Upload */}
        {currentStep === 0 && (
          <div className={`step-content animate-fade-in${isVerificationLocked ? ' locked-step' : ''}`} inert={isVerificationLocked}>
            {isVerificationLocked && (
              <div className="locked-overlay">Verification complete. Pages 0–4 are read-only after verification.</div>
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
                  <option>Individual</option>
                  <option>Partnership</option>
                  <option>Proprietorship</option>
                  <option>Firm</option>
                </select>
              </div>
            </div>

            <div className="section-divider"></div>
            <h3 className="section-subheading mt-4">Primary Document Uploads</h3>
            <div className="form-grid">
              <div className="input-group full-width">
                <label>PAN</label>
                <div className="file-upload-row">
                  <div className="file-upload-zone">
                    <FileText size={24} className="mb-2 text-muted" />
                    <p>Upload PAN document</p>
                    <input
                      type="file"
                      onChange={(e) => handleDocumentUpload('panUpload', e.target.files[0])}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    {renderVerificationTag(formData.panUpload, extractionStatus.companyOcr.panUpload)}
                    {formData.panUpload && <p className="text-success text-sm mt-2">✓ {formData.panUpload.name}</p>}
                  </div>
                  <div className="file-upload-actions">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => simulateCompanyDocumentOCRExtraction('panUpload')}
                      disabled={!formData.panUpload || activeExtraction !== null}
                    >
                      {isExtracting('companyOcr-panUpload') ? 'Scanning...' : 'Run OCR'}
                    </button>
                  </div>
                  {renderOcrOutputBox('panUpload')}
                </div>
              </div>

              <div className="input-group full-width">
                <label>ID Proof</label>
                <div className="file-upload-row">
                  <div className="file-upload-zone">
                    <FileText size={24} className="mb-2 text-muted" />
                    <p>Upload ID proof (Aadhar, Voter ID, Passport, etc.)</p>
                    <input
                      type="file"
                      onChange={(e) => handleDocumentUpload('idProofUpload', e.target.files[0])}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    {renderVerificationTag(formData.idProofUpload, extractionStatus.companyOcr.idProofUpload)}
                    {formData.idProofUpload && <p className="text-success text-sm mt-2">✓ {formData.idProofUpload.name}</p>}
                  </div>
                  <div className="file-upload-actions">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => simulateCompanyDocumentOCRExtraction('idProofUpload')}
                      disabled={!formData.idProofUpload || activeExtraction !== null}
                    >
                      {isExtracting('companyOcr-idProofUpload') ? 'Scanning...' : 'Run OCR'}
                    </button>
                  </div>
                  {renderOcrOutputBox('idProofUpload')}
                </div>
              </div>

              <div className="input-group full-width">
                <label>Address Proof</label>
                <div className="file-upload-row">
                  <div className="file-upload-zone">
                    <FileText size={24} className="mb-2 text-muted" />
                    <p>Upload Address Proof (Utility Bill, Bank Statement, Rent Agreement)</p>
                    <input
                      type="file"
                      onChange={(e) => handleDocumentUpload('addressProofUpload', e.target.files[0])}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    {renderVerificationTag(formData.addressProofUpload, extractionStatus.companyOcr.addressProofUpload)}
                    {formData.addressProofUpload && <p className="text-success text-sm mt-2">✓ {formData.addressProofUpload.name}</p>}
                  </div>
                  <div className="file-upload-actions">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => simulateCompanyDocumentOCRExtraction('addressProofUpload')}
                      disabled={!formData.addressProofUpload || activeExtraction !== null}
                    >
                      {isExtracting('companyOcr-addressProofUpload') ? 'Scanning...' : 'Run OCR'}
                    </button>
                  </div>
                  {renderOcrOutputBox('addressProofUpload')}
                </div>
              </div>

              <div className="input-group full-width">
                <label>GST Certificate</label>
                <div className="file-upload-row">
                  <div className="file-upload-zone">
                    <FileText size={24} className="mb-2 text-muted" />
                    <p>Upload GST registration certificate or exemption document</p>
                    <input
                      type="file"
                      onChange={(e) => handleDocumentUpload('gstCertificateUpload', e.target.files[0])}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    {renderVerificationTag(formData.gstCertificateUpload, extractionStatus.companyOcr.gstCertificateUpload)}
                    {formData.gstCertificateUpload && <p className="text-success text-sm mt-2">✓ {formData.gstCertificateUpload.name}</p>}
                  </div>
                  <div className="file-upload-actions">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => simulateCompanyDocumentOCRExtraction('gstCertificateUpload')}
                      disabled={!formData.gstCertificateUpload || activeExtraction !== null}
                    >
                      {isExtracting('companyOcr-gstCertificateUpload') ? 'Scanning...' : 'Run OCR'}
                    </button>
                  </div>
                  {renderOcrOutputBox('gstCertificateUpload')}
                </div>
              </div>

              <div className="input-group full-width">
                <label>MSME Certificate</label>
                <div className="file-upload-row">
                  <div className="file-upload-zone">
                    <FileText size={24} className="mb-2 text-muted" />
                    <p>Upload MSME registration certificate</p>
                    <input
                      type="file"
                      onChange={(e) => handleDocumentUpload('msmeCertificateUpload', e.target.files[0])}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    {renderVerificationTag(formData.msmeCertificateUpload, extractionStatus.companyOcr.msmeCertificateUpload)}
                    {formData.msmeCertificateUpload && <p className="text-success text-sm mt-2">✓ {formData.msmeCertificateUpload.name}</p>}
                  </div>
                  <div className="file-upload-actions">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => simulateCompanyDocumentOCRExtraction('msmeCertificateUpload')}
                      disabled={!formData.msmeCertificateUpload || activeExtraction !== null}
                    >
                      {isExtracting('companyOcr-msmeCertificateUpload') ? 'Scanning...' : 'Run OCR'}
                    </button>
                  </div>
                  {renderOcrOutputBox('msmeCertificateUpload')}
                </div>
              </div>

              <div className="input-group full-width">
                <label>Udyam Certificate</label>
                <div className="file-upload-row">
                  <div className="file-upload-zone">
                    <FileText size={24} className="mb-2 text-muted" />
                    <p>Upload Udyam registration certificate</p>
                    <input
                      type="file"
                      onChange={(e) => handleDocumentUpload('udyamCertificateUpload', e.target.files[0])}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    {renderVerificationTag(formData.udyamCertificateUpload, extractionStatus.companyOcr.udyamCertificateUpload)}
                    {formData.udyamCertificateUpload && <p className="text-success text-sm mt-2">✓ {formData.udyamCertificateUpload.name}</p>}
                  </div>
                  <div className="file-upload-actions">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => simulateCompanyDocumentOCRExtraction('udyamCertificateUpload')}
                      disabled={!formData.udyamCertificateUpload || activeExtraction !== null}
                    >
                      {isExtracting('companyOcr-udyamCertificateUpload') ? 'Scanning...' : 'Run OCR'}
                    </button>
                  </div>
                  {renderOcrOutputBox('udyamCertificateUpload')}
                </div>
              </div>
            </div>

            {formData.entityType === 'Partnership' && (
              <>
                <div className="section-divider mt-6"></div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="section-subheading">Partner Uploads</h3>
                </div>

                {formData.partnerUploads.map((partner, index) => (
                  <div className="partner-card glass-panel mt-4" key={index}>
                    <div className="flex justify-between items-center mb-3">
                      <h4>Partner {index + 1}</h4>
                      <span className="badge badge-secondary">Partner Documents</span>
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
                    Add Partner
                  </button>
                </div>
              </>
            )}

            <div className="section-divider mt-6"></div>
            <h3 className="section-subheading mt-6">OCR Extraction Status</h3>
            <p className="text-sm text-muted mb-4">The system will automatically extract data from your uploaded documents for faster processing.</p>
            
            <div className="banking-options">
              <div className="banking-card glass-panel">
                <h3>Run OCR Extraction</h3>
                <p>Extract and auto-fill information from the uploaded documents using OCR technology.</p>
                <button className="btn btn-primary mt-4" onClick={simulateCompanyOCRExtraction} disabled={activeExtraction !== null}>
                  {isExtracting('companyOcr') ? <><Loader2 className="spin" size={16}/> Processing...</> : 'Run OCR Extraction'}
                </button>
              </div>
            </div>

            {extractionStatus.companyOcr && (
              <div className="success-banner animate-fade-in mt-6">
                <CheckCircle className="text-success" size={24} />
                <div>
                  <strong>Document Processing Successful!</strong>
                  <p>All documents have been processed and data has been extracted for the next steps.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Banking Verification */}
        {currentStep === 2 && (
          <div className={`step-content animate-fade-in${isVerificationLocked ? ' locked-step' : ''}`} inert={isVerificationLocked}>
            {isVerificationLocked && (
              <div className="locked-overlay">Verification complete. Pages 1–4 are read-only after verification.</div>
            )}
            <h2>Banking Verification</h2>
            <p className="mb-6 text-sm text-muted">We initiate banking verification for the company/firm and all partners listed.</p>
            <div className="banking-options">
              <div className="banking-card glass-panel">
                <h3>Company / Firm Bank</h3>
                <p>Verify company bank details and auto-fill from the selected account.</p>
                <button className="btn btn-primary mt-4" onClick={simulateCompanyBankingExtraction} disabled={activeExtraction !== null}>
                  {isExtracting('companyBank') ? <><Loader2 className="spin" size={16}/> Connecting...</> : 'Verify Company Bank'}
                </button>
              </div>
            </div>

            <div className="section-divider"></div>
            <h3 className="section-subheading mt-6">Company / Firm Bank Details</h3>
            <div className="form-grid">
              <div className="input-group">
                <label>Bank Name</label>
                <input type="text" name="bankName" value={formData.bankName} onChange={handleInputChange} disabled={verificationCompleted} />
              </div>
              <div className="input-group">
                <label>Account Number</label>
                <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} disabled={verificationCompleted} />
              </div>
              <div className="input-group">
                <label>IFSC Code</label>
                <input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleInputChange} disabled={verificationCompleted} />
              </div>
            </div>

            {formData.entityType !== 'Individual' && formData.partnerBankDetails.length > 0 && (
              <>
                <div className="section-divider"></div>
                <h3 className="section-subheading mt-6">Partner / Director Bank Details</h3>
                {formData.partnerBankDetails.map((bank, idx) => (
                  <div className="partner-card glass-panel mt-4" key={idx}>
                    <div className="flex justify-between items-center mb-3">
                      <h4>Partner {idx + 1} Bank</h4>
                      <span className="badge badge-secondary">{formData.entityType}</span>
                    </div>
                    <button className="btn btn-outline mb-4" onClick={() => simulatePartnerBankingExtraction(idx)} disabled={activeExtraction !== null}>
                      {isExtracting(`partnerBank-${idx}`) ? <><Loader2 className="spin" size={16}/> Verifying...</> : `Verify Partner ${idx + 1} Bank`}
                    </button>
                    <div className="form-grid">
                      <div className="input-group">
                        <label>Bank Name</label>
                        <input type="text" value={bank.bankName} onChange={(e) => handlePartnerBankChange(idx, 'bankName', e.target.value)} />
                      </div>
                      <div className="input-group">
                        <label>Account Number</label>
                        <input type="text" value={bank.accountNumber} onChange={(e) => handlePartnerBankChange(idx, 'accountNumber', e.target.value)} />
                      </div>
                      <div className="input-group">
                        <label>IFSC Code</label>
                        <input type="text" value={bank.ifscCode} onChange={(e) => handlePartnerBankChange(idx, 'ifscCode', e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {extractionStatus.companyBank && (
              <div className="success-banner animate-fade-in mt-6">
                <CheckCircle className="text-success" size={24} />
                <div>
                  <strong>Company Banking Details Verified!</strong>
                  <p>Company Bank: {formData.bankName} | A/C: {formData.accountNumber}</p>
                </div>
              </div>
            )}

            {formData.entityType !== 'Individual' && verifiedPartnerBanks > 0 && (
              <div className="success-banner animate-fade-in mt-4">
                <CheckCircle className="text-success" size={24} />
                <div>
                  <strong>Partner Banking Details Verified!</strong>
                  <p>{verifiedPartnerBanks} of {formData.partnerBankDetails.length} partner/director bank records have been verified.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 1: Entity Details */}
        {currentStep === 1 && (
          <div className={`step-content animate-fade-in${isVerificationLocked ? ' locked-step' : ''}`} inert={isVerificationLocked}>
            {isVerificationLocked && (
              <div className="locked-overlay">Verification complete. Pages 1–4 are read-only after verification.</div>
            )}
            {/* <div className="flex justify-between items-center border-bottom mb-4 pb-2">
              <h2>Entity & Contact Details</h2>
              <span className="badge badge-success">Smart Pre-filled</span>
            </div> */}

            <h3 className="section-subheading">Entity Setup</h3>
            <div className="form-grid">
              <div className="input-group">
                <label>Entity Type</label>
                <select name="entityType" value={formData.entityType} onChange={handleEntityTypeChange}>
                  <option>Individual</option>
                  <option>Proprietorship</option>
                  <option>Partnership</option>
                  <option>Firm</option>
                </select>
              </div>
              {formData.entityType !== 'Individual' && (
                <div className="input-group">
                  <label>Number of Partners / Directors</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.numberOfPartners}
                    onChange={handleNumberOfPartnersChange}
                    placeholder="Enter number"
                  />
                  {formData.partnerCountError && <p className="text-error text-sm">{formData.partnerCountError}</p>}
                </div>
              )}
            </div>

            <div className="section-divider"></div>
            <h3 className="section-subheading">Company / Vendor Details</h3>
            <div className="form-grid">
              <div className="input-group">
                <label>Company / Vendor Name</label>
                <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} disabled={verificationCompleted} />
              </div>
              <div className="input-group">
                <label>Vendor Category</label>
                <select name="vendorCategory" value={formData.vendorCategory} onChange={handleInputChange} disabled={verificationCompleted}>
                  {VENDOR_CATEGORIES.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Date of Incorporation / DOB</label>
                <input
                  type="date"
                  name="dateOfInc"
                  value={formData.dateOfInc}
                  onChange={handleInputChange}
                  inputMode="numeric"
                  pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
                />
              </div>
              <div className="input-group">
                <label>Designation</label>
                <input type="text" name="designation" value={formData.designation} onChange={handleInputChange} placeholder="e.g., Director" />
              </div>
              <div className="input-group">
                <label>Phone Number</label>
                <div className="input-with-button">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    placeholder="10-digit mobile"
                  />
                  <button type="button" className="btn btn-secondary" onClick={handleSendPhoneOtp} disabled={!formData.phone || formData.phoneVerified}>
                    {formData.phoneVerified ? 'Verified' : 'Verify Phone'}
                  </button>
                </div>
                {formData.showPhoneOtp && !formData.phoneVerified && (
                  <div className="otp-row">
                    <input type="text" name="phoneOtp" value={formData.phoneOtp} onChange={handleInputChange} placeholder="Enter OTP" />
                    <button type="button" className="btn btn-primary" onClick={handleVerifyPhoneOtp}>Verify OTP</button>
                  </div>
                )}
                {formData.phoneOtpError && <p className="text-error text-sm">{formData.phoneOtpError}</p>}
                {formData.phoneVerified && <p className="text-success text-sm">Phone verified successfully.</p>}
              </div>
              <div className="input-group">
                <label>Alternate Contact Number</label>
                <input
                  type="tel"
                  name="altContactNumber"
                  value={formData.altContactNumber}
                  onChange={handleInputChange}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                  placeholder="10-digit mobile"
                />
              </div>
              <div className="input-group">
                <label>Email Address</label>
                <div className="input-with-button">
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
                  <button type="button" className="btn btn-secondary" onClick={handleSendEmailOtp} disabled={!formData.email || formData.emailVerified}>
                    {formData.emailVerified ? 'Verified' : 'Verify Email'}
                  </button>
                </div>
                {formData.showEmailOtp && !formData.emailVerified && (
                  <div className="otp-row">
                    <input type="text" name="emailOtp" value={formData.emailOtp} onChange={handleInputChange} placeholder="Enter OTP" />
                    <button type="button" className="btn btn-primary" onClick={handleVerifyEmailOtp}>Verify OTP</button>
                  </div>
                )}
                {formData.emailOtpError && <p className="text-error text-sm">{formData.emailOtpError}</p>}
                {formData.emailVerified && <p className="text-success text-sm">Email verified successfully.</p>}
              </div>
              <div className="input-group">
                <label>Registered Address</label>
                <input type="text" name="registeredAddress" value={formData.registeredAddress} onChange={handleInputChange} disabled={verificationCompleted} />
              </div>
              <div className="input-group">
                <label>Select Serving State</label>
                <select
                  multiple
                  value={formData.serviceState}
                  onChange={handleMultiSelectChange}
                  disabled={verificationCompleted}
                  style={{ minHeight: '120px' }}
                >
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-muted mt-1">Hold Ctrl/Cmd to select multiple states</p>
                {formData.serviceState.length > 0 && (
                  <div className="selected-tags mt-3">
                    <p className="text-sm font-semibold mb-2">Selected States:</p>
                    <div className="tags-container">
                      {formData.serviceState.map((state) => (
                        <div key={state} className="tag-chip">
                          <span>{state}</span>
                          <button
                            type="button"
                            className="tag-remove"
                            onClick={() => removeSelectedState(state)}
                            disabled={verificationCompleted}
                            title="Remove"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="input-group">
                <label>Select Serving City</label>
                <input type="text" name="serviceCity" value={formData.serviceCity} onChange={handleInputChange} disabled={verificationCompleted} />
              </div>
              <div className="input-group">
                <label>Select Serving Branch</label>
                <input type="text" name="serviceBranch" value={formData.serviceBranch} onChange={handleInputChange} disabled={verificationCompleted} />
              </div>
            </div>

            <div className="section-divider"></div>
            <h3 className="section-subheading">Business Details</h3>
            <div className="form-grid">
              <div className="input-group">
                <label>Vendor Annual Turnover (INR)</label>
                <input type="text" name="annualTurnover" value={formData.annualTurnover} onChange={handleInputChange} disabled={verificationCompleted} />
              </div>
              <div className="input-group">
                <label>Years of Experience</label>
                <input type="text" name="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleInputChange} />
              </div>
              <div className="input-group full-width">
                <label>Key Clients Worked With</label>
                <input type="text" name="keyClients" value={formData.keyClients} onChange={handleInputChange} placeholder="Ex: HDFC, ICICI, etc." />
              </div>
            </div>

            <div className="section-divider"></div>
            <h3 className="section-subheading">Reference Details</h3>
            <div className="form-grid">
              <div className="input-group">
                <label>Reference Name</label>
                <input type="text" name="refName" value={formData.refName} onChange={handleInputChange} />
              </div>
              <div className="input-group">
                <label>Contact Details</label>
                <input type="text" name="refContact" value={formData.refContact} onChange={handleInputChange} />
              </div>
              <div className="input-group">
                <label>Relationship with Vendor</label>
                <input type="text" name="refRelationship" value={formData.refRelationship} onChange={handleInputChange} />
              </div>
              <div className="input-group">
                <label>Email ID</label>
                <input type="email" name="refEmail" value={formData.refEmail} onChange={handleInputChange} />
              </div>
            </div>

            <div className="section-divider"></div>
            <h3 className="section-subheading">Vendor Met & Assessed By</h3>
            <div className="form-grid">
              <div className="input-group">
                <label>Employee Name</label>
                <input type="text" name="assessedByName" value={formData.assessedByName} onChange={handleInputChange} />
              </div>
              <div className="input-group">
                <label>Department</label>
                <input type="text" name="assessedByDepartment" value={formData.assessedByDepartment} onChange={handleInputChange} />
              </div>
              <div className="input-group">
                <label>Designation</label>
                <input type="text" name="assessedByDesignation" value={formData.assessedByDesignation} onChange={handleInputChange} />
              </div>
              <div className="input-group">
                <label>Date of Meeting</label>
                <input
                  type="date"
                  name="meetingDate"
                  value={formData.meetingDate}
                  onChange={handleInputChange}
                  inputMode="numeric"
                  pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
                />
              </div>
            </div>

            <div className="section-divider"></div>
            <h3 className="section-subheading">ISFC SPOC Details</h3>
            <div className="form-grid">
              <div className="input-group">
                <label>SPOC Name</label>
                <input type="text" name="spocName" value={formData.spocName} onChange={handleInputChange} />
              </div>
              <div className="input-group">
                <label>Designation</label>
                <input type="text" name="spocDesignation" value={formData.spocDesignation} onChange={handleInputChange} />
              </div>
              <div className="input-group">
                <label>Email ID</label>
                <input type="email" name="spocEmail" value={formData.spocEmail} onChange={handleInputChange} />
              </div>
              <div className="input-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="spocPhone"
                  value={formData.spocPhone}
                  onChange={handleInputChange}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                  placeholder="10-digit mobile"
                />
              </div>
            </div>

            {formData.entityType === 'Individual' ? (
              <>
                <h3 className="section-subheading">Key Person Details</h3>
                <div className="form-grid">
                  <div className="input-group">
                    <label>Full Name (Pre-filled from ID Proof)</label>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="prefilled" />
                  </div>
                  <div className="input-group">
                    <label>Date of Birth (Pre-filled from ID Proof)</label>
                    <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="prefilled" />
                  </div>
                  <div className="input-group">
                    <label>Father's Name</label>
                    <input type="text" name="fatherName" value={formData.fatherName} onChange={handleInputChange} />
                  </div>
                  <div className="input-group">
                    <label>Designation</label>
                    <input type="text" name="designation" value={formData.designation} onChange={handleInputChange} placeholder="e.g., Director" />
                  </div>
                </div>
              </>
            ) : (
              <>
                <h3 className="section-subheading">Partner / Director Details</h3>
                {formData.partnerDetails.length === 0 && (
                  <p className="text-sm text-muted">Enter the number of partners or directors above to capture details for each individual.</p>
                )}
                {formData.partnerDetails.map((partner, idx) => (
                  <div className="partner-card glass-panel mt-4" key={idx}>
                    <div className="flex justify-between items-center mb-3">
                      <h4>Partner / Director {idx + 1}</h4>
                      <span className="badge badge-secondary">{formData.entityType}</span>
                    </div>
                    <div className="form-grid">
                      <div className="input-group">
                        <label>Full Name</label>
                        <input type="text" value={partner.fullName} onChange={(e) => handlePartnerDetailChange(idx, 'fullName', e.target.value)} />
                      </div>
                      <div className="input-group">
                        <label>Date of Birth</label>
                        <input type="date" value={partner.dob} onChange={(e) => handlePartnerDetailChange(idx, 'dob', e.target.value)} />
                      </div>
                      <div className="input-group">
                        <label>PAN Number</label>
                        <input type="text" value={partner.pan} onChange={(e) => handlePartnerDetailChange(idx, 'pan', e.target.value)} />
                      </div>
                      <div className="input-group">
                        <label>Designation / Role</label>
                        <input type="text" value={partner.designation} onChange={(e) => handlePartnerDetailChange(idx, 'designation', e.target.value)} placeholder="e.g., Director" />
                      </div>
                      <div className="input-group">
                        <label>Role / Share %</label>
                        <input type="text" value={partner.role} onChange={(e) => handlePartnerDetailChange(idx, 'role', e.target.value)} placeholder="e.g., Partner / 50%" />
                      </div>
                      <div className="input-group">
                        <label>Share Percentage</label>
                        <input type="text" value={partner.sharePercentage} onChange={(e) => handlePartnerDetailChange(idx, 'sharePercentage', e.target.value)} placeholder="50" />
                      </div>
                    </div>
                    <div className="section-divider"></div>
                    <div className="flex justify-between items-center">
                      <h4 className="mt-4">Bank Details for Partner {idx + 1}</h4>
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => simulatePartnerBankingExtraction(idx)}
                        disabled={activeExtraction !== null}
                      >
                        {isExtracting(`partnerBank-${idx}`) ? <><Loader2 className="spin" size={14}/> Verifying...</> : 'Verify Bank'}
                      </button>
                    </div>
                    <div className="form-grid mt-3">
                      <div className="input-group">
                        <label>Bank Name</label>
                        <input type="text" value={formData.partnerBankDetails[idx]?.bankName || ''} onChange={(e) => handlePartnerBankChange(idx, 'bankName', e.target.value)} />
                      </div>
                      <div className="input-group">
                        <label>Account Number</label>
                        <input type="text" value={formData.partnerBankDetails[idx]?.accountNumber || ''} onChange={(e) => handlePartnerBankChange(idx, 'accountNumber', e.target.value)} />
                      </div>
                      <div className="input-group">
                        <label>IFSC Code</label>
                        <input type="text" value={formData.partnerBankDetails[idx]?.ifscCode || ''} onChange={(e) => handlePartnerBankChange(idx, 'ifscCode', e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            <h3 className="section-subheading mt-6">KYC Information</h3>
            <div className="form-grid">
              <div className="input-group">
                <label>Individual PAN (Pre-filled)</label>
                <input type="text" name="individualPan" value={formData.individualPan} onChange={handleInputChange} className="prefilled" />
              </div>
              <div className="input-group">
                <label>GST Number</label>
                <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleInputChange} />
              </div>
              <div className="input-group">
                <label>MSME Registered?</label>
                <select name="msmeRegistered" value={formData.msmeRegistered} onChange={handleInputChange}>
                  <option>Yes</option><option>No</option>
                </select>
              </div>
            </div>

            <h3 className="section-subheading mt-6">RCU Business References (Manual Entry)</h3>
            <div className="form-grid">
              <div className="input-group">
                <label>Reference 1: Institution Name</label>
                <input type="text" name="ref1Inst" value={formData.ref1Inst} onChange={handleInputChange} />
              </div>
              <div className="input-group">
                <label>Reference 1: Location & RM Name</label>
                <input type="text" name="ref1Location" value={formData.ref1Location} onChange={handleInputChange} />
              </div>
              <div className="input-group">
                <label>Reference 2: Institution Name</label>
                <input type="text" name="ref2Inst" value={formData.ref2Inst} onChange={handleInputChange} />
              </div>
              <div className="input-group">
                <label>Reference 2: Location & RM Name</label>
                <input type="text" name="ref2Location" value={formData.ref2Location} onChange={handleInputChange} />
              </div>
            </div>
          </div>
        )}
        
        {/* STEP 3: Document Collection */}
        {currentStep === 3 && (
          <div className={`step-content animate-fade-in${isVerificationLocked ? ' locked-step' : ''}`} inert={isVerificationLocked}>
            {isVerificationLocked && (
              <div className="locked-overlay">Verification complete. Pages 1–4 are read-only after verification.</div>
            )}
            <h2>Additional Document Collection</h2>
            <p className="mb-4 text-sm text-muted">ID and Address proofs were already collected in Step 2. Showing remaining required documents for: <strong>{formData.vendorCategory}</strong></p>
            
            <div className="form-grid">
              {requiredDocs.map((doc, idx) => (
                <div className="input-group" key={idx}>
                  <label>Upload {doc}</label>
                  <div className="file-upload-zone">
                    <p>Click to Upload</p>
                    <input type="file" />
                  </div>
                
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* STEP 4: Verification */}
        {currentStep === 4 && (
          <div className={`step-content animate-fade-in${isVerificationLocked ? ' locked-step' : ''}`} inert={isVerificationLocked}>
            {isVerificationLocked && (
              <div className="locked-overlay">Verification complete. Pages 1–4 are read-only after verification.</div>
            )}
            <h2>Verification & BRE Checks</h2>
            <p className="mb-4 text-sm text-muted">Run verification APIs and BRE for PAN, DL, Voter, Udyam and GST documents.</p>

            <div className="payout-grid">
              {['PAN', 'DL', 'Voter', 'Udyam', 'GST'].map((item) => (
                <div className="payout-card glass-panel" key={item}>
                  <h3>{item}</h3>
                  <p className="text-sm">Verification API and BRE will be run for this document.</p>
                  <div className="mt-4">
                    <span className={`badge ${verificationStatus[item.toLowerCase()] ? 'badge-success' : 'badge-warning'}`}>
                      {verificationStatus[item.toLowerCase()] ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="banking-options">
              <div className="banking-card glass-panel">
                <h3>Run Document Verification</h3>
                <p>Trigger all verification APIs and business rules for the selected documents.</p>
                <button className="btn btn-primary mt-4" onClick={simulateVerificationRun} disabled={verificationRunning || verificationCompleted}>
                  {verificationRunning ? <><Loader2 className="spin" size={16}/> Running...</> : 'Run Verification'}
                </button>
              </div>
            </div>

            {Object.values(verificationStatus).every(Boolean) && !verificationRunning && (
              <div className="success-banner animate-fade-in mt-6">
                <CheckCircle className="text-success" size={24} />
                <div>
                  <strong>Verification Complete!</strong>
                  <p>PAN, DL, Voter, Udyam and GST verification APIs and BRE checks have been completed successfully.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 5: Payout & Stamp Selection */}
        {currentStep === 5 && (
          <div className="step-content animate-fade-in">
            <h2>Payout & Stamp Selection</h2>
            <div className="payout-grid">
              {[
                {
                  option: 'A',
                  label: 'Standard Payout (A)',
                  rate: '1.50%',
                  description: 'Standard onboarding rate as per BRE.',
                  recommended: true
                },
                {
                  option: 'B',
                  label: 'Premium Payout (B)',
                  rate: '1.75%',
                  description: 'Requires Business Head Approval.'
                }
              ].map((plan) => (
                <div
                  key={plan.option}
                  className={`payout-card glass-panel ${formData.payoutOption === plan.option ? 'selected' : ''}`}
                  onClick={() => handlePayoutSelection(plan.option)}
                  style={{ cursor: 'pointer' }}
                >
                  {plan.recommended && <div className="badge badge-success mb-2">Recommended</div>}
                  <h3>{plan.label}</h3>
                  <p className="payout-rate">{plan.rate}</p>
                  <p className="text-sm">{plan.description}</p>
                </div>
              ))}
            </div>

            <h3 className="section-subheading mt-6 mb-4">Payment Mode</h3>
            <div className="payout-grid">
              {[
                {
                  mode: 'qr',
                  label: 'QR Scan',
                  description: 'Scan the QR code to complete the payment'
                },
                {
                  mode: 'sms',
                  label: 'Pay via SMS',
                  description: 'Receive payment prompt on your registered mobile number'
                }
              ].map((paymentOption) => (
                <div
                  key={paymentOption.mode}
                  className={`payout-card glass-panel ${formData.paymentMode === paymentOption.mode ? 'selected' : ''}`}
                  onClick={() => handlePaymentModeSelection(paymentOption.mode)}
                  style={{ cursor: 'pointer' }}
                >
                  <h3>{paymentOption.label}</h3>
                  <p className="text-sm">{paymentOption.description}</p>
                </div>
              ))}
            </div>

            {/* QR Code Display */}
            {formData.paymentMode === 'qr' && (
              <QRCodeDisplay email={formData.email} />
            )}

            {/* SMS OTP Form */}
            {formData.paymentMode === 'sms' && (
              <div className="sms-otp-container glass-panel p-4 mt-6">
                <h3 className="mb-4">Send OTP via SMS</h3>
                <div className="input-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    placeholder="Enter your 10-digit phone number"
                    value={formData.paymentPhoneNumber}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      paymentPhoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10)
                    }))}
                    maxLength="10"
                    disabled={formData.paymentOtpSent}
                  />
                </div>
                
                {!formData.paymentOtpSent ? (
                  <button 
                    className="btn btn-primary mt-4"
                    onClick={handleSendOtp}
                  >
                    Send OTP
                  </button>
                ) : (
                  <div className="input-group mt-4">
                    <label>Enter OTP</label>
                    <input
                      type="text"
                      placeholder="Enter the 6-digit OTP"
                      value={formData.paymentOtp}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        paymentOtp: e.target.value.replace(/\D/g, '').slice(0, 6)
                      }))}
                      maxLength="6"
                    />
                    <button 
                      className="btn btn-success mt-2"
                      onClick={() => alert('OTP verified successfully!')}
                    >
                      Verify OTP
                    </button>
                  </div>
                )}
              </div>
            )}
            
            <h3 className="section-subheading mt-6 mb-4">Stamp Duty Collection</h3>
            <div className="input-group w-50">
              <label>Select State</label>
              <select>
                <option>Delhi (Rs. 500/-)</option>
                <option>Haryana (Rs. 1000/-)</option>
                <option>Maharashtra (Rs. 500/-)</option>
              </select>
            </div>
          </div>
        )}
        
        {/* STEP 6: E-Signing */}
        {currentStep === 6 && (
          <div className="step-content animate-fade-in">
            <h2>E-Signing & Submission</h2>
            <div className="esign-container glass-panel">
              <div className="esign-status">
                <div className="status-icon pending"></div>
                <div>
                  <h3>Agreement Generation</h3>
                  <p>The Agreement is ready for e-signing via Leegality.</p>
                </div>
              </div>
              
              <div className="input-group mt-4">
                <label>Mobile Number for E-Sign Link</label>
                <input type="tel" value="9876543210" readOnly />
              </div>
              
              <button className="btn btn-primary mt-4">
                <Smartphone size={16} className="mr-2" /> Send E-Sign Link
              </button>
            </div>
          </div>
        )}

        <div className="onboarding-footer">
          <button className="btn btn-outline" onClick={prevStep} disabled={currentStep === 0}>
            Back
          </button>
          <button className="btn btn-primary" onClick={currentStep === STEPS.length - 1 ? handleFinalSubmit : nextStep}>
            {currentStep === STEPS.length - 1 ? 'Submit Registration' : 'Save & Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
