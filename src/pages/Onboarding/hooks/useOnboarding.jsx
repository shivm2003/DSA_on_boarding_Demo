import { useState } from 'react';
import { DOCUMENT_MATRIX } from '../constants';
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
  const [aaAccountNumber, setAaAccountNumber] = useState('');
  const [pennyDropDone, setPennyDropDone] = useState(false);
  const [manualBankParsing, setManualBankParsing] = useState(false);

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

  // ── Computed Properties ──
  const isVerificationLocked = verificationCompleted && currentStep <= 4;
  const requiredDocs = DOCUMENT_MATRIX[formData.vendorCategory] || DOCUMENT_MATRIX['Other'];

  // ── Return Unified API ──
  return {
    // Navigation
    currentStep, setCurrentStep, nextStep, prevStep,
    
    // Banking State
    bankingMode, setBankingMode,
    aaPhone, setAaPhone,
    aaLinkSent, setAaLinkSent,
    aaAccountNumber, setAaAccountNumber,
    pennyDropDone, setPennyDropDone,
    manualBankParsing, setManualBankParsing,
    
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
    ...submissionHandlers
  };
};
