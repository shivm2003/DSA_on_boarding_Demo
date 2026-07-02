import React, { useState } from 'react';
import { Smartphone } from 'lucide-react';

const Step5ESigning = ({ formData, handleInputChange }) => {
  const [phoneValue, setPhoneValue] = useState(formData.phone || '9876543210');

  const handlePhoneChange = (e) => {
    setPhoneValue(e.target.value.replace(/\D/g, '').slice(0, 10));
  };

  return (
    <div className="step-content animate-fade-in esign-section">
      <h2 className="esign-title">E-Signing & Submission</h2>
      <div className="esign-divider"></div>

      <div className="esign-card">
        <div className="esign-card-header">
          <div className="status-indicator"></div>
          <div className="esign-card-titles">
            <h3>Agreement Generation</h3>
            <p>The Agreement is ready for e-signing via Leegality.</p>
          </div>
        </div>
        
        <div className="esign-card-inner-divider"></div>
        
        <div className="esign-input-section">
          <label className="esign-label">Mobile Number for E-Sign Link</label>
          <input 
            type="tel" 
            className="esign-input" 
            value={phoneValue}
            onChange={handlePhoneChange}
            maxLength={10}
          />
          <button className="btn btn-primary esign-btn" onClick={() => alert('E-Sign link sent to ' + phoneValue)}>
            <Smartphone size={16} />
            Send E-Sign Link
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step5ESigning;
