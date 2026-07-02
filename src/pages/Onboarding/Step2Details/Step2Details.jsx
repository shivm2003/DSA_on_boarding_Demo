import React from 'react';
import { INDIAN_STATES } from '../constants';

const Step2Details = ({
  formData,
  isVerificationLocked,
  verificationCompleted,
  handleInputChange,
  handleSendPhoneOtp,
  handleVerifyPhoneOtp,
  handleSendAltPhoneOtp,
  handleVerifyAltPhoneOtp,
  handleSendEmailOtp,
  handleVerifyEmailOtp,
  handleMultiSelectChange,
  removeSelectedState,
  handleEntityTypeChange,
  handleNumberOfPartnersChange
}) => {
  return (
    <div className={`step-content animate-fade-in${isVerificationLocked ? ' locked-step' : ''}`} inert={isVerificationLocked ? "" : undefined}>
      {isVerificationLocked && (
        <div className="locked-overlay">Verification complete. Pages 1–4 are read-only after verification.</div>
      )}
      
      {/* Company / Vendor Details Section */}
      <h3 className="section-subheading">Company / Vendor Details</h3>
      <div className="form-grid">
        <div className="input-group">
          <label>Company / Vendor Name</label>
          <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.companyName} />
        </div>


        {(formData.entityType === 'Partnership' || formData.entityType === 'Private/Public Ltd Company') && (
          <div className="input-group">
            <label>Number of Partners/Directors</label>
            <input type="number" name="numberOfPartners" value={formData.numberOfPartners} onChange={handleNumberOfPartnersChange} disabled={verificationCompleted} min="1" max="10" />
            {formData.partnerCountError && <p className="text-error text-sm mt-1">{formData.partnerCountError}</p>}
          </div>
        )}

        <div className="input-group">
          <label>Date of Incorporation / DOB</label>
          <input
            type="date"
            name="dateOfInc"
            value={formData.dateOfInc}
            onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.dateOfInc}
          />
        </div>

        <div className="input-group">
          <label>Class of Activity</label>
          <input type="text" name="classOfActivity" value={formData.classOfActivity} onChange={handleInputChange} disabled={verificationCompleted} />
        </div>


      </div>

      {/* Address Details Section */}
      <div className="section-divider mt-6"></div>
      <h3 className="section-subheading">Address Details</h3>
      <div className="form-grid">
        <div className="input-group full-width">
          <label>Registered Address</label>
          <input type="text" name="registeredAddress" value={formData.registeredAddress} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.registeredAddress} />
        </div>

        <div className="input-group">
          <label>State</label>
          <select name="state" value={formData.state} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.state}>
            <option value="">Select State</option>
            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="input-group">
          <label>City</label>
          <input type="text" name="city" value={formData.city} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.city} />
        </div>

        <div className="input-group">
          <label>Pincode</label>
          <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.pincode} maxLength={6} />
        </div>

        <div className="input-group">
          <label>Service Locations</label>
          <input type="text" name="serviceLocations" value={formData.serviceLocations} onChange={handleInputChange} disabled={verificationCompleted} placeholder="E.g., North India" />
        </div>

        <div className="input-group">
          <label>Service States</label>
          <select name="serviceState" multiple value={formData.serviceState || []} onChange={handleMultiSelectChange} disabled={verificationCompleted} style={{ height: '100px' }}>
            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {formData.serviceState && formData.serviceState.length > 0 && (
            <div className="selected-states mt-2 flex flex-wrap gap-2">
              {formData.serviceState.map(s => (
                <span key={s} className="badge badge-secondary flex items-center gap-1">
                  {s}
                  {!verificationCompleted && (
                    <button type="button" onClick={() => removeSelectedState(s)} style={{ background: 'none', border: 'none', color: 'currentColor', cursor: 'pointer', padding: 0 }}>&times;</button>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="input-group">
          <label>Service City</label>
          <input type="text" name="serviceCity" value={formData.serviceCity} onChange={handleInputChange} disabled={verificationCompleted} />
        </div>


      </div>

      {/* Contact Details & Verification */}
      <div className="section-divider mt-6"></div>
      <h3 className="section-subheading">Contact Details & Verification</h3>
      <div className="form-grid">
        <div className="input-group">
          <label>Email Address</label>
          <div className="input-with-button">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.email}
              placeholder="Enter email address"
            />
            <button type="button" className="btn btn-secondary" onClick={handleSendEmailOtp} disabled={!formData.email || formData.emailVerified}>
              {formData.emailVerified ? 'Verified' : 'Verify Email'}
            </button>
          </div>
          {formData.showEmailOtp && !formData.emailVerified && (
            <div className="otp-row">
              <input type="text" name="emailOtp" value={formData.emailOtp} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.emailOtp} placeholder="Enter OTP" />
              <button type="button" className="btn btn-primary" onClick={handleVerifyEmailOtp}>Verify OTP</button>
            </div>
          )}
          {formData.emailOtpError && <p className="text-error text-sm">{formData.emailOtpError}</p>}
          {formData.emailVerified && <p className="text-success text-sm">Email verified successfully.</p>}
        </div>

        <div className="input-group">
          <label>Primary Phone Number</label>
          <div className="input-with-button">
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.phone}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              placeholder="10-digit mobile"
            />
            <button type="button" className="btn btn-secondary" onClick={handleSendPhoneOtp} disabled={!formData.phone || formData.phoneVerified}>
              {formData.phoneVerified ? 'Verified' : 'Verify Phone'}
            </button>
          </div>
          {formData.showPhoneOtp && !formData.phoneVerified && (
            <div className="otp-row">
              <input type="text" name="phoneOtp" value={formData.phoneOtp} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.phoneOtp} placeholder="Enter OTP" />
              <button type="button" className="btn btn-primary" onClick={handleVerifyPhoneOtp}>Verify OTP</button>
            </div>
          )}
          {formData.phoneOtpError && <p className="text-error text-sm">{formData.phoneOtpError}</p>}
          {formData.phoneVerified && <p className="text-success text-sm">Phone verified successfully.</p>}
        </div>
        
        <div className="input-group">
          <label>Alternate Contact Number</label>
          <div className="input-with-button">
            <input
              type="tel"
              name="altContactNumber"
              value={formData.altContactNumber}
              onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.altContactNumber}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              placeholder="10-digit mobile"
            />
            <button type="button" className="btn btn-secondary" onClick={handleSendAltPhoneOtp} disabled={!formData.altContactNumber || formData.altPhoneVerified}>
              {formData.altPhoneVerified ? 'Verified' : 'Verify Alt Phone'}
            </button>
          </div>
          {formData.showAltPhoneOtp && !formData.altPhoneVerified && (
            <div className="otp-row">
              <input type="text" name="altPhoneOtp" value={formData.altPhoneOtp} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.altPhoneOtp} placeholder="Enter OTP" />
              <button type="button" className="btn btn-primary" onClick={handleVerifyAltPhoneOtp}>Verify OTP</button>
            </div>
          )}
          {formData.altPhoneOtpError && <p className="text-error text-sm">{formData.altPhoneOtpError}</p>}
          {formData.altPhoneVerified && <p className="text-success text-sm">Alternate phone verified successfully.</p>}
        </div>
      </div>

      {/* Personal / Key Person Details Section */}
      <div className="section-divider mt-6"></div>
      <h3 className="section-subheading">Personal / Key Person Details</h3>
      <div className="form-grid">
        <div className="input-group">
          <label>Full Name</label>
          <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.fullName} />
        </div>

        <div className="input-group">
          <label>Father's Name</label>
          <input type="text" name="fatherName" value={formData.fatherName} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.fatherName} />
        </div>

        <div className="input-group">
          <label>Date of Birth</label>
          <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.dob} />
        </div>

        <div className="input-group">
          <label>Designation</label>
          <input type="text" name="designation" value={formData.designation} onChange={handleInputChange} disabled={verificationCompleted} />
        </div>

        <div className="input-group">
          <label>Personal Mobile</label>
          <input type="tel" name="personalMobile" value={formData.personalMobile} onChange={handleInputChange} disabled={verificationCompleted} maxLength={10} />
        </div>
      </div>

      {/* KYC & Additional Details */}
      <div className="section-divider mt-6"></div>
      <h3 className="section-subheading">KYC & Additional Details</h3>
      <div className="form-grid">
        <div className="input-group">
          <label>Company PAN</label>
          <input type="text" name="companyPan" value={formData.companyPan} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.companyPan} style={{ textTransform: 'uppercase' }} maxLength={10} />
        </div>

        <div className="input-group">
          <label>Individual PAN</label>
          <input type="text" name="individualPan" value={formData.individualPan} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.individualPan} style={{ textTransform: 'uppercase' }} maxLength={10} />
        </div>

        <div className="input-group">
          <label>Aadhaar Number</label>
          <input type="text" name="aadharNumber" value={formData.aadharNumber} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.aadharNumber} maxLength={12} />
        </div>

        <div className="input-group">
          <label>GST Number</label>
          <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.gstNumber} style={{ textTransform: 'uppercase' }} maxLength={15} />
        </div>

        <div className="input-group">
          <label>MSME Registered</label>
          <select name="msmeRegistered" value={formData.msmeRegistered} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.msmeRegistered}>
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>

        {(formData.msmeRegistered === 'Yes' || formData.msmeRegistered === true) && (
          <div className="input-group">
            <label>MSME / Udyam Number</label>
            <input type="text" name="msmeNumber" value={formData.msmeNumber} onChange={handleInputChange} disabled={verificationCompleted} />
          </div>
        )}

        <div className="input-group full-width">
          <label>Key Clients</label>
          <input type="text" name="keyClients" value={formData.keyClients} onChange={handleInputChange} disabled={verificationCompleted} placeholder="E.g., Client A, Client B" />
        </div>
      </div>
    </div>
  );
};

export default Step2Details;
