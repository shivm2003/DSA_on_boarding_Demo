/**
 * Payout selection, payment mode, and send OTP for banking.
 */
export const usePayoutHandlers = (formData, setFormData) => {

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

  return {
    handlePayoutSelection,
    handlePaymentModeSelection,
    handleSendOtp
  };
};
