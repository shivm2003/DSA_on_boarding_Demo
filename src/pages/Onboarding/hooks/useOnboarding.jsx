import { useCallback, useState } from 'react';
import { DOCUMENT_MATRIX, ENTITY_ADDITIONAL_DOCS, STEPS } from '../constants';
import { useFormState } from './useFormState';
import { useOtpHandlers } from './useOtpHandlers';
import { useDocumentUpload } from './useDocumentUpload';
import { usePartnerManagement } from './usePartnerManagement';
import { usePayoutHandlers } from './usePayoutHandlers';
import { useSubmission } from './useSubmission';

export const useOnboarding = () => {
  // ── Core Form State & Navigation ──
  const {
    currentStep, setCurrentStep,
    formData, setFormData,
    nextStep, prevStep,
    handleInputChange, handleMultiSelectChange, removeSelectedState
  } = useFormState();

  // ── Standalone State Variables (Not tied to formData) ──
  const [bankingMode, setBankingMode] = useState(null); // 'aa' | 'manual' | null
  const [aaPhone, setAaPhone] = useState('');
  const [aaLinkSent, setAaLinkSent] = useState(false);
  const [aaStatusChecked, setAaStatusChecked] = useState(false);
  const [aaMaskedAccount, setAaMaskedAccount] = useState('');
  const [aaAccountNumber, setAaAccountNumber] = useState('');
  const [aaBankOtpSent, setAaBankOtpSent] = useState(false);
  const [aaBankOtp, setAaBankOtp] = useState('');
  const [aaBankOtpVerified, setAaBankOtpVerified] = useState(false);
  const [aaBankOtpError, setAaBankOtpError] = useState('');

  const [pennyDropDone, setPennyDropDone] = useState(false);
  const [manualBankParsing, setManualBankParsing] = useState(false);
  
  const [manualBankOtpSent, setManualBankOtpSent] = useState(false);
  const [manualBankOtp, setManualBankOtp] = useState('');
  const [manualBankOtpVerified, setManualBankOtpVerified] = useState(false);
  const [manualBankOtpError, setManualBankOtpError] = useState('');

  const [verificationRunning, setVerificationRunning] = useState(false);
  const [verificationCompleted, setVerificationCompleted] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState({
    pan: false,
    dl: false,
    voter: false,
    udyam: false,
    gst: false
  });

  // ── Sub-hooks for focused logic ──
  const otpHandlers = useOtpHandlers(setFormData);

  const documentHandlers = useDocumentUpload(formData, setFormData);
  const { 
    extractionStatus, setExtractionStatus, 
    ocrOutputs, setOcrOutputs 
  } = documentHandlers;

  const partnerHandlers = usePartnerManagement(
    formData, setFormData, 
    extractionStatus, setExtractionStatus, 
    ocrOutputs, setOcrOutputs
  );

  const payoutHandlers = usePayoutHandlers(formData, setFormData);

  const submissionHandlers = useSubmission(formData, verificationStatus);
  const [step1Error, setStep1Error] = useState('');

  // ── Validation Helpers ──
  const validateStep1Documents = () => {
    if (formData.entityType === 'Proprietorship' || formData.entityType === 'Partnership') {
      const additionalKeys = ENTITY_ADDITIONAL_DOCS[formData.entityType]?.map(doc => doc.key) || [];
      const hasAnyAdditionalDocument = additionalKeys.some(key => !!formData[key]);
      if (!hasAnyAdditionalDocument) {
        setStep1Error(`Upload at least one additional document for ${formData.entityType}.`);
        return false;
      }
    }
    setStep1Error('');
    return true;
  };

  const handleNextStep = async () => {
    if (currentStep === 0 && !validateStep1Documents()) {
      return;
    }

    const saved = await submissionHandlers.handleSaveDraft({
      step: STEPS[currentStep + 1] || 'Draft',
      status: 'Draft',
      successMessage: 'Application saved as draft.'
    });
    if (!saved) return;

    nextStep();
  };

  const loadExistingApplication = useCallback((application) => {
    if (!application) return;

    const restoredFormData = application.data?.allFields || application.data || {};
    setFormData(prev => ({
      ...prev,
      ...restoredFormData
    }));

    const savedStepIndex = STEPS.indexOf(application.step);
    if (savedStepIndex >= 0) {
      setCurrentStep(savedStepIndex);
    } else if (application.step === 'Review') {
      setCurrentStep(STEPS.length - 1);
    } else {
      setCurrentStep(0);
    }

    submissionHandlers.setSubmissionId(application.id || application.dsaCode);
  }, [setCurrentStep, setFormData, submissionHandlers]);

  // ── Computed Properties ──
  const isVerificationLocked = verificationCompleted && currentStep <= 4;
  const requiredDocs = DOCUMENT_MATRIX[formData.vendorCategory] || DOCUMENT_MATRIX['Other'];

  // ── Return Unified API ──
  return {
    // Navigation
    currentStep, setCurrentStep, nextStep, prevStep, handleNextStep, loadExistingApplication,
    
    // Banking State
    bankingMode, setBankingMode,
    aaPhone, setAaPhone,
    aaLinkSent, setAaLinkSent,
    aaStatusChecked, setAaStatusChecked,
    aaMaskedAccount, setAaMaskedAccount,
    aaAccountNumber, setAaAccountNumber,
    aaBankOtpSent, setAaBankOtpSent,
    aaBankOtp, setAaBankOtp,
    aaBankOtpVerified, setAaBankOtpVerified,
    aaBankOtpError, setAaBankOtpError,
    pennyDropDone, setPennyDropDone,
    manualBankParsing, setManualBankParsing,
    manualBankOtpSent, setManualBankOtpSent,
    manualBankOtp, setManualBankOtp,
    manualBankOtpVerified, setManualBankOtpVerified,
    manualBankOtpError, setManualBankOtpError,
    
    // Verification State
    verificationRunning, setVerificationRunning,
    verificationCompleted, setVerificationCompleted,
    verificationStatus, setVerificationStatus,
    isVerificationLocked,

    // Form Data & Core Handlers
    formData, setFormData,
    handleInputChange, handleMultiSelectChange, removeSelectedState,
    
    // Computed Docs
    requiredDocs,

    // Spread Sub-hook APIs
    ...otpHandlers,
    ...documentHandlers,
    ...partnerHandlers,
    ...payoutHandlers,
    ...submissionHandlers,
    step1Error
  };
};
