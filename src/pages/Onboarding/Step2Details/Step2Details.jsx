import { useState, useEffect, useCallback } from 'react';
import { INDIAN_STATES } from '../constants';

const Step2Details = ({
  formData,
  setFormData,
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
  handleNumberOfPartnersChange,
  handlePartnerDetailChange
}) => {
  const [pincodeLookupStatus, setPincodeLookupStatus] = useState('');

  // Auto-lookup state and city when pincode reaches 6 digits
  const lookupPincode = useCallback(async (pincode) => {
    if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) return;

    setPincodeLookupStatus('Looking up...');
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();

      if (data?.[0]?.Status === 'Success' && data[0].PostOffice?.length > 0) {
        const postOffice = data[0].PostOffice[0];
        setFormData(prev => ({
          ...prev,
          state: postOffice.State || prev.state,
          city: postOffice.District || prev.city
        }));
        setPincodeLookupStatus('✓ Found');
        setTimeout(() => setPincodeLookupStatus(''), 2000);
      } else {
        setPincodeLookupStatus('Pincode not found');
        setTimeout(() => setPincodeLookupStatus(''), 3000);
      }
    } catch {
      setPincodeLookupStatus('Lookup failed');
      setTimeout(() => setPincodeLookupStatus(''), 3000);
    }
  }, [setFormData]);

  // Handle pincode input change — trigger lookup when 6 digits
  const handlePincodeChange = useCallback((e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({ ...prev, pincode: value }));
    if (value.length === 6) {
      lookupPincode(value);
    }
  }, [setFormData, lookupPincode]);

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
            <input
              type="number"
              name="numberOfPartners"
              value={formData.numberOfPartners}
              onChange={handleNumberOfPartnersChange}
              disabled={verificationCompleted}
              min={formData.entityType === 'Partnership' ? 2 : 1}
              max="10"
            />
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


      </div>

      {/* GST Details Section — shown only when a GST document is uploaded for non-Individual entities */}
      {formData.entityType !== 'Individual' && formData.gstCertificateUpload && (
        <>
          <div className="section-divider mt-6"></div>
          <h3 className="section-subheading">GST Details</h3>
          <p className="text-sm text-muted mb-3">These fields are auto-populated when a GST certificate is uploaded and parsed.</p>
          <div className="form-grid">
            <div className="input-group">
              <label>Company / Vendor Name</label>
              <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.companyName} />
            </div>

            <div className="input-group">
              <label>GST Number</label>
              <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.gstNumber} style={{ textTransform: 'uppercase' }} maxLength={15} />
            </div>

            <div className="input-group full-width">
              <label>GST Address</label>
              <input type="text" name="gstAddress" value={formData.gstAddress} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.gstAddress} placeholder="Auto-filled from GST certificate" />
            </div>
          </div>
        </>
      )}

      {/* MSME Details Section — shown only when an MSME / Udyam document is uploaded */}
      {formData.udyamCertificateUpload && (
        <>
          <div className="section-divider mt-6"></div>
          <h3 className="section-subheading">MSME Details</h3>
          <p className="text-sm text-muted mb-3">These fields are auto-populated when an MSME / Udyam certificate is uploaded and parsed.</p>
          <div className="form-grid">
            <div className="input-group">
              <label>Company / Vendor Name</label>
              <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.companyName} />
            </div>
            <div className="input-group">
              <label>MSME / Udyam Number</label>
              <input type="text" name="msmeNumber" value={formData.msmeNumber || ''} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.msmeNumber} style={{ textTransform: 'uppercase' }} maxLength={20} />
            </div>
            <div className="input-group">
              <label>Date of Incorporation</label>
              <input type="date" name="dateOfInc" value={formData.dateOfInc || ''} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.dateOfInc} />
            </div>
            <div className="input-group">
              <label>Date of Commencement</label>
              <input type="date" name="dateOfCommencement" value={formData.dateOfCommencement || ''} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.dateOfCommencement} />
            </div>
          </div>
        </>
      )}

      {/* Official Address Section */}
      <div className="section-divider mt-6"></div>
      <h3 className="section-subheading">Official Address</h3>
      <div className="form-grid">
        <div className="input-group full-width">
          <label>Registered Address</label>
          <input type="text" name="registeredAddress" value={formData.registeredAddress} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.registeredAddress} />
        </div>

        <div className="input-group">
          <label>Pincode</label>
          <input
            type="text"
            name="pincode"
            value={formData.pincode}
            onChange={handlePincodeChange}
            disabled={verificationCompleted || !!formData.lockedFields?.pincode}
            maxLength={6}
            inputMode="numeric"
            placeholder="Enter 6-digit pincode"
          />
          {pincodeLookupStatus && (
            <p className={`text-sm mt-1 ${pincodeLookupStatus.startsWith('✓') ? 'text-success' : 'text-muted'}`}>
              {pincodeLookupStatus}
            </p>
          )}
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

      </div>

      {/* Serving State Section */}
      <div className="section-divider mt-6"></div>
      <h3 className="section-subheading">Serving State</h3>
      <div className="form-grid">
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
          <label>Serving Branch</label>
          <input type="text" name="serviceBranch" value={formData.serviceBranch} onChange={handleInputChange} disabled={verificationCompleted} placeholder="Enter serving branch" />
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
      {formData.entityType === 'Individual' ? (
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
          <div className="input-group full-width">
            <label>Address</label>
            <input type="text" name="personalAddress" value={formData.personalAddress} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.personalAddress} placeholder="Personal address" />
          </div>
        </div>
      ) : (
        <>
          {formData.partnerDetails.map((partner, index) => (
            <div key={index} className="partner-section mb-6 p-4 rounded bg-dark" style={{ border: '1px solid var(--border-color)' }}>
              <h4 className="text-md font-semibold mb-4 text-primary">
                {formData.entityType === 'Private/Public Ltd Company' ? `Director ${index + 1} Details` : `Partner ${index + 1} Details`}
              </h4>
              <div className="form-grid">
                <div className="input-group">
                  <label>Full Name</label>
                  <input type="text" value={partner.fullName || ''} onChange={(e) => handlePartnerDetailChange(index, 'fullName', e.target.value)} disabled={verificationCompleted} />
                </div>
                <div className="input-group">
                  <label>Father's Name</label>
                  <input type="text" value={partner.fatherName || ''} onChange={(e) => handlePartnerDetailChange(index, 'fatherName', e.target.value)} disabled={verificationCompleted} />
                </div>
                <div className="input-group">
                  <label>Date of Birth</label>
                  <input type="date" value={partner.dob || ''} onChange={(e) => handlePartnerDetailChange(index, 'dob', e.target.value)} disabled={verificationCompleted} />
                </div>
                <div className="input-group">
                  <label>Designation</label>
                  <input type="text" value={partner.designation || ''} onChange={(e) => handlePartnerDetailChange(index, 'designation', e.target.value)} disabled={verificationCompleted} />
                </div>
                <div className="input-group full-width">
                  <label>Address</label>
                  <input type="text" value={partner.personalAddress || ''} onChange={(e) => handlePartnerDetailChange(index, 'personalAddress', e.target.value)} disabled={verificationCompleted} placeholder="Personal address" />
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {/* KYC & Additional Details */}
      <div className="section-divider mt-6"></div>
      <h3 className="section-subheading">KYC & Additional Details</h3>
      <div className="form-grid">
        {formData.entityType !== 'Individual' && (
          <div className="input-group">
            <label>Company PAN</label>
            <input type="text" name="companyPan" value={formData.companyPan} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.companyPan} style={{ textTransform: 'uppercase' }} maxLength={10} />
          </div>
        )}

        <div className="input-group">
          <label>Individual PAN</label>
          <input type="text" name="individualPan" value={formData.individualPan} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.individualPan} style={{ textTransform: 'uppercase' }} maxLength={10} />
        </div>

        <div className="input-group">
          <label>Aadhaar Number</label>
          <input type="text" name="aadharNumber" value={formData.aadharNumber} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.aadharNumber} maxLength={14} />
        </div>

        <div className="input-group">
          <label>KYC Document Type</label>
          <input type="text" name="kycDocumentType" value={formData.kycDocumentType || ''} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.kycDocumentType} />
        </div>

        <div className="input-group">
          <label>KYC Document Number</label>
          <input type="text" name="kycDocumentNumber" value={formData.kycDocumentNumber || ''} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.kycDocumentNumber} />
        </div>



        {/* MSME Registered and Key Clients fields removed per request */}
      </div>

      {/* Reference Details Section — All Entity Types */}
      <div className="section-divider mt-6"></div>
      <h3 className="section-subheading">Reference Details</h3>
      <p className="text-sm text-muted mb-3">Provide 2 reference details for verification purposes.</p>

      {/* Reference 1 */}
      <h4 style={{ marginBottom: '0.75rem', fontSize: '0.95rem', fontWeight: 600, color: 'var(--primary-color)' }}>Reference 1</h4>
      <div className="form-grid">
        <div className="input-group">
          <label>Name</label>
          <input type="text" name="ref1Name" value={formData.ref1Name} onChange={handleInputChange} disabled={verificationCompleted} placeholder="Reference person name" />
        </div>
        <div className="input-group">
          <label>Mobile Number</label>
          <input type="tel" name="ref1Mobile" value={formData.ref1Mobile} onChange={handleInputChange} disabled={verificationCompleted} inputMode="numeric" pattern="[0-9]*" maxLength={10} placeholder="10-digit mobile" />
        </div>
        <div className="input-group full-width">
          <label>Address</label>
          <input type="text" name="ref1Address" value={formData.ref1Address} onChange={handleInputChange} disabled={verificationCompleted} placeholder="Full address" />
        </div>
        <div className="input-group">
          <label>Pincode</label>
          <input type="text" name="ref1Pincode" value={formData.ref1Pincode} onChange={handleInputChange} disabled={verificationCompleted} maxLength={6} placeholder="6-digit pincode" />
        </div>
      </div>

      {/* Reference 2 */}
      <h4 style={{ marginBottom: '0.75rem', marginTop: '1.5rem', fontSize: '0.95rem', fontWeight: 600, color: 'var(--primary-color)' }}>Reference 2</h4>
      <div className="form-grid">
        <div className="input-group">
          <label>Name</label>
          <input type="text" name="ref2Name" value={formData.ref2Name} onChange={handleInputChange} disabled={verificationCompleted} placeholder="Reference person name" />
        </div>
        <div className="input-group">
          <label>Mobile Number</label>
          <input type="tel" name="ref2Mobile" value={formData.ref2Mobile} onChange={handleInputChange} disabled={verificationCompleted} inputMode="numeric" pattern="[0-9]*" maxLength={10} placeholder="10-digit mobile" />
        </div>
        <div className="input-group full-width">
          <label>Address</label>
          <input type="text" name="ref2Address" value={formData.ref2Address} onChange={handleInputChange} disabled={verificationCompleted} placeholder="Full address" />
        </div>
        <div className="input-group">
          <label>Pincode</label>
          <input type="text" name="ref2Pincode" value={formData.ref2Pincode} onChange={handleInputChange} disabled={verificationCompleted} maxLength={6} placeholder="6-digit pincode" />
        </div>
      </div>

      {/* SPOC Details Section — All Entity Types, auto-filled from logged-in user */}
      <div className="section-divider mt-6"></div>
      <h3 className="section-subheading">SPOC Details</h3>
      <p className="text-sm text-muted mb-3">Auto-filled from the logged-in user profile.</p>
      <div className="form-grid">
        <div className="input-group">
          <label>Name</label>
          <input type="text" name="spocName" value={formData.spocName} disabled style={{ background: 'var(--bg-color)', cursor: 'not-allowed' }} />
        </div>
        <div className="input-group">
          <label>Employee Code</label>
          <input type="text" name="spocEmployeeCode" value={formData.spocEmployeeCode} disabled style={{ background: 'var(--bg-color)', cursor: 'not-allowed' }} />
        </div>
        <div className="input-group">
          <label>Date</label>
          <input type="text" name="spocDate" value={formData.spocDate} disabled style={{ background: 'var(--bg-color)', cursor: 'not-allowed' }} placeholder="dd-mm-yyyy" />
        </div>
      </div>
    </div>
  );
};

export default Step2Details;
