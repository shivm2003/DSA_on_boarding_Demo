import { useState, useEffect, useCallback, useRef } from 'react';
import { INDIAN_STATES } from '../constants';

const Step2Details = ({
  formData,
  setFormData,
  isVerificationLocked,
  verificationCompleted,
  handleInputChange,
  handleSendPhoneOtp,
  handleVerifyPhoneOtp,
  handleSendEmailOtp,
  handleVerifyEmailOtp,
  removeSelectedState,
  handleNumberOfPartnersChange,
  handlePartnerDetailChange
}) => {
  const [pincodeLookupStatus, setPincodeLookupStatus] = useState({ main: '', ref1: '', ref2: '' });
  const lastLookedUpRef = useRef({ main: '', ref1: '', ref2: '' });
  const [dbStates, setDbStates] = useState([]);
  const [dbBranches, setDbBranches] = useState([]);
  const [hasBranchState, setHasBranchState] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user') || '{}');
    const storedBranchName = storedUser.branch_name?.trim() || storedUser.branchName?.trim();
    const token = sessionStorage.getItem('token');

    const fetchBranchStates = (branchName) => {
      fetch(`http://localhost:5000/api/branches?branch_name=${encodeURIComponent(branchName)}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'Success' && Array.isArray(data.data)) {
            const stateValues = Array.from(new Set(
              data.data
                .map(item => typeof item === 'string' ? item : item.branch_state)
                .filter(Boolean)
            ));

            setDbStates(stateValues);
            setHasBranchState(stateValues.length > 0);

            if (stateValues.length > 0) {
              setFormData(prev => ({
                ...prev,
                serviceState: prev.serviceState && prev.serviceState.length > 0 ? prev.serviceState : stateValues
              }));
            }
          } else {
            queueMicrotask(() => {
              setDbStates([]);
              setHasBranchState(false);
            });
          }
        })
        .catch(err => {
          console.error('Error fetching branch states:', err);
          queueMicrotask(() => {
            setDbStates([]);
            setHasBranchState(false);
          });
        });
    };

    if (storedBranchName) {
      fetchBranchStates(storedBranchName);
      return;
    }

    if (!token) {
      queueMicrotask(() => {
        setDbStates([]);
        setHasBranchState(false);
      });
      return;
    }

    fetch('http://localhost:5000/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        const fetchedBranchName = data?.user?.branch_name?.trim() || data?.user?.branchName?.trim();
        if (fetchedBranchName) {
          fetchBranchStates(fetchedBranchName);
        } else {
          queueMicrotask(() => {
            setDbStates([]);
            setHasBranchState(false);
          });
        }
      })
      .catch(err => {
        console.error('Error fetching current user auth profile:', err);
        queueMicrotask(() => {
          setDbStates([]);
          setHasBranchState(false);
        });
      });
  }, [setFormData]);

  useEffect(() => {
    const states = formData.serviceState?.join(',');
    if (states) {
      fetch(`http://localhost:5000/api/branches?states=${encodeURIComponent(states)}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'Success') {
            setDbBranches(data.data);
          }
        })
        .catch(err => console.error('Error fetching branches:', err));
    } else {
      queueMicrotask(() => setDbBranches([]));
    }
  }, [formData.serviceState]);

  const lookupPincode = useCallback(async (pincode, stateField, cityField, lookupKey) => {
    if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) return;

    setPincodeLookupStatus(prev => ({ ...prev, [lookupKey]: 'Looking up...' }));
    try {
      const response = await fetch(`http://localhost:5000/api/pincode/${pincode}`);
      const data = await response.json();

      if (data?.status === 'Success' && data.data) {
        setFormData(prev => ({
          ...prev,
          [stateField]: data.data.state || prev[stateField],
          [cityField]: data.data.city || prev[cityField]
        }));
        setPincodeLookupStatus(prev => ({ ...prev, [lookupKey]: '✓ Found' }));
        setTimeout(() => setPincodeLookupStatus(prev => ({ ...prev, [lookupKey]: '' })), 2000);
      } else {
        setPincodeLookupStatus(prev => ({ ...prev, [lookupKey]: 'Pincode not found' }));
        setTimeout(() => setPincodeLookupStatus(prev => ({ ...prev, [lookupKey]: '' })), 3000);
      }
    } catch {
      setPincodeLookupStatus(prev => ({ ...prev, [lookupKey]: 'Lookup failed' }));
      setTimeout(() => setPincodeLookupStatus(prev => ({ ...prev, [lookupKey]: '' })), 3000);
    }
  }, [setFormData]);

  // Handle pincode input change — restrict to 6 digits
  const handlePincodeChange = useCallback((e, fieldName = 'pincode') => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  }, [setFormData]);

  useEffect(() => {
    if (formData.pincode?.length === 6 && formData.pincode !== lastLookedUpRef.current.main) {
      lastLookedUpRef.current = { ...lastLookedUpRef.current, main: formData.pincode };
      lookupPincode(formData.pincode, 'state', 'city', 'main');
    }
  }, [formData.pincode, lookupPincode]);

  useEffect(() => {
    if (formData.ref1Pincode?.length === 6 && formData.ref1Pincode !== lastLookedUpRef.current.ref1) {
      lastLookedUpRef.current = { ...lastLookedUpRef.current, ref1: formData.ref1Pincode };
      lookupPincode(formData.ref1Pincode, 'ref1State', 'ref1City', 'ref1');
    }
  }, [formData.ref1Pincode, lookupPincode]);

  useEffect(() => {
    if (formData.ref2Pincode?.length === 6 && formData.ref2Pincode !== lastLookedUpRef.current.ref2) {
      lastLookedUpRef.current = { ...lastLookedUpRef.current, ref2: formData.ref2Pincode };
      lookupPincode(formData.ref2Pincode, 'ref2State', 'ref2City', 'ref2');
    }
  }, [formData.ref2Pincode, lookupPincode]);

  return (
    <div className={`step-content animate-fade-in${isVerificationLocked ? ' locked-step' : ''}`} inert={isVerificationLocked ? "" : undefined}>
      {isVerificationLocked && (
        <div className="locked-overlay">Verification complete. Pages 1–4 are read-only after verification.</div>
      )}

      {/* Company / Vendor Details Section */}
      <h3 className="section-subheading">Company / Vendor Details</h3>
      <div className="form-grid">
        <div className="input-group">
          <label>Company / Vendor Name <span className="text-error">*</span></label>
          <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.companyName} />
        </div>


        {(formData.entityType === 'Partnership' || formData.entityType === 'Private/Public Ltd Company') && (
          <div className="input-group">
            <label>Number of Partners/Directors <span className="text-error">*</span></label>
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

        {formData.entityType !== 'Individual' && (
          <div className="input-group">
            <label>Date of Incorporation <span className="text-error">*</span></label>
            <input
              type="date"
              name="dateOfInc"
              value={formData.dateOfInc}
              onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.dateOfInc}
            />
          </div>
        )}


      </div>

      {/* GST Details Section — shown only when a GST document is uploaded for non-Individual entities */}
      {formData.entityType !== 'Individual' && formData.gstCertificateUpload && (
        <>
          <div className="section-divider mt-6"></div>
          <h3 className="section-subheading">GST Details</h3>
          <p className="text-sm text-muted mb-3">These fields are auto-populated when a GST certificate is uploaded and parsed.</p>
          <div className="form-grid">
            <div className="input-group">
              <label>Company / Vendor Name <span className="text-error">*</span></label>
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
              <label>Company / Vendor Name <span className="text-error">*</span></label>
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
          <label>Registered Address <span className="text-error">*</span></label>
          <input type="text" name="registeredAddress" value={formData.registeredAddress} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.registeredAddress} />
        </div>

        <div className="input-group">
          <label>Pincode <span className="text-error">*</span></label>
          <input
            type="text"
            name="pincode"
            value={formData.pincode}
            onChange={(e) => handlePincodeChange(e, 'pincode')}
            disabled={verificationCompleted || !!formData.lockedFields?.pincode}
            maxLength={6}
            inputMode="numeric"
            placeholder="Enter 6-digit pincode"
          />
          {pincodeLookupStatus.main && (
            <p className={`text-sm mt-1 ${pincodeLookupStatus.main.startsWith('✓') ? 'text-success' : 'text-muted'}`}>
              {pincodeLookupStatus.main}
            </p>
          )}
        </div>

        <div className="input-group">
          <label>State <span className="text-error">*</span></label>
          <select name="state" value={formData.state} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.state}>
            <option value="">Select State</option>
            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="input-group">
          <label>City <span className="text-error">*</span></label>
          <input type="text" name="city" value={formData.city} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.city} />
        </div>

      </div>

      {/* Serving State Section */}
      <div className="section-divider mt-6"></div>
      <h3 className="section-subheading">Serving State</h3>
      <div className="form-grid">
        <div className="input-group">
          <label>Service States <span className="text-error">*</span></label>
          <select name="serviceState" multiple value={formData.serviceState || []} onChange={(e) => {
            const clickedOptions = Array.from(e.target.selectedOptions).map(opt => opt.value);
            const newStates = Array.from(new Set([...(formData.serviceState || []), ...clickedOptions]));
            setFormData(prev => ({ ...prev, serviceState: newStates }));
          }} disabled={verificationCompleted || !hasBranchState} style={{ height: '100px' }}>
            {hasBranchState ? dbStates.map(s => <option key={s} value={s}>{s}</option>) : <option value="">No mapped branch state</option>}
          </select>
          {formData.serviceState && formData.serviceState.length > 0 && (
            <div className="selected-states mt-2" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
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
          <label>Serving Branch <span className="text-error">*</span></label>
          <select name="serviceBranch" multiple value={formData.serviceBranch || []} onChange={(e) => {
            const clickedOptions = Array.from(e.target.selectedOptions).map(opt => opt.value);
            const newBranches = Array.from(new Set([...(formData.serviceBranch || []), ...clickedOptions]));
            setFormData(prev => ({ ...prev, serviceBranch: newBranches }));
          }} disabled={verificationCompleted} style={{ height: '100px' }}>
            {dbBranches.map(b => (
              <option key={b.branch_name} value={b.branch_name}>{b.branch_name}</option>
            ))}
          </select>
          {Array.isArray(formData.serviceBranch) && formData.serviceBranch.length > 0 && (
            <div className="selected-states mt-2" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {formData.serviceBranch.map(b => (
                <span key={b} className="badge badge-secondary flex items-center gap-1">
                  {b}
                  {!verificationCompleted && (
                    <button type="button" onClick={() => {
                      const newBranches = formData.serviceBranch.filter(br => br !== b);
                      setFormData(prev => ({ ...prev, serviceBranch: newBranches }));
                    }} style={{ background: 'none', border: 'none', color: 'currentColor', cursor: 'pointer', padding: 0 }}>&times;</button>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Contact Details & Verification */}
      <div className="section-divider mt-6"></div>
      <h3 className="section-subheading">Contact Details & Verification</h3>
      <div className="form-grid">
        <div className="input-group">
          <label>Email Address <span className="text-error">*</span></label>
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


      </div>

      {/* Personal / Key Person Details Section */}
      <div className="section-divider mt-6"></div>
      <h3 className="section-subheading">Personal / Key Person Details</h3>
      {formData.entityType === 'Individual' ? (
        <div className="form-grid">
          <div className="input-group">
            <label>Full Name <span className="text-error">*</span></label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.fullName} />
          </div>
          <div className="input-group">
            <label>Father's Name <span className="text-error">*</span></label>
            <input type="text" name="fatherName" value={formData.fatherName} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.fatherName} />
          </div>
          <div className="input-group">
            <label>Mother's Name <span className="text-error">*</span></label>
            <input type="text" name="mothersName" value={formData.mothersName} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.mothersName} />
          </div>
          <div className="input-group">
            <label>Date of Birth <span className="text-error">*</span></label>
            <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.dob} />
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
                  <label>Full Name <span className="text-error">*</span></label>
                  <input type="text" value={partner.fullName || ''} onChange={(e) => handlePartnerDetailChange(index, 'fullName', e.target.value)} disabled={verificationCompleted} />
                </div>
                <div className="input-group">
                  <label>Father's Name <span className="text-error">*</span></label>
                  <input type="text" value={partner.fatherName || ''} onChange={(e) => handlePartnerDetailChange(index, 'fatherName', e.target.value)} disabled={verificationCompleted} />
                </div>
                <div className="input-group">
                  <label>Mother's Name <span className="text-error">*</span></label>
                  <input type="text" value={partner.mothersName || ''} onChange={(e) => handlePartnerDetailChange(index, 'mothersName', e.target.value)} disabled={verificationCompleted} />
                </div>
                <div className="input-group">
                  <label>Date of Birth <span className="text-error">*</span></label>
                  <input type="date" value={partner.dob || ''} onChange={(e) => handlePartnerDetailChange(index, 'dob', e.target.value)} disabled={verificationCompleted} />
                </div>
                <div className="input-group">
                  <label>Designation <span className="text-error">*</span></label>
                  <input type="text" value={partner.designation || ''} onChange={(e) => handlePartnerDetailChange(index, 'designation', e.target.value)} disabled={verificationCompleted} />
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
        <div className="input-group full-width">
          <label>Address <span className="text-error">*</span></label>
          <input type="text" name="personalAddress" value={formData.personalAddress} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.personalAddress} placeholder="Address" />
        </div>
        {formData.entityType !== 'Individual' && (
          <div className="input-group">
            <label>Company PAN <span className="text-error">*</span></label>
            <input type="text" name="companyPan" value={formData.companyPan} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.companyPan} style={{ textTransform: 'uppercase' }} maxLength={10} />
          </div>
        )}

        <div className="input-group">
          <label>Individual PAN <span className="text-error">*</span></label>
          <input type="text" name="individualPan" value={formData.individualPan} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.individualPan} style={{ textTransform: 'uppercase' }} maxLength={10} />
        </div>

        <div className="input-group">
          <label>Aadhaar Number <span className="text-error">*</span></label>
          <input type="text" name="aadharNumber" value={formData.aadharNumber} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.aadharNumber} maxLength={14} />
        </div>

        <div className="input-group">
          <label>KYC Document Type <span className="text-error">*</span></label>
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
          <label>Name <span className="text-error">*</span></label>
          <input type="text" name="ref1Name" value={formData.ref1Name} onChange={handleInputChange} disabled={verificationCompleted} placeholder="Reference person name" />
        </div>
        <div className="input-group">
          <label>Mobile Number <span className="text-error">*</span></label>
          <input type="tel" name="ref1Mobile" value={formData.ref1Mobile} onChange={handleInputChange} disabled={verificationCompleted} inputMode="numeric" pattern="[0-9]*" maxLength={10} placeholder="10-digit mobile" />
        </div>
        <div className="input-group full-width">
          <label>Address <span className="text-error">*</span></label>
          <input type="text" name="ref1Address" value={formData.ref1Address} onChange={handleInputChange} disabled={verificationCompleted} placeholder="Full address" />
        </div>
        <div className="input-group">
          <label>Pincode <span className="text-error">*</span></label>
          <input type="text" name="ref1Pincode" value={formData.ref1Pincode} onChange={(e) => handlePincodeChange(e, 'ref1Pincode')} disabled={verificationCompleted} maxLength={6} placeholder="6-digit pincode" />
          {pincodeLookupStatus.ref1 && (
            <p className={`text-sm mt-1 ${pincodeLookupStatus.ref1.startsWith('✓') ? 'text-success' : 'text-muted'}`}>
              {pincodeLookupStatus.ref1}
            </p>
          )}
        </div>
        <div className="input-group">
          <label>State <span className="text-error">*</span></label>
          <select name="ref1State" value={formData.ref1State} onChange={handleInputChange} disabled={verificationCompleted}>
            <option value="">Select State</option>
            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="input-group">
          <label>City <span className="text-error">*</span></label>
          <input type="text" name="ref1City" value={formData.ref1City} onChange={handleInputChange} disabled={verificationCompleted} placeholder="City" />
        </div>
      </div>

      {/* Reference 2 */}
      <h4 style={{ marginBottom: '0.75rem', marginTop: '1.5rem', fontSize: '0.95rem', fontWeight: 600, color: 'var(--primary-color)' }}>Reference 2</h4>
      <div className="form-grid">
        <div className="input-group">
          <label>Name <span className="text-error">*</span></label>
          <input type="text" name="ref2Name" value={formData.ref2Name} onChange={handleInputChange} disabled={verificationCompleted} placeholder="Reference person name" />
        </div>
        <div className="input-group">
          <label>Mobile Number <span className="text-error">*</span></label>
          <input type="tel" name="ref2Mobile" value={formData.ref2Mobile} onChange={handleInputChange} disabled={verificationCompleted} inputMode="numeric" pattern="[0-9]*" maxLength={10} placeholder="10-digit mobile" />
        </div>
        <div className="input-group full-width">
          <label>Address <span className="text-error">*</span></label>
          <input type="text" name="ref2Address" value={formData.ref2Address} onChange={handleInputChange} disabled={verificationCompleted} placeholder="Full address" />
        </div>
        <div className="input-group">
          <label>Pincode <span className="text-error">*</span></label>
          <input type="text" name="ref2Pincode" value={formData.ref2Pincode} onChange={(e) => handlePincodeChange(e, 'ref2Pincode')} disabled={verificationCompleted} maxLength={6} placeholder="6-digit pincode" />
          {pincodeLookupStatus.ref2 && (
            <p className={`text-sm mt-1 ${pincodeLookupStatus.ref2.startsWith('✓') ? 'text-success' : 'text-muted'}`}>
              {pincodeLookupStatus.ref2}
            </p>
          )}
        </div>
        <div className="input-group">
          <label>State <span className="text-error">*</span></label>
          <select name="ref2State" value={formData.ref2State} onChange={handleInputChange} disabled={verificationCompleted}>
            <option value="">Select State</option>
            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="input-group">
          <label>City <span className="text-error">*</span></label>
          <input type="text" name="ref2City" value={formData.ref2City} onChange={handleInputChange} disabled={verificationCompleted} placeholder="City" />
        </div>
      </div>

      {/* SPOC Details Section — All Entity Types, auto-filled from logged-in user */}
      <div className="section-divider mt-6"></div>
      <h3 className="section-subheading">SPOC Details</h3>
      <p className="text-sm text-muted mb-3">Auto-filled from the logged-in user profile.</p>
      <div className="form-grid">
        <div className="input-group">
          <label>Name <span className="text-error">*</span></label>
          <input type="text" name="spocName" value={formData.spocName} disabled style={{ background: 'var(--bg-color)', cursor: 'not-allowed' }} />
        </div>
        <div className="input-group">
          <label>Employee Code <span className="text-error">*</span></label>
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
