import { CheckCircle, Loader2, FileText } from 'lucide-react';

const Step3Banking = ({
  formData,
  setFormData,
  bankingMode,
  setBankingMode,
  handleDocumentUpload,
  docParseStatus,
  setAaLinkSent,
  setAaPhone,
  aaPhone,
  aaLinkSent,
  aaStatusChecked,
  setAaStatusChecked,
  aaMaskedAccount,
  setAaMaskedAccount,
  aaAccountNumber,
  setAaAccountNumber,
  aaBankOtpSent,
  setAaBankOtpSent,
  aaBankOtp,
  setAaBankOtp,
  aaBankOtpVerified,
  setAaBankOtpVerified,
  aaBankOtpError,
  setAaBankOtpError,
  pennyDropDone,
  setPennyDropDone,
  manualBankOtpSent,
  setManualBankOtpSent,
  manualBankOtp,
  setManualBankOtp,
  manualBankOtpVerified,
  setManualBankOtpVerified,
  manualBankOtpError,
  setManualBankOtpError,
  handleInputChange,
  verificationCompleted
}) => {
  return (
    <div className="step-content animate-fade-in">
      <h2>Bank Statement & Verification</h2>
      <p className="mb-6 text-sm text-muted">Choose how to provide your banking details. Select Account Aggregator for seamless verification or Manual Banking to upload your statement.</p>

      <div className="banking-options">
        <div
          className={`banking-card glass-panel ${bankingMode === 'aa' ? 'selected' : ''}`}
          onClick={() => { setBankingMode('aa'); }}
          style={{ cursor: 'pointer', border: bankingMode === 'aa' ? '2px solid var(--primary)' : '2px solid transparent' }}
        >
          <h3>🔗 Account Aggregator</h3>
          <p>Securely link your bank account via Account Aggregator for instant verification.</p>
        </div>

        <div
          className={`banking-card glass-panel ${bankingMode === 'manual' ? 'selected' : ''}`}
          onClick={() => { setBankingMode('manual'); setAaLinkSent(false); setAaPhone(''); }}
          style={{ cursor: 'pointer', border: bankingMode === 'manual' ? '2px solid var(--primary)' : '2px solid transparent' }}
        >
          <h3>📄 Manual Banking</h3>
          <p>Upload your bank statement PDF and we'll auto-extract your account details.</p>
        </div>
      </div>

      {bankingMode === 'aa' && (
        <div className="mt-6">
          <div className="partner-card glass-panel">
            <h4 className="mb-4">Account Aggregator — Link Your Bank</h4>
            <div className="aa-iframe-container" style={{ border: '2px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', background: 'var(--primary-gradient-subtle)' }}>
              {!aaLinkSent ? (
                <>
                  <p className="text-sm text-muted mb-4">Enter your registered mobile number to receive the Account Aggregator consent link.</p>
                  <div className="input-group">
                    <label>Mobile Number <span className="text-error">*</span></label>
                    <input
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      value={aaPhone}
                      onChange={(e) => setAaPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      maxLength={10}
                      inputMode="numeric"
                    />
                  </div>
                  <button
                    className="btn btn-primary mt-4"
                    disabled={aaPhone.length !== 10}
                    onClick={() => {
                      setAaLinkSent(true);
                      alert(`Consent link sent to ${aaPhone}`);
                    }}
                  >
                    Send Link
                  </button>
                </>
              ) : (
                <>
                  <div className="success-banner animate-fade-in mb-4">
                    <CheckCircle className="text-success" size={20} />
                    <div>
                      <strong>Consent link sent to {aaPhone}</strong>
                      <p>Please approve the consent on your mobile device.</p>
                    </div>
                  </div>
                  {!aaStatusChecked ? (
                    <button
                      className="btn btn-primary mt-4"
                      onClick={() => {
                        setAaStatusChecked(true);
                        setAaMaskedAccount('XXXXXXXXXXXXX6552');
                      }}
                    >
                      Check Status
                    </button>
                  ) : (
                    <>
                      <div className="section-divider"></div>
                      <h4 className="mb-3">Bank Account Verification</h4>
                      <p className="text-sm text-muted mb-4">Enter your full account number to match with the Account Aggregator.</p>
                      
                      <div className="form-grid">
                        <div className="input-group">
                          <label>Fetched Account <span className="text-error">*</span></label>
                          <input type="text" value={aaMaskedAccount} disabled style={{ background: 'var(--bg-color)' }} />
                        </div>
                        <div className="input-group">
                          <label>Enter Account Number <span className="text-error">*</span></label>
                          <input
                            type="text"
                            placeholder="Enter account number"
                            value={aaAccountNumber}
                            onChange={(e) => setAaAccountNumber(e.target.value)}
                            disabled={pennyDropDone}
                          />
                        </div>
                      </div>

                      {!pennyDropDone && aaAccountNumber.length > 3 && (
                        aaMaskedAccount.slice(-4) !== aaAccountNumber.slice(-4) ? (
                          <p className="text-error text-sm mt-2">Account number last 4 digits do not match.</p>
                        ) : (
                          <div className="mt-4 p-4 border rounded bg-white">
                            <h5 className="mb-3 font-semibold">Account Matched! Verify via OTP</h5>
                            <p className="text-sm text-muted mb-3">Send OTP to DSA registered number for final verification.</p>
                            {!aaBankOtpSent ? (
                              <button
                                className="btn btn-primary"
                                onClick={() => {
                                  setAaBankOtpSent(true);
                                  setAaBankOtpError('');
                                }}
                              >
                                Send OTP
                              </button>
                            ) : (
                              <div className="flex gap-2 items-start flex-col">
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="Enter OTP"
                                    value={aaBankOtp}
                                    onChange={(e) => setAaBankOtp(e.target.value)}
                                    maxLength={5}
                                    className="p-2 border rounded"
                                  />
                                  <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                      if (aaBankOtp === '12345') {
                                        setAaBankOtpVerified(true);
                                        setAaBankOtpError('');
                                        setPennyDropDone(true);
                                        setFormData(prev => ({
                                          ...prev,
                                          accountNumber: aaAccountNumber,
                                          bankName: 'Auto-Verified Bank'
                                        }));
                                      } else {
                                        setAaBankOtpError('Invalid OTP. Please use 12345.');
                                      }
                                    }}
                                  >
                                    Verify OTP
                                  </button>
                                </div>
                                {aaBankOtpError && <p className="text-error text-sm">{aaBankOtpError}</p>}
                              </div>
                            )}
                          </div>
                        )
                      )}

                      {pennyDropDone && (
                        <div className="success-banner animate-fade-in mt-4">
                          <CheckCircle className="text-success" size={20} />
                          <div>
                            <strong>Account Verified!</strong>
                            <p>Account {aaAccountNumber} has been successfully verified via OTP.</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {bankingMode === 'manual' && (
        <div className="mt-6">
          <div className="partner-card glass-panel">
            <h4 className="mb-4">Upload Bank Statement</h4>
            <p className="text-sm text-muted mb-4">Upload your bank statement PDF. We'll automatically extract Account Number and IFSC Code.</p>
            <div className={`file-upload-zone${formData.bankStatementUpload ? ' has-file' : ''}`}>
              {docParseStatus.bankStatementUpload === 'parsing' ? (
                <div className="flex flex-col items-center justify-center text-muted" style={{ padding: '1rem' }}>
                  <Loader2 size={32} className="spin mb-2" />
                  <p>Parsing bank statement...</p>
                </div>
              ) : (
                <>
                  <FileText size={24} className="mb-2 text-muted" />
                  <p>{formData.bankStatementUpload ? `✓ ${formData.bankStatementUpload.name}` : 'Click to upload bank statement (PDF)'}</p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      handleDocumentUpload('bankStatementUpload', file);
                    }}
                  />
                </>
              )}
            </div>

            {(formData.accountNumber || formData.ifscCode) && bankingMode === 'manual' && (
              <>
                <div className="section-divider"></div>
                <h4 className="mb-3">Extracted Bank Details</h4>
                <div className="form-grid">
                  <div className="input-group">
                    <label>Bank Name <span className="text-error">*</span></label>
                    <input type="text" name="bankName" value={formData.bankName} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.bankName} className={formData.bankName ? 'prefilled' : ''} />
                  </div>
                  <div className="input-group">
                    <label>Account Number <span className="text-error">*</span></label>
                    <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.accountNumber} className={formData.accountNumber ? 'prefilled' : ''} />
                  </div>
                  <div className="input-group">
                    <label>IFSC Code <span className="text-error">*</span></label>
                    <input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.ifscCode} className={formData.ifscCode ? 'prefilled' : ''} />
                  </div>
                </div>

                {/* OTP Verification for Manual Banking */}
                <div className="section-divider mt-4"></div>
                <h4 className="mb-3">Verify Bank Account</h4>
                <p className="text-sm text-muted mb-4">Send OTP to DSA registered number for final verification.</p>
                
                {!manualBankOtpSent ? (
                  <button
                    className="btn btn-primary"
                    disabled={!formData.accountNumber || !formData.ifscCode || manualBankOtpVerified}
                    onClick={() => {
                      setManualBankOtpSent(true);
                      setManualBankOtpError('');
                    }}
                  >
                    {manualBankOtpVerified ? 'Verified' : 'Send OTP'}
                  </button>
                ) : (
                  !manualBankOtpVerified ? (
                    <div className="flex gap-2 items-start flex-col">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter OTP"
                          value={manualBankOtp}
                          onChange={(e) => setManualBankOtp(e.target.value)}
                          maxLength={5}
                          className="p-2 border rounded"
                        />
                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            if (manualBankOtp === '12345') {
                              setManualBankOtpVerified(true);
                              setManualBankOtpError('');
                            } else {
                              setManualBankOtpError('Invalid OTP. Please use 12345.');
                            }
                          }}
                        >
                          Verify OTP
                        </button>
                      </div>
                      {manualBankOtpError && <p className="text-error text-sm">{manualBankOtpError}</p>}
                    </div>
                  ) : null
                )}

                {manualBankOtpVerified && (
                  <div className="success-banner animate-fade-in mt-4">
                    <CheckCircle className="text-success" size={20} />
                    <div>
                      <strong>Account Verified!</strong>
                      <p>Bank account has been successfully verified via OTP.</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Step3Banking;
