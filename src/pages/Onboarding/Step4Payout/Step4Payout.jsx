import React from 'react';
import { Check, Info } from 'lucide-react';
import QRCodeDisplay from '../QRCodeDisplay/QRCodeDisplay';

const Step4Payout = ({ formData, setFormData, handlePayoutSelection, handlePaymentModeSelection }) => {
  return (
    <div className="step-content animate-fade-in payout-stamp-section">
      <h2 className="payout-title">Payout & Stamp Selection</h2>
      <div className="payout-divider"></div>

      {/* Payout Options */}
      <div className="payout-cards-row">
        {/* 0.50% Standard */}
        <div
          className={`payout-card-new ${formData.payoutOption === '0.50' ? 'selected' : ''}`}
          onClick={() => handlePayoutSelection('0.50')}
        >
          <div className="payout-card-header">
            <div className="payout-card-rate-group">
              <div className="radio-circle">
                {formData.payoutOption === '0.50' && <div className="radio-inner" />}
              </div>
              <div className="payout-card-rate">0.50%</div>
              <span className="badge-standard">STANDARD</span>
            </div>
          </div>
          <ul className="payout-features">
            <li><Check size={14} className="check-icon" /> Standard payout rate</li>
            <li><Check size={14} className="check-icon" /> No additional approval required</li>
          </ul>
        </div>

        {/* 0.75% Standard */}
        <div
          className={`payout-card-new ${formData.payoutOption === '0.75' ? 'selected' : ''}`}
          onClick={() => handlePayoutSelection('0.75')}
        >
          <div className="payout-card-header">
            <div className="payout-card-rate-group">
              <div className="radio-circle">
                {formData.payoutOption === '0.75' && <div className="radio-inner" />}
              </div>
              <div className="payout-card-rate">0.75%</div>
              <span className="badge-standard">STANDARD</span>
            </div>
          </div>
          <ul className="payout-features">
            <li><Check size={14} className="check-icon" /> Standard payout rate</li>
            <li><Check size={14} className="check-icon" /> No additional approval required</li>
          </ul>
        </div>

        {/* Above 0.75% Requires Approval */}
        <div
          className={`payout-card-new ${formData.payoutOption === 'above' ? 'selected' : ''}`}
          onClick={() => handlePayoutSelection('above')}
        >
          <div className="payout-card-header">
            <div className="payout-card-rate-group">
              <div className="radio-circle">
                {formData.payoutOption === 'above' && <div className="radio-inner" />}
              </div>
              <div className="payout-card-rate">Above 0.75%</div>
              <span className="badge-approval">REQUIRES APPROVAL</span>
            </div>
          </div>
          <ul className="payout-features">
            <li><Check size={14} className="check-icon" /> Higher payout rates</li>
            <li><Check size={14} className="check-icon" /> Subject to Business Head approval</li>
          </ul>
        </div>
      </div>

      {formData.payoutOption === 'above' && (
        <div className="payout-approval-upload mt-4 p-4 border rounded bg-white">
          <label className="block mb-2 font-semibold">Upload Business Head Approval <span className="text-error">*</span></label>
          <input
            type="file"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setFormData(prev => ({ ...prev, payoutApprovalUpload: e.target.files[0] }));
              }
            }}
            className="w-full"
            accept=".pdf,.png,.jpg,.jpeg"
          />
          {formData.payoutApprovalUpload && (
            <p className="text-sm text-success mt-2">✓ Uploaded: {formData.payoutApprovalUpload.name}</p>
          )}
        </div>
      )}

      <div className="payout-info-banner mt-4">
        <Info size={16} className="info-icon" />
        <span>Higher payout rates above 0.75% are subject to Business Head approval.</span>
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
