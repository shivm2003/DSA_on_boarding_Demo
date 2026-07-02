const fs = require('fs');

const content = fs.readFileSync('d:/Development/DSA/src/pages/Onboarding/Onboarding.jsx', 'utf-8');

const startIdx = content.indexOf('const Onboarding = () => {');
const returnIdx = content.indexOf('  return (\n    <div className="onboarding-page">');

if (startIdx === -1 || returnIdx === -1) {
  console.error("Could not find boundaries");
  process.exit(1);
}

const body = content.substring(startIdx + 'const Onboarding = () => {'.length, returnIdx);

// Extract state variables
const stateVars = [];
const stateRegex = /const \[(\w+),\s*set\w+\]\s*=\s*useState/g;
let match;
while ((match = stateRegex.exec(body)) !== null) {
  stateVars.push(match[1]);
  // also add the setter
  const setterName = 'set' + match[1].charAt(0).toUpperCase() + match[1].slice(1);
  stateVars.push(setterName);
}

// Extract functions
const funcVars = [];
const funcRegex = /const (\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g;
while ((match = funcRegex.exec(body)) !== null) {
  funcVars.push(match[1]);
}

// Extract any other variables (like FIELD_DOC_TYPE_MAP)
const otherVars = ['FIELD_DOC_TYPE_MAP', 'requiredDocs'];

const allExports = [...new Set([...stateVars, ...funcVars, ...otherVars])];

// Clean up body (remove dead code renderUploadField)
const renderUploadStart = body.indexOf('const renderUploadField =');
let cleanBody = body;
if (renderUploadStart !== -1) {
    const renderUploadEnd = body.indexOf('};', renderUploadStart) + 2;
    cleanBody = body.substring(0, renderUploadStart) + body.substring(renderUploadEnd);
}

// Also, the mock functions are to be removed!
const mocksToRemove = [
  'simulateCompanyBankingExtraction',
  'simulatePartnerBankingExtraction',
  'simulateCompanyOCRExtraction',
  'simulatePartnerOCRExtraction',
  'simulateVerificationRun'
];

let finalBody = cleanBody;
for (const mock of mocksToRemove) {
    const mockStart = finalBody.indexOf(`const ${mock} =`);
    if (mockStart !== -1) {
        // find matching end
        let braceCount = 0;
        let mockEnd = -1;
        let started = false;
        for (let i = mockStart; i < finalBody.length; i++) {
            if (finalBody[i] === '{') { braceCount++; started = true; }
            if (finalBody[i] === '}') { 
                braceCount--; 
                if (started && braceCount === 0) {
                    mockEnd = i + 1;
                    // handle trailing semicolon if present
                    if (finalBody[mockEnd] === ';') mockEnd++;
                    break;
                }
            }
        }
        if (mockEnd !== -1) {
            finalBody = finalBody.substring(0, mockStart) + finalBody.substring(mockEnd);
        }
    }
}

// Remove them from exports
const finalExports = allExports.filter(e => !mocksToRemove.includes(e) && e !== 'renderUploadField');


const hookFileContent = `import { useState, useEffect, useRef } from 'react';
import { STEPS, DOCUMENT_MATRIX, BASE_DOCS, ENTITY_ADDITIONAL_DOCS, INDIAN_STATES } from './constants';
import { initPartnerDetail, initPartnerBank, initPartnerOcr, initPartnerUpload, initPartnerOcrStatus, initPartnerOcrOutput, adjustPartnerArrays, adjustPartnerStatusArray, adjustStatusArray, normalizePhoneValue, normalizeDateValue, serializeFileField, serializePartnerUpload, serializePartnerOcrDetail } from './helpers';

export const useOnboarding = () => {
${finalBody}

  return {
    ${finalExports.join(',\n    ')}
  };
};
`;

fs.writeFileSync('d:/Development/DSA/src/pages/Onboarding/hooks/useOnboarding.js', hookFileContent, 'utf-8');
console.log('Created hooks/useOnboarding.js successfully.');

// Now create the new Onboarding.jsx
const newOnboardingContent = `import React from 'react';
import { Loader2, CheckCircle, FileText, Smartphone } from 'lucide-react';
import './Onboarding.css';
import { STEPS, VENDOR_CATEGORIES, DOCUMENT_MATRIX, BASE_DOCS, ENTITY_ADDITIONAL_DOCS, INDIAN_STATES } from './constants';
import QRCodeDisplay from './QRCodeDisplay/QRCodeDisplay';
import ProgressStepper from './ProgressStepper/ProgressStepper';
import VerificationModal from './VerificationModal/VerificationModal';
import Step1Documents from './Step1Documents/Step1Documents';
import Step2Details from './Step2Details/Step2Details';
import Step3Banking from './Step3Banking/Step3Banking';
import Step4Payout from './Step4Payout/Step4Payout';
import Step5ESigning from './Step5ESigning/Step5ESigning';
import { useOnboarding } from './hooks/useOnboarding';

const Onboarding = () => {
  const {
    currentStep, formData, setFormData, isVerificationLocked, docParseStatus, handleDocumentUpload,
    extractionStatus, handlePartnerDocumentUpload, verificationCompleted, addPartner,
    handleInputChange, handleSendPhoneOtp, handleVerifyPhoneOtp, handleSendAltPhoneOtp, handleVerifyAltPhoneOtp,
    handleSendEmailOtp, handleVerifyEmailOtp, handleMultiSelectChange, removeSelectedState,
    handleEntityTypeChange, handleNumberOfPartnersChange, bankingMode, setBankingMode,
    setManualBankParsing, setAaLinkSent, setAaPhone, aaPhone, aaLinkSent, aaAccountNumber,
    setAaAccountNumber, pennyDropDone, setPennyDropDone, manualBankParsing, handlePayoutSelection,
    prevStep, nextStep, handleFinalSubmit, verificationModalData, setVerificationModalData,
    handleApproveAndMap, renderVerificationTag, renderOcrOutputBox
  } = useOnboarding();

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
            handleEntityTypeChange={handleEntityTypeChange} 
            isVerificationLocked={isVerificationLocked} 
            docParseStatus={docParseStatus} 
            handleDocumentUpload={handleDocumentUpload} 
            extractionStatus={extractionStatus} 
            renderVerificationTag={renderVerificationTag} 
            renderOcrOutputBox={renderOcrOutputBox} 
            handlePartnerDocumentUpload={handlePartnerDocumentUpload} 
            verificationCompleted={verificationCompleted} 
            addPartner={addPartner} 
          />
        )}
        
        {currentStep === 1 && (
          <Step2Details 
            formData={formData} 
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
          />
        )}

        {currentStep === 2 && (
          <Step3Banking 
            formData={formData} 
            setFormData={setFormData}
            bankingMode={bankingMode} 
            setBankingMode={setBankingMode} 
            setManualBankParsing={setManualBankParsing} 
            setAaLinkSent={setAaLinkSent} 
            setAaPhone={setAaPhone} 
            aaPhone={aaPhone} 
            aaLinkSent={aaLinkSent} 
            aaAccountNumber={aaAccountNumber}
            setAaAccountNumber={setAaAccountNumber}
            pennyDropDone={pennyDropDone} 
            setPennyDropDone={setPennyDropDone}
            manualBankParsing={manualBankParsing} 
            handleInputChange={handleInputChange} 
            verificationCompleted={verificationCompleted} 
          />
        )}

        {currentStep === 3 && (
          <Step4Payout 
            formData={formData} 
            handlePayoutSelection={handlePayoutSelection} 
          />
        )}

        {currentStep === 4 && (
          <Step5ESigning 
            formData={formData} 
            handleInputChange={handleInputChange} 
          />
        )}

        <div className="form-actions mt-6 flex justify-between">
          <button className="btn btn-secondary" onClick={prevStep} disabled={currentStep === 0}>
            Back
          </button>
          <button className="btn btn-primary" onClick={currentStep === STEPS.length - 1 ? handleFinalSubmit : nextStep}>
            {currentStep === STEPS.length - 1 ? 'Submit Registration' : 'Save & Next'}
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
`;

fs.writeFileSync('d:/Development/DSA/src/pages/Onboarding/Onboarding.jsx', newOnboardingContent, 'utf-8');
console.log('Replaced Onboarding.jsx successfully.');
