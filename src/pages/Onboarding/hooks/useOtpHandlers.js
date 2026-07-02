/**
 * OTP handlers for phone, alt-phone, email, and CM consent verification.
 * Each pair has a "send" and a "verify" function.
 */
export const useOtpHandlers = (setFormData) => {

  // ── Phone OTP ──
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

  // ── Alt Phone OTP ──
  const handleSendAltPhoneOtp = () => {
    setFormData(prev => ({
      ...prev,
      showAltPhoneOtp: true,
      altPhoneOtpError: '',
      altPhoneVerified: false
    }));
  };

  const handleVerifyAltPhoneOtp = () => {
    setFormData(prev => {
      const isValid = prev.altPhoneOtp === '12345';
      return {
        ...prev,
        altPhoneVerified: isValid,
        altPhoneOtpError: isValid ? '' : 'Invalid OTP. Please use 12345.',
        showAltPhoneOtp: !isValid
      };
    });
  };

  // ── CM Consent OTP ──
  const handleSendCmConsentOtp = () => {
    setFormData(prev => ({
      ...prev,
      showCmConsentOtp: true,
      cmConsentOtpError: '',
      cmConsentVerified: false
    }));
  };

  const handleVerifyCmConsentOtp = () => {
    setFormData(prev => {
      const isValid = prev.cmConsentOtp === '12345';
      return {
        ...prev,
        cmConsentVerified: isValid,
        cmConsentOtpError: isValid ? '' : 'Invalid OTP. Please use 12345.',
        showCmConsentOtp: !isValid
      };
    });
  };

  // ── Email OTP ──
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

  return {
    handleSendPhoneOtp,
    handleVerifyPhoneOtp,
    handleSendAltPhoneOtp,
    handleVerifyAltPhoneOtp,
    handleSendCmConsentOtp,
    handleVerifyCmConsentOtp,
    handleSendEmailOtp,
    handleVerifyEmailOtp
  };
};
