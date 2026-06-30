import { useEffect, useRef, useState } from 'react';
import { Eye, FileText, Menu } from 'lucide-react';
import './ReviewQueue.css';

const MOCK_APPLICATIONS = [
  { id: 'APP-001', name: 'Raman Associates', dsaCode: 'TEMP-ABCD1234', date: '14-04-2026', status: 'Pending', step: 'Review' },
  { id: 'APP-002', name: 'Shivam Sharma', dsaCode: 'TEMP-XYZA5678', date: '15-04-2026', status: 'Query Raised', step: 'Compliance' },
  { id: 'APP-003', name: 'Alok Traders', dsaCode: 'TEMP-LMNO9012', date: '16-04-2026', status: 'Approved', step: 'Completed' },
];

const ReviewQueue = () => {
  const [selectedApp, setSelectedApp] = useState(null);
  const [queryMenuOpen, setQueryMenuOpen] = useState(false);
  const [activePopup, setActivePopup] = useState(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [applicantRemarks, setApplicantRemarks] = useState('');
  const [reviewerRemarks, setReviewerRemarks] = useState('');
  const [disputeRemarks, setDisputeRemarks] = useState('');
  const [applicantAttachments, setApplicantAttachments] = useState([]);
  const [productAttachments, setProductAttachments] = useState([]);
  const [disputeAttachments, setDisputeAttachments] = useState([]);
  const applicantInputRef = useRef(null);
  const productInputRef = useRef(null);
  const disputeInputRef = useRef(null);
  const [applications, setApplications] = useState(() => {
    try {
      const subs = JSON.parse(localStorage.getItem('submissions') || 'null');
      if (Array.isArray(subs)) {
        return subs;
      }
      return MOCK_APPLICATIONS;
    } catch {
      return MOCK_APPLICATIONS;
    }
  });

  const reviewData = selectedApp?.data ?? {};
  const documentUploads = reviewData.documentUploads || reviewData;
  const banking = reviewData.banking || reviewData;
  const companyDetails = reviewData.companyDetails || reviewData;
  const addressDetails = reviewData.addressDetails || reviewData;
  const contactVerification = reviewData.contactVerification || reviewData;
  const kycDetails = reviewData.kycDetails || reviewData;
  const partnerDetails = Array.isArray(reviewData.partnerDetails) ? reviewData.partnerDetails : [];
  const partnerBankDetails = Array.isArray(reviewData.partnerBankDetails) ? reviewData.partnerBankDetails : [];
  const partnerOcrDetails = Array.isArray(reviewData.partnerOcrDetails) ? reviewData.partnerOcrDetails : [];
  const partnerUploads = Array.isArray(documentUploads.partnerUploads)
    ? documentUploads.partnerUploads
    : Array.isArray(reviewData.partnerUploads)
      ? reviewData.partnerUploads
      : [];

  useEffect(() => {
    localStorage.setItem('submissions', JSON.stringify(applications));
  }, [applications]);

  const selectedAppRemarksHistory = selectedApp?.remarksHistory || [];
  const showRemarksHistoryButton = selectedApp && (
    selectedAppRemarksHistory.length > 0
    || ['Query Raised', 'Dispute Raised', 'Send to Product'].includes(selectedApp.status)
  );

  const handleActionSubmit = () => {
    if (!selectedApp) return;

    const now = new Date().toLocaleString();
    const history = [...(selectedApp.remarksHistory || [])];
    let updatedApp = { ...selectedApp };

    if (activePopup === 'editApplicant' && applicantRemarks.trim()) {
      history.push({ action: 'Query Raised', source: 'Applicant', remarks: applicantRemarks.trim(), date: now });
      updatedApp.status = 'Query Raised';
    }

    if (activePopup === 'sendToProduct') {
      if (reviewerRemarks.trim()) {
        history.push({ action: 'Send to Product', source: 'Reviewer Remarks', remarks: reviewerRemarks.trim(), date: now });
      }
      if (disputeRemarks.trim()) {
        history.push({ action: 'Send to Product', source: 'Dispute Remarks', remarks: disputeRemarks.trim(), date: now });
      }
      if (reviewerRemarks.trim() || disputeRemarks.trim()) {
        updatedApp.status = 'Send to Product';
      }
    }

    if (activePopup === 'addDispute' && disputeRemarks.trim()) {
      history.push({ action: 'Dispute Raised', source: 'Dispute', remarks: disputeRemarks.trim(), date: now });
      updatedApp.status = 'Dispute Raised';
    }

    if (history.length > 0) {
      updatedApp = { ...updatedApp, remarksHistory: history };
    }

    const updatedApplications = applications.map((app) => (app.id === updatedApp.id ? updatedApp : app));
    setApplications(updatedApplications);
    setSelectedApp(updatedApp);
    setActivePopup(null);
    setApplicantRemarks('');
    setReviewerRemarks('');
    setDisputeRemarks('');
    setApplicantAttachments([]);
    setProductAttachments([]);
    setDisputeAttachments([]);
  };

  return (
    <div className="review-queue-page">
      <h1 className="page-title">Review Queue</h1>
      
      {!selectedApp ? (
        <div className="glass-panel p-0 animate-fade-in">
          {applications.length > 0 ? (
            <table className="review-table">
              <thead>
                <tr>
                  <th>App ID</th>
                  <th>DSA Name</th>
                  <th>Temp Code</th>
                  <th>Date Submitted</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td><strong>{app.id}</strong></td>
                    <td>{app.name}</td>
                    <td>{app.dsaCode}</td>
                    <td>{app.date}</td>
                    <td>
                      <span className={`badge badge-${app.status === 'Approved' ? 'success' : app.status === 'Pending' ? 'warning' : 'danger'}`}>
                        {app.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => setSelectedApp(app)}>
                        <Eye size={16} /> Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="glass-panel review-section">
              <h3>No applications found</h3>
              <p>There are no saved submissions in local storage yet.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="review-details animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <button className="btn btn-outline" onClick={() => setSelectedApp(null)}>Back to Queue</button>
            <div className="flex gap-2" style={{ position: 'relative' }}>
              {showRemarksHistoryButton && (
                <button className="btn btn-secondary" onClick={() => setHistoryModalOpen(true)}>
                  Remarks History
                </button>
              )}
              <button
                className="btn btn-outline"
                onClick={() => setQueryMenuOpen((s) => !s)}
                aria-haspopup="true"
                aria-expanded={queryMenuOpen}
              >
                <Menu size={16} />
              </button>

              {queryMenuOpen && (
                <div style={{ position: 'absolute', right: 0, top: '2.75rem', zIndex: 60, minWidth: 220 }} className="glass-panel">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.75rem' }}>
                    {/* <button type="button" className="btn btn-outline w-full" onClick={() => { setQueryMenuOpen(false); setActivePopup('editApplicant'); }}>Edit / Add Applicant</button> */}
                    <button type="button" className="btn btn-outline w-full" onClick={() => { setQueryMenuOpen(false); setActivePopup('sendToProduct'); }}>Send to Product</button>
                    <button type="button" className="btn btn-outline w-full" onClick={() => { setQueryMenuOpen(false); setActivePopup('addDispute'); }}>Add Dispute</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {activePopup && (
            <div className="modal-overlay" onClick={() => setActivePopup(null)}>
              <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>
                    {activePopup === 'editApplicant' && 'Edit / Add Applicant'}
                    {activePopup === 'sendToProduct' && 'Send to Product'}
                    {activePopup === 'addDispute' && 'Add Dispute'}
                  </h2>
                  <button className="btn btn-outline btn-sm" onClick={() => setActivePopup(null)}>Close</button>
                </div>

                <div className="modal-body">
                  <div className="detail-row"><span>Temp Code:</span> <strong>{selectedApp.dsaCode}</strong></div>
                  <div className="detail-row"><span>DSA Name:</span> <strong>{selectedApp.name}</strong></div>
                  <div className="detail-row"><span>Phone Number:</span> <strong>{contactVerification.phone || reviewData.phone || 'N/A'}</strong></div>
                  <div className="detail-row"><span>Branch:</span> <strong>{addressDetails.serviceBranch || reviewData.serviceBranch || 'N/A'}</strong></div>

                  {activePopup === 'editApplicant' && (
                    <>
                      <div className="input-group">
                        <label>Remarks</label>
                        <textarea value={applicantRemarks} onChange={(e) => setApplicantRemarks(e.target.value)} rows={4} placeholder="Enter remarks" />
                      </div>
                      <div className="input-group">
                        <label>Attachments</label>
                        <button className="btn btn-outline btn-sm" type="button" onClick={() => applicantInputRef.current?.click()}>
                          Add Attachment
                        </button>
                        <input
                          ref={applicantInputRef}
                          type="file"
                          multiple
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            setApplicantAttachments((prev) => [...prev, ...files.map((file) => file.name)]);
                          }}
                        />
                        {applicantAttachments.length > 0 && (
                          <div className="attachment-list">
                            {applicantAttachments.map((name, idx) => (
                              <span key={idx} className="attachment-pill">{name}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {activePopup === 'sendToProduct' && (
                    <>
                      <div className="input-group">
                        <label>Remarks by Reviewer</label>
                        <textarea value={reviewerRemarks} onChange={(e) => setReviewerRemarks(e.target.value)} rows={4} placeholder="Enter reviewer remarks" />
                      </div>
                      <div className="input-group">
                        <label>Dispute Remarks</label>
                        <textarea value={disputeRemarks} onChange={(e) => setDisputeRemarks(e.target.value)} rows={4} placeholder="Enter dispute remarks" />
                      </div>
                      <div className="input-group">
                        <label>Attachments</label>
                        <button className="btn btn-outline btn-sm" type="button" onClick={() => productInputRef.current?.click()}>
                          Add Attachment
                        </button>
                        <input
                          ref={productInputRef}
                          type="file"
                          multiple
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            setProductAttachments((prev) => [...prev, ...files.map((file) => file.name)]);
                          }}
                        />
                        {productAttachments.length > 0 && (
                          <div className="attachment-list">
                            {productAttachments.map((name, idx) => (
                              <span key={idx} className="attachment-pill">{name}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {activePopup === 'addDispute' && (
                    <>
                      <div className="input-group">
                        <label>Dispute Remarks</label>
                        <textarea value={disputeRemarks} onChange={(e) => setDisputeRemarks(e.target.value)} rows={4} placeholder="Enter dispute remarks" />
                      </div>
                      <div className="input-group">
                        <label>Attachments</label>
                        <button className="btn btn-outline btn-sm" type="button" onClick={() => disputeInputRef.current?.click()}>
                          Add Attachment
                        </button>
                        <input
                          ref={disputeInputRef}
                          type="file"
                          multiple
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            setDisputeAttachments((prev) => [...prev, ...files.map((file) => file.name)]);
                          }}
                        />
                        {disputeAttachments.length > 0 && (
                          <div className="attachment-list">
                            {disputeAttachments.map((name, idx) => (
                              <span key={idx} className="attachment-pill">{name}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="modal-actions">
                  <button className="btn btn-outline" onClick={() => setActivePopup(null)}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleActionSubmit}>
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}

          {historyModalOpen && (
            <div className="modal-overlay" onClick={() => setHistoryModalOpen(false)}>
              <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Remarks History</h2>
                  <button className="btn btn-outline btn-sm" onClick={() => setHistoryModalOpen(false)}>Close</button>
                </div>
                <div className="modal-body">
                  {selectedAppRemarksHistory.length === 0 ? (
                    <p>No remarks history available for this application.</p>
                  ) : (
                    <div className="remarks-history-list">
                      {selectedAppRemarksHistory.map((entry, idx) => (
                        <div key={idx} className="remarks-history-item">
                          <div className="detail-row"><span>Action:</span> <strong>{entry.action}</strong></div>
                          <div className="detail-row"><span>Source:</span> <strong>{entry.source}</strong></div>
                          <div className="detail-row"><span>Remarks:</span> <strong>{entry.remarks}</strong></div>
                          <div className="detail-row"><span>Date:</span> <strong>{entry.date}</strong></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="modal-actions">
                  <button className="btn btn-primary" onClick={() => setHistoryModalOpen(false)}>Close</button>
                </div>
              </div>
            </div>
          )}

          <div className="review-grid">
              <div className="glass-panel review-section">
              <h3>Applicant Details</h3>
              <div className="detail-row"><span>Name:</span> <strong>{selectedApp.name}</strong></div>
              <div className="detail-row"><span>Company / Vendor Name:</span> <strong>{companyDetails.companyName || reviewData.companyName || 'N/A'}</strong></div>
              <div className="detail-row"><span>Entity Type:</span> <strong>{companyDetails.entityType || reviewData.entityType || 'N/A'}</strong></div>
              <div className="detail-row"><span>Vendor Category:</span> <strong>{companyDetails.vendorCategory || reviewData.vendorCategory || 'N/A'}</strong></div>
              <div className="detail-row"><span>Registered Address:</span> <strong>{addressDetails.registeredAddress || reviewData.registeredAddress || 'N/A'}</strong></div>
              <div className="detail-row"><span>Mobile:</span> <strong>{contactVerification.phone || reviewData.phone || 'N/A'}</strong></div>
              <div className="detail-row"><span>Email:</span> <strong>{contactVerification.email || reviewData.email || 'N/A'}</strong></div>
            </div>

            <div className="glass-panel review-section">
              <h3>Banking Details</h3>
              <div className="detail-row"><span>Bank Name:</span> <strong>{banking.bankName || reviewData.bankName || 'N/A'}</strong></div>
              <div className="detail-row"><span>Account Number:</span> <strong>{banking.accountNumber || reviewData.accountNumber || 'N/A'}</strong></div>
              <div className="detail-row"><span>IFSC Code:</span> <strong>{banking.ifscCode || reviewData.ifscCode || 'N/A'}</strong></div>
            </div>

            <div className="glass-panel review-section">
              <h3>Business & KYC Details</h3>
              <div className="detail-row"><span>Company PAN:</span> <strong>{kycDetails.companyPan || reviewData.companyPan || 'N/A'}</strong></div>
              <div className="detail-row"><span>Individual PAN:</span> <strong>{kycDetails.individualPan || reviewData.individualPan || 'N/A'}</strong></div>
              <div className="detail-row"><span>Aadhar Number:</span> <strong>{kycDetails.aadharNumber || reviewData.aadharNumber || 'N/A'}</strong></div>
              <div className="detail-row"><span>GST Number:</span> <strong>{kycDetails.gstNumber || reviewData.gstNumber || 'N/A'}</strong></div>
              <div className="detail-row"><span>MSME Registered:</span> <strong>{kycDetails.msmeRegistered || reviewData.msmeRegistered || 'N/A'}</strong></div>
              <div className="detail-row"><span>ID Type:</span> <strong>{kycDetails.idType || reviewData.idType || 'N/A'}</strong></div>
              <div className="detail-row"><span>Date of Incorporation:</span> <strong>{companyDetails.dateOfInc || reviewData.dateOfInc || 'N/A'}</strong></div>
              <div className="detail-row"><span>Class of Activity:</span> <strong>{companyDetails.classOfActivity || reviewData.classOfActivity || 'N/A'}</strong></div>
              <div className="detail-row"><span>CIN:</span> <strong>{companyDetails.cin || reviewData.cin || 'N/A'}</strong></div>
              <div className="detail-row"><span>Annual Turnover:</span> <strong>{companyDetails.annualTurnover || reviewData.annualTurnover || 'N/A'}</strong></div>
              <div className="detail-row"><span>Years of Experience:</span> <strong>{companyDetails.yearsOfExperience || reviewData.yearsOfExperience || 'N/A'}</strong></div>
              <div className="detail-row"><span>Key Clients:</span> <strong>{kycDetails.keyClients || reviewData.keyClients || 'N/A'}</strong></div>
            </div>

            <div className="glass-panel review-section">
              <h3>Service Location</h3>
              <div className="detail-row"><span>Service Locations:</span> <strong>{addressDetails.serviceLocations || reviewData.serviceLocations || 'N/A'}</strong></div>
              <div className="detail-row"><span>Service State:</span> <strong>{addressDetails.serviceState || reviewData.serviceState || 'N/A'}</strong></div>
              <div className="detail-row"><span>Service City:</span> <strong>{addressDetails.serviceCity || reviewData.serviceCity || 'N/A'}</strong></div>
              <div className="detail-row"><span>Service Branch:</span> <strong>{addressDetails.serviceBranch || reviewData.serviceBranch || 'N/A'}</strong></div>
            </div>

            <div className="glass-panel review-section">
              <h3>Documents Uploaded</h3>
              <ul className="doc-list">
                <li><FileText size={16} /> PAN Document <span className="badge badge-secondary ml-auto">{documentUploads.panUpload || documentUploads.documentUploads?.panUpload || 'None'}</span></li>
                <li><FileText size={16} /> ID Proof <span className="badge badge-secondary ml-auto">{documentUploads.idProofUpload || 'None'}</span></li>
                <li><FileText size={16} /> Address Proof <span className="badge badge-secondary ml-auto">{documentUploads.addressProofUpload || 'None'}</span></li>
                <li><FileText size={16} /> GST Certificate <span className="badge badge-secondary ml-auto">{documentUploads.gstCertificateUpload || 'None'}</span></li>
                <li><FileText size={16} /> MSME Certificate <span className="badge badge-secondary ml-auto">{documentUploads.msmeCertificateUpload || 'None'}</span></li>
                <li><FileText size={16} /> Udyam Certificate <span className="badge badge-secondary ml-auto">{documentUploads.udyamCertificateUpload || 'None'}</span></li>
              </ul>
            </div>

            {partnerUploads.length > 0 && (
              <div className="glass-panel review-section full-width">
                <h3>Partner Uploads</h3>
                {partnerUploads.map((partner, idx) => (
                  <div key={idx} className="detail-row">
                    <span>Partner {idx + 1}:</span>
                    <div className="partner-docs">
                      <div>PAN: {partner?.panUpload || 'None'}</div>
                      <div>ID Proof: {partner?.idProofUpload || 'None'}</div>
                      <div>Address Proof: {partner?.addressProofUpload || 'None'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {partnerDetails.length > 0 && (
              <div className="glass-panel review-section full-width">
                <h3>Partner Details</h3>
                {partnerDetails.map((partner, idx) => (
                  <div key={idx} className="detail-row">
                    <span>Partner {idx + 1}:</span>
                    <div className="partner-docs">
                      <div>Name: {partner.fullName || 'None'}</div>
                      <div>DOB: {partner.dob || 'None'}</div>
                      <div>PAN: {partner.pan || 'None'}</div>
                      <div>Designation: {partner.designation || 'None'}</div>
                      <div>Role: {partner.role || 'None'}</div>
                      <div>Share %: {partner.sharePercentage || 'None'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {partnerBankDetails.length > 0 && (
              <div className="glass-panel review-section full-width">
                <h3>Partner Bank Details</h3>
                {partnerBankDetails.map((partner, idx) => (
                  <div key={idx} className="detail-row">
                    <span>Partner {idx + 1}:</span>
                    <div className="partner-docs">
                      <div>Bank: {partner.bankName || 'None'}</div>
                      <div>Account: {partner.accountNumber || 'None'}</div>
                      <div>IFSC: {partner.ifscCode || 'None'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {partnerOcrDetails.length > 0 && (
              <div className="glass-panel review-section full-width">
                <h3>Partner OCR Details</h3>
                {partnerOcrDetails.map((partner, idx) => (
                  <div key={idx} className="detail-row">
                    <span>Partner {idx + 1}:</span>
                    <div className="partner-docs">
                      <div>ID Proof File: {partner.idProofFile || 'None'}</div>
                      <div>Address Proof File: {partner.addressProofFile || 'None'}</div>
                      <div>Name: {partner.fullName || 'None'}</div>
                      <div>DOB: {partner.dob || 'None'}</div>
                      <div>PAN: {partner.pan || 'None'}</div>
                      <div>Aadhar: {partner.aadharNumber || 'None'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="glass-panel review-section full-width">
              <h3>Payout Details & Checks</h3>
              <div className="detail-row"><span>Requested Payout:</span> <strong>{documentUploads.payoutOption === 'sms' ? 'Pay via SMS' : documentUploads.payoutOption === 'qr' ? 'QR Scan' : 'N/A'}</strong></div>
              <div className="detail-row"><span>BRE Rules:</span> <strong className="text-success">Passed</strong></div>
              <div className="detail-row"><span>Dedupe Check:</span> <strong className="text-success">Clear</strong></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewQueue;
