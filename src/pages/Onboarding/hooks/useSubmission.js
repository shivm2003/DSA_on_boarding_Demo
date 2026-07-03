import { useRef, useState } from 'react';
import { serializeFileField, serializePartnerUpload, serializePartnerOcrDetail } from '../helpers';

/**
 * Handles the construction of the final submission payload and the API call.
 */
export const useSubmission = (formData, verificationStatus) => {
  const draftSubmissionIdRef = useRef(null);
  const hasCreatedSubmissionRef = useRef(false);
  const [isSavingSubmission, setIsSavingSubmission] = useState(false);

  const setSubmissionId = (submissionId) => {
    draftSubmissionIdRef.current = submissionId || null;
    hasCreatedSubmissionRef.current = Boolean(submissionId);
  };

  const serializeAnyValue = (value) => {
    if (value instanceof File) {
      return {
        name: value.name,
        size: value.size,
        type: value.type,
        lastModified: value.lastModified
      };
    }
    if (Array.isArray(value)) {
      return value.map(serializeAnyValue);
    }
    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, serializeAnyValue(item)])
      );
    }
    return value;
  };

  const buildSubmissionData = (data) => ({
    documentUploads: {
      panUpload: serializeFileField(data.panUpload),
      idProofUpload: serializeFileField(data.idProofUpload),
      addressProofUpload: serializeFileField(data.addressProofUpload),
      gstCertificateUpload: serializeFileField(data.gstCertificateUpload),
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
      kycDocumentType: data.kycDocumentType || '',
      kycDocumentNumber: data.kycDocumentNumber || '',
      gstNumber: data.gstNumber || '',
      msmeRegistered: data.msmeRegistered === true || data.msmeRegistered === 'Yes',
      msmeNumber: data.msmeNumber || '',
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
    consents: {
      esignConsent: data.esignConsent || false,
      channelManagerConsent: data.cmConsent || false
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
    partnerUploads: Array.isArray(data.partnerUploads) ? data.partnerUploads.map(serializePartnerUpload) : [],
    parsedDocuments: serializeAnyValue(data.parsedDocuments || {}),
    allFields: serializeAnyValue(data)
  });

  const saveSubmission = async ({ step = 'Review', status = 'Draft', successMessage = 'Submission saved.' } = {}) => {
    const submission = {
      ...(draftSubmissionIdRef.current ? { id: draftSubmissionIdRef.current, dsaCode: draftSubmissionIdRef.current } : {}),
      name: formData.companyName || formData.fullName || 'Unknown',
      date: new Date().toLocaleDateString('en-GB'),
      status,
      step,
      progress: step === 'Review' ? 100 : undefined,
      data: buildSubmissionData(formData),
      verificationStatus
    };

    try {
      setIsSavingSubmission(true);
      const token = sessionStorage.getItem('token');
      const url = hasCreatedSubmissionRef.current
        ? `http://localhost:5000/api/submissions/${draftSubmissionIdRef.current}`
        : 'http://localhost:5000/api/submissions';
      const response = await fetch(url, {
        method: hasCreatedSubmissionRef.current ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submission)
      });
      if (response.ok) {
        const savedSubmission = await response.json();
        if (savedSubmission?.id) {
          draftSubmissionIdRef.current = savedSubmission.id;
        }
        hasCreatedSubmissionRef.current = true;
        alert(successMessage);
        return true;
      } else {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to save submission');
      }
    } catch (err) {
      console.error('Failed to save submission', err);
      alert('Failed to save submission to backend database.');
      return false;
    } finally {
      setIsSavingSubmission(false);
    }
  };

  const handleFinalSubmit = () => saveSubmission({
    step: 'Review',
    status: 'Completed',
    successMessage: 'Application submitted successfully and marked Completed.'
  });

  const handleSaveDraft = (options = {}) => saveSubmission({
    step: options.step || 'Draft',
    status: options.status || 'Draft',
    successMessage: options.successMessage || 'Onboarding saved as draft.'
  });

  return {
    setSubmissionId,
    handleFinalSubmit,
    handleSaveDraft,
    isSavingSubmission
  };
};
