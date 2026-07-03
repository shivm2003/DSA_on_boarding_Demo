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
  aaAccountNumber,
  setAaAccountNumber,
  pennyDropDone,
  setPennyDropDone,
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
                    <label>Mobile Number</label>
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
                  <div className="section-divider"></div>
                  <h4 className="mb-3">Penny Drop Verification</h4>
                  <p className="text-sm text-muted mb-4">Enter your account number for penny drop verification.</p>
                  <div className="form-grid">
                    <div className="input-group">
                      <label>Account Number</label>
                      <input
                        type="text"
                        placeholder="Enter account number"
                        value={aaAccountNumber}
                        onChange={(e) => setAaAccountNumber(e.target.value)}
                      />
                    </div>
                    <div className="input-group">
                      <label>IFSC Code</label>
                      <input
                        type="text"
                        placeholder="Enter IFSC code"
                        name="ifscCode"
                        value={formData.ifscCode}
                        onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.ifscCode}
                      />
                    </div>
                  </div>
                  <button
                    className="btn btn-primary mt-4"
                    disabled={!aaAccountNumber || pennyDropDone}
                    onClick={() => {
                      setPennyDropDone(true);
                      setFormData(prev => ({
                        ...prev,
                        accountNumber: aaAccountNumber,
                        bankName: 'Auto-Verified Bank'
                      }));
                    }}
                  >
                    {pennyDropDone ? '✓ Penny Drop Verified' : 'Verify via Penny Drop'}
                  </button>
                  {pennyDropDone && (
                    <div className="success-banner animate-fade-in mt-4">
                      <CheckCircle className="text-success" size={20} />
                      <div>
                        <strong>Penny Drop Successful!</strong>
                        <p>Account {aaAccountNumber} has been verified.</p>
                      </div>
                    </div>
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
                    <label>Bank Name</label>
                    <input type="text" name="bankName" value={formData.bankName} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.bankName} className={formData.bankName ? 'prefilled' : ''} />
                  </div>
                  <div className="input-group">
                    <label>Account Number</label>
                    <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.accountNumber} className={formData.accountNumber ? 'prefilled' : ''} />
                  </div>
                  <div className="input-group">
                    <label>IFSC Code</label>
                    <input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleInputChange} disabled={verificationCompleted || !!formData.lockedFields?.ifscCode} className={formData.ifscCode ? 'prefilled' : ''} />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Step3Banking;
