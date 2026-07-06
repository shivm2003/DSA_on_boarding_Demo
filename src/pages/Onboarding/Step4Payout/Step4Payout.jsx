import React from 'react';
import QRCodeDisplay from '../QRCodeDisplay/QRCodeDisplay';

const Step4Payout = ({ formData, setFormData, handlePayoutSelection, handlePaymentModeSelection }) => {
  return (
    <div className="step-content animate-fade-in payout-stamp-section">
      <h2 className="payout-title">Payout & Stamp Selection</h2>
      <div className="payout-divider"></div>

      {/* Payout Options */}
      <div className="payout-cards-row">
        <div
          className={`payout-card-new ${formData.payoutOption === 'A' ? 'selected' : ''}`}
          onClick={() => handlePayoutSelection('A')}
        >
          <div className="payout-card-header">
            <span className="recommended-badge">RECOMMENDED</span>
          </div>
          <h3 className="payout-card-title">Standard Payout (A)</h3>
          <div className="payout-card-rate">1.50%</div>
          <p className="payout-card-desc">Standard onboarding rate as per BRE.</p>
        </div>

        <div
          className={`payout-card-new ${formData.payoutOption === 'B' ? 'selected' : ''}`}
          onClick={() => handlePayoutSelection('B')}
        >
          <div className="payout-card-header" style={{ height: '24px' }}></div>
          <h3 className="payout-card-title">Premium Payout (B)</h3>
          <div className="payout-card-rate">1.75%</div>
          <p className="payout-card-desc">Requires Business Head Approval.</p>
        </div>
      </div>

      {/* Stamp Duty Collection */}
      <h3 className="payout-subtitle">Stamp Duty Collection</h3>
      <div className="payout-divider dotted"></div>
      
      <div className="stamp-duty-container">
        <label className="stamp-duty-label">Select State</label>
        <select 
          className="stamp-duty-select"
          value={formData.stampDutyState || 'delhi'}
          onChange={(e) => setFormData(prev => ({ ...prev, stampDutyState: e.target.value }))}
        >
          <option value="delhi">Delhi (Rs. 500/-)</option>
          <option value="maharashtra">Maharashtra (Rs. 600/-)</option>
          <option value="karnataka">Karnataka (Rs. 400/-)</option>
        </select>
      </div>

      {/* Payment Mode */}
      <h3 className="payout-subtitle">Payment Mode</h3>
      <div className="payout-divider dotted"></div>
      <div className="payout-cards-row">
        <div
          className={`payment-mode-card-new ${formData.paymentMode === 'qr' ? 'selected' : ''}`}
          onClick={() => handlePaymentModeSelection('qr')}
        >
          <h4 className="payment-mode-title">QR Scan</h4>
          <p className="payment-mode-desc">Scan the QR code to complete the payment</p>
        </div>

        <div
          className={`payment-mode-card-new ${formData.paymentMode === 'sms' ? 'selected' : ''}`}
          onClick={() => handlePaymentModeSelection('sms')}
        >
          <h4 className="payment-mode-title">Pay via SMS</h4>
          <p className="payment-mode-desc">Receive payment prompt on your registered mobile number</p>
        </div>
      </div>

      {/* Show QR Code when QR Scan is selected */}
      {formData.paymentMode === 'qr' && (
        <QRCodeDisplay email={formData.email} />
      )}

    </div>
  );
};

export default Step4Payout;
