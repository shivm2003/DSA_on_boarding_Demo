import { useCallback, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Onboarding.css';
import { STEPS } from './constants';
import ProgressStepper from './ProgressStepper/ProgressStepper';
import VerificationModal from './VerificationModal/VerificationModal';
import Step1Documents from './Step1Documents/Step1Documents';
import Step2Details from './Step2Details/Step2Details';
import Step3Banking from './Step3Banking/Step3Banking';
import Step4Payout from './Step4Payout/Step4Payout';
import Step5ESigning from './Step5ESigning/Step5ESigning';
import { useOnboarding } from './hooks/useOnboarding';

const DEFAULT_VALUES_TO_IGNORE = new Set([
  '',
  'DSA',
  'Individual',
  'A',
  'No',
  'Voter ID',
  'Shivam Mishra',
  'BSG',
  'Manager'
]);

const hasMeaningfulOnboardingData = (value, key = '') => {
  if (value === null || value === undefined || value === false) return false;
  if (key === 'meetingDate') return false;
  if (typeof value === 'string') return !DEFAULT_VALUES_TO_IGNORE.has(value.trim());
  if (typeof value === 'number') return value !== 0;
  if (value instanceof File) return true;
  if (Array.isArray(value)) return value.some(item => hasMeaningfulOnboardingData(item));
  if (typeof value === 'object') {
    if (value.name || value.filename || value.documentId) return true;
    return Object.entries(value).some(([childKey, childValue]) => hasMeaningfulOnboardingData(childValue, childKey));
  }
  return Boolean(value);
};

const Onboarding = () => {
  const navigate = useNavigate();
  const { applicationId } = useParams();
  const isLeavingRef = useRef(false);
  const leaveOnboardingRef = useRef(null);
  const loadedApplicationRef = useRef(null);
  const {
    currentStep, formData, setFormData, isVerificationLocked, docParseStatus, handleDocumentUpload,
    extractionStatus, handlePartnerDocumentUpload, verificationCompleted, addPartner,
    handleInputChange, handleSendPhoneOtp, handleVerifyPhoneOtp, handleSendAltPhoneOtp, handleVerifyAltPhoneOtp,
    handleSendEmailOtp, handleVerifyEmailOtp, handleMultiSelectChange, removeSelectedState,
    handleEntityTypeChange, handleNumberOfPartnersChange, handlePartnerDetailChange, bankingMode, setBankingMode,
    setManualBankParsing, setAaLinkSent, setAaPhone, aaPhone, aaLinkSent, aaAccountNumber,
    setAaAccountNumber, pennyDropDone, setPennyDropDone, manualBankParsing, handlePayoutSelection,
    handlePaymentModeSelection, handleSendOtp,
    prevStep, handleNextStep, handleFinalSubmit, verificationModalData, setVerificationModalData,
    handleApproveAndMap, renderVerificationTag, step1Error,
    handleSaveDraft, isSavingSubmission, loadExistingApplication
  } = useOnboarding();

  useEffect(() => {
    if (!applicationId || loadedApplicationRef.current === applicationId) return;

    const fetchApplication = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/submissions/${applicationId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error('Application not found');
        }

        const application = await response.json();
        loadExistingApplication(application);
        loadedApplicationRef.current = applicationId;
      } catch (error) {
        console.error('Failed to load application:', error);
        alert('Failed to load the saved application.');
        navigate('/app/onboarding', { replace: true });
      }
    };

    fetchApplication();
  }, [applicationId, loadExistingApplication, navigate]);

  const leaveOnboarding = useCallback(async () => {
    if (isLeavingRef.current) return;

    if (!hasMeaningfulOnboardingData(formData)) {
      isLeavingRef.current = true;
      navigate('/app/onboarding', { replace: true });
      return;
    }

    const shouldSave = window.confirm('Do you want to save this onboarding data? Click OK to save, or Cancel to discard changes.');
    isLeavingRef.current = true;

    if (shouldSave) {
      const saved = await handleSaveDraft();
      if (!saved) {
        isLeavingRef.current = false;
        return;
      }
    }

    navigate('/app/onboarding', { replace: true });
  }, [formData, handleSaveDraft, navigate]);

  useEffect(() => {
    leaveOnboardingRef.current = leaveOnboarding;
  }, [leaveOnboarding]);

  useEffect(() => {
    window.history.pushState({ onboardingGuard: true }, '', window.location.href);

    const handlePopState = () => {
      if (isLeavingRef.current) return;
      leaveOnboardingRef.current?.();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const hasStartedOnboarding = hasMeaningfulOnboardingData(formData);

    const handleBeforeUnload = (event) => {
      if (isLeavingRef.current || !hasStartedOnboarding) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formData]);

  const onFinalSubmit = async () => {
    const success = await handleFinalSubmit();
    if (success) {
      isLeavingRef.current = true;
      navigate('/app/onboarding', { replace: true });
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
      leaveOnboarding();
      return;
    }
    prevStep();
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-header glass-panel">
        <h1 className="page-title">Register New Vendor / DSA</h1>
        <p className="text-muted text-sm mt-1">Smart Registration Flow</p>
        <ProgressStepper currentStep={currentStep} />
      </div>

      <div className="onboarding-content glass-panel animate-fade-in">
        {currentStep === 0 && (
          <Step1Documents 
            formData={formData} 
            setFormData={setFormData}
            handleEntityTypeChange={handleEntityTypeChange} 
            isVerificationLocked={isVerificationLocked} 
            docParseStatus={docParseStatus} 
            handleDocumentUpload={handleDocumentUpload} 
            extractionStatus={extractionStatus} 
            renderVerificationTag={renderVerificationTag} 
            step1Error={step1Error}
            handlePartnerDocumentUpload={handlePartnerDocumentUpload} 
            verificationCompleted={verificationCompleted} 
            addPartner={addPartner} 
            validationError={step1Error}
          />
        )}
        
        {currentStep === 1 && (
          <Step2Details 
            formData={formData} 
            setFormData={setFormData}
            isVerificationLocked={isVerificationLocked} 
            verificationCompleted={verificationCompleted} 
            handleInputChange={handleInputChange} 
            handleSendPhoneOtp={handleSendPhoneOtp} 
            handleVerifyPhoneOtp={handleVerifyPhoneOtp} 
            handleSendAltPhoneOtp={handleSendAltPhoneOtp} 
            handleVerifyAltPhoneOtp={handleVerifyAltPhoneOtp} 
            handleSendEmailOtp={handleSendEmailOtp}
            handleVerifyEmailOtp={handleVerifyEmailOtp}
            handleMultiSelectChange={handleMultiSelectChange}
            removeSelectedState={removeSelectedState}
            handleEntityTypeChange={handleEntityTypeChange}
            handleNumberOfPartnersChange={handleNumberOfPartnersChange}
            handlePartnerDetailChange={handlePartnerDetailChange}
          />
        )}

        {currentStep === 2 && (
          <Step3Banking 
            formData={formData} 
            setFormData={setFormData}
            bankingMode={bankingMode} 
            setBankingMode={setBankingMode} 
            handleDocumentUpload={handleDocumentUpload}
            docParseStatus={docParseStatus}
            setAaLinkSent={setAaLinkSent} 
            setAaPhone={setAaPhone} 
            aaPhone={aaPhone} 
            aaLinkSent={aaLinkSent} 
            aaAccountNumber={aaAccountNumber}
            setAaAccountNumber={setAaAccountNumber}
            pennyDropDone={pennyDropDone} 
            setPennyDropDone={setPennyDropDone}
            handleInputChange={handleInputChange} 
            verificationCompleted={verificationCompleted} 
          />
        )}

        {currentStep === 3 && (
          <Step4Payout 
            formData={formData}
            setFormData={setFormData}
            handlePayoutSelection={handlePayoutSelection}
            handlePaymentModeSelection={handlePaymentModeSelection}
            handleSendOtp={handleSendOtp}
          />
        )}

        {currentStep === 4 && (
          <Step5ESigning 
            formData={formData} 
            setFormData={setFormData}
            handleInputChange={handleInputChange} 
          />
        )}

        <div className="form-actions mt-6 flex justify-between">
          <button className="btn btn-secondary" onClick={handleBack} disabled={isSavingSubmission}>
            {isSavingSubmission ? 'Saving...' : 'Back'}
          </button>
          <button className="btn btn-primary" onClick={currentStep === STEPS.length - 1 ? onFinalSubmit : handleNextStep} disabled={isSavingSubmission}>
            {isSavingSubmission ? 'Saving...' : currentStep === STEPS.length - 1 ? 'Submit Registration' : 'Save & Next'}
          </button>
        </div>
      </div>
      
      <VerificationModal 
        verificationModalData={verificationModalData} 
        setVerificationModalData={setVerificationModalData} 
        handleApproveAndMap={handleApproveAndMap} 
      />
    </div>
  );
};

export default Onboarding;
