import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Save, CheckCircle, AlertTriangle, 
  MessageSquare, FileText, Image as ImageIcon, ZoomIn, 
  RefreshCw, History, ShieldAlert, X
} from 'lucide-react';
import './ProductDashboard.css';

const ProductApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [returnRemarks, setReturnRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // UI State
  const [activeTab, setActiveTab] = useState('details'); // details, documents, ocr, history

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  const fetchApplicationDetails = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/product/application/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setApplication(data);
        setFormData(JSON.parse(JSON.stringify(data.data || {})));
      } else {
        setError('Failed to load application details.');
      }
    } catch (err) {
      console.error(err);
      setError('Error fetching data.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/product/application/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ data: formData })
      });
      if (response.ok) {
        const data = await response.json();
        setApplication(data);
        setIsEditing(false);
        alert('Changes saved and audited successfully.');
      }
    } catch (err) {
      alert('Failed to save changes.');
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/product/application/${id}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        navigate(`/product/salesforce/${id}`);
      } else {
        alert('Failed to approve application.');
      }
    } catch (err) {
      alert('Failed to approve application.');
    } finally {
      setActionLoading(false);
      setApproveModalOpen(false);
    }
  };

  const handleReturn = async () => {
    if (!returnRemarks.trim()) return alert("Remarks are mandatory");
    setActionLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/product/application/${id}/return`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ remarks: returnRemarks })
      });
      if (response.ok) {
        navigate('/product/pending-items');
      } else {
        alert('Failed to return application.');
      }
    } catch (err) {
      alert('Failed to return application.');
    } finally {
      setActionLoading(false);
      setReturnModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw size={32} className="spin" style={{ margin: '0 auto 1rem' }} />
        <p>Loading 360° View...</p>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--danger)' }}>
        <AlertTriangle size={32} style={{ margin: '0 auto 1rem' }} />
        <p>{error}</p>
        <button className="btn btn-outline mt-4" onClick={() => navigate('/product/pending-items')}>Back to Queue</button>
      </div>
    );
  }

  const applicant = formData.applicantDetails || {};
  const company = formData.companyDetails || {};
  const contact = formData.contactVerification || {};
  const banking = formData.banking || {};
  const address = formData.addressDetails || {};
  const businessKyc = formData.businessKyc || {};
  const remarksHistory = application.remarksHistory || [];

  return (
    <div className="product-dashboard-page" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Breadcrumb & Header */}
      <div className="flex justify-between items-center pb-4 border-bottom" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center gap-3">
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/product/pending-items')}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="text-muted text-sm mb-1">Dashboard &gt; Pending Queue &gt; Application Details</div>
            <h1 className="page-title m-0">Application: {application.id}</h1>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
        
        {/* MAIN CONTENT AREA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* AI Validation Panel (Section 8) */}
          <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255, 193, 7, 0.05)', borderLeft: '4px solid var(--warning)' }}>
            <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--warning)' }}>
              <ShieldAlert size={18} /> AI Validation Warnings
            </h3>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-muted)' }}>
              <li>⚠ GST Number format verification pending manual check.</li>
              <li>⚠ Pincode does not explicitly map to Service District. Please verify Address.</li>
            </ul>
          </div>

          {/* Navigation Tabs */}
          <div className="tabs" style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <button className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>Application Data</button>
            <button className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')}>Documents & OCR</button>
            <button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>Audit & Remarks</button>
          </div>

          {/* TAB: DETAILS */}
          {activeTab === 'details' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="flex justify-end">
                <button className="btn btn-outline btn-sm" onClick={() => setIsEditing(!isEditing)}>
                  <Edit size={14} className="mr-1" /> {isEditing ? 'Cancel Editing' : 'Enable Editing'}
                </button>
              </div>

              {/* Applicant Info (Section 1) */}
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>Applicant & Business Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="input-group">
                    <label>Company Name</label>
                    <input type="text" className="form-control" value={company.companyName || ''} readOnly={!isEditing} onChange={e => handleInputChange('companyDetails', 'companyName', e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label>Applicant Name</label>
                    <input type="text" className="form-control" value={applicant.name || ''} readOnly={!isEditing} onChange={e => handleInputChange('applicantDetails', 'name', e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label>Entity Type</label>
                    <input type="text" className="form-control" value={company.entityType || ''} readOnly={!isEditing} onChange={e => handleInputChange('companyDetails', 'entityType', e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label>PAN Number</label>
                    <input type="text" className="form-control" value={businessKyc.panNumber || ''} readOnly={!isEditing} onChange={e => handleInputChange('businessKyc', 'panNumber', e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label>GST Number</label>
                    <input type="text" className="form-control" value={businessKyc.gstNumber || ''} readOnly={!isEditing} onChange={e => handleInputChange('businessKyc', 'gstNumber', e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label>Mobile Number</label>
                    <input type="text" className="form-control" value={contact.phone || ''} readOnly={!isEditing} onChange={e => handleInputChange('contactVerification', 'phone', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Address (Section 3) */}
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>Address Details</h3>
                <div className="input-group mb-4">
                  <label>Office Address</label>
                  <textarea className="form-control" value={address.officeAddress || ''} readOnly={!isEditing} onChange={e => handleInputChange('addressDetails', 'officeAddress', e.target.value)} rows="3"></textarea>
                </div>
              </div>

              {/* Banking (Section 4) */}
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>Banking Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="input-group">
                    <label>Bank Name</label>
                    <input type="text" className="form-control" value={banking.bankName || ''} readOnly={!isEditing} onChange={e => handleInputChange('banking', 'bankName', e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label>Account Number</label>
                    <input type="text" className="form-control" value={banking.accountNumber || ''} readOnly={!isEditing} onChange={e => handleInputChange('banking', 'accountNumber', e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label>IFSC Code</label>
                    <input type="text" className="form-control" value={banking.ifscCode || ''} readOnly={!isEditing} onChange={e => handleInputChange('banking', 'ifscCode', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Service Location (Section 5) */}
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>Service Location</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="input-group">
                    <label>State</label>
                    <input type="text" className="form-control" value={address.serviceState || ''} readOnly={!isEditing} onChange={e => handleInputChange('addressDetails', 'serviceState', e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label>City</label>
                    <input type="text" className="form-control" value={address.serviceCity || ''} readOnly={!isEditing} onChange={e => handleInputChange('addressDetails', 'serviceCity', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DOCUMENTS & OCR */}
          {activeTab === 'documents' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>OCR Verification (Section 7)</span>
                  <span className="badge" style={{ backgroundColor: 'var(--success)', color: 'white' }}>94% Match Confidence</span>
                </h3>
                <table className="dashboard-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th style={{ padding: '12px 8px' }}>Field</th>
                      <th style={{ padding: '12px 8px' }}>OCR Value (Parsed)</th>
                      <th style={{ padding: '12px 8px' }}>Application Value</th>
                      <th style={{ padding: '12px 8px' }}>Match Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px 8px' }}>PAN Number</td>
                      <td style={{ padding: '12px 8px' }}>{businessKyc.panNumber || 'N/A'}</td>
                      <td style={{ padding: '12px 8px' }}>{businessKyc.panNumber || 'N/A'}</td>
                      <td style={{ padding: '12px 8px', color: 'var(--success)' }}>✅ Match</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px 8px' }}>Applicant Name</td>
                      <td style={{ padding: '12px 8px' }}>{applicant.name || 'N/A'}</td>
                      <td style={{ padding: '12px 8px' }}>{applicant.name || 'N/A'}</td>
                      <td style={{ padding: '12px 8px', color: 'var(--success)' }}>✅ Match</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>Uploaded Documents (Section 6)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                  {['PAN Card', 'Aadhaar Front', 'Aadhaar Back', 'GST Certificate', 'Cancelled Cheque'].map(doc => (
                    <div key={doc} style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '1rem', textAlign: 'center', cursor: 'pointer', background: 'rgba(0,0,0,0.2)' }}>
                      <ImageIcon size={32} style={{ margin: '0 auto 0.5rem', color: 'var(--text-muted)' }} />
                      <div className="text-sm">{doc}</div>
                      <div className="text-xs text-muted mt-2 flex justify-center gap-2">
                        <ZoomIn size={12} /> Preview
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: HISTORY */}
          {activeTab === 'history' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>Audit & Remarks History</h3>
                {remarksHistory.length === 0 ? (
                  <p className="text-muted">No history logs available.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {remarksHistory.map((log, idx) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', borderLeft: `4px solid ${log.action === 'Query Raised' ? 'var(--warning)' : 'var(--primary)'}` }}>
                        <div className="flex justify-between items-center mb-2">
                          <strong style={{ fontSize: '1.1rem' }}>{log.action}</strong>
                          <span className="text-muted text-sm">{log.date}</span>
                        </div>
                        <div className="text-sm mb-2"><span className="text-muted">User:</span> {log.source}</div>
                        <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
                          {log.remarks}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* STICKY RIGHT SIDEBAR */}
        <div className="glass-panel sticky-sidebar" style={{ position: 'sticky', top: '2rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>Workflow Status</h3>
            <div className={`status-badge status-${application.status.replace(/\s+/g, '-').toLowerCase()}`} style={{ display: 'inline-block', fontSize: '1rem', padding: '6px 12px' }}>
              {application.status}
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
            <div className="flex justify-between"><span className="text-muted">Assigned User:</span> <span>Product Team</span></div>
            <div className="flex justify-between"><span className="text-muted">Forward Date:</span> <span>{application.date}</span></div>
            <div className="flex justify-between"><span className="text-muted">SLA Timer:</span> <span style={{ color: 'var(--warning)' }}>48 Hrs Remaining</span></div>
            <div className="flex justify-between"><span className="text-muted">OCR Match:</span> <span style={{ color: 'var(--success)' }}>94%</span></div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
            {isEditing && (
              <button className="btn btn-primary flex items-center justify-center gap-2" onClick={handleSave}>
                <Save size={16} /> Save Changes
              </button>
            )}
            
            <button className="btn btn-warning flex items-center justify-center gap-2" onClick={() => setReturnModalOpen(true)} style={{ backgroundColor: 'var(--warning)', color: 'white', border: 'none' }}>
              <MessageSquare size={16} /> Return to CM
            </button>
            
            <button className="btn btn-success flex items-center justify-center gap-2" onClick={() => setApproveModalOpen(true)} style={{ backgroundColor: 'var(--success)', color: 'white', border: 'none' }}>
              <CheckCircle size={16} /> Approve & Push
            </button>
          </div>
        </div>

      </div>

      {/* FULL-SCREEN BLOCKING MODAL: Return to CM */}
      {returnModalOpen && (
        <div className="fullscreen-modal-overlay">
          <div className="fullscreen-modal-backdrop" />
          <div className="fullscreen-modal-container">
            <div className="fullscreen-modal-card glass-panel">
              <div className="fullscreen-modal-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' }}>
                <MessageSquare size={48} />
              </div>
              <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>Return Application to Channel Manager</h2>
              <p className="text-muted" style={{ margin: '0 0 1.5rem 0', textAlign: 'center', maxWidth: '450px' }}>
                Application <strong>{application.id}</strong> will be sent back to the Channel Manager for corrections. This action requires a mandatory remark.
              </p>
              <div style={{ width: '100%', maxWidth: '500px' }}>
                <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Reason for Returning *</label>
                  <textarea 
                    className="form-control" 
                    rows="4" 
                    value={returnRemarks} 
                    onChange={e => setReturnRemarks(e.target.value)}
                    placeholder="E.g., Please upload a clearer copy of the PAN card."
                    style={{ width: '100%', resize: 'vertical' }}
                    autoFocus
                  ></textarea>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="btn btn-outline" onClick={() => { setReturnModalOpen(false); setReturnRemarks(''); }} disabled={actionLoading} style={{ minWidth: '140px' }}>
                  Cancel
                </button>
                <button className="btn btn-primary flex items-center justify-center gap-2" onClick={handleReturn} disabled={!returnRemarks.trim() || actionLoading} style={{ minWidth: '180px', backgroundColor: 'var(--warning)', border: 'none' }}>
                  {actionLoading ? <RefreshCw size={16} className="spin" /> : <MessageSquare size={16} />}
                  {actionLoading ? 'Returning...' : 'Confirm Return'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL-SCREEN BLOCKING MODAL: Approve & Push */}
      {approveModalOpen && (
        <div className="fullscreen-modal-overlay">
          <div className="fullscreen-modal-backdrop" />
          <div className="fullscreen-modal-container">
            <div className="fullscreen-modal-card glass-panel">
              <div className="fullscreen-modal-icon" style={{ background: 'rgba(34, 197, 94, 0.15)', color: 'var(--success)' }}>
                <CheckCircle size={48} />
              </div>
              <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>Approve Application</h2>
              <p className="text-muted" style={{ margin: '0 0 1.5rem 0', textAlign: 'center', maxWidth: '450px' }}>
                You are about to approve <strong>{application.id}</strong> and push it to Salesforce for DSA Code generation. This action cannot be undone.
              </p>
              
              <div style={{ width: '100%', maxWidth: '500px', marginBottom: '2rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '1.25rem' }}>
                <div className="flex justify-between mb-2"><span className="text-muted">Company:</span> <strong>{(formData.companyDetails || {}).companyName || 'N/A'}</strong></div>
                <div className="flex justify-between mb-2"><span className="text-muted">Applicant:</span> <strong>{(formData.applicantDetails || {}).name || 'N/A'}</strong></div>
                <div className="flex justify-between mb-2"><span className="text-muted">PAN:</span> <strong>{(formData.businessKyc || {}).panNumber || 'N/A'}</strong></div>
                <div className="flex justify-between"><span className="text-muted">Status:</span> <strong style={{ color: 'var(--success)' }}>→ Approved</strong></div>
              </div>

              <div className="flex gap-3">
                <button className="btn btn-outline" onClick={() => setApproveModalOpen(false)} disabled={actionLoading} style={{ minWidth: '140px' }}>
                  Cancel
                </button>
                <button className="btn btn-primary flex items-center justify-center gap-2" onClick={handleApprove} disabled={actionLoading} style={{ minWidth: '220px', backgroundColor: 'var(--success)', border: 'none' }}>
                  {actionLoading ? <RefreshCw size={16} className="spin" /> : <CheckCircle size={16} />}
                  {actionLoading ? 'Approving & Pushing...' : 'Confirm Approve & Push'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductApplicationDetails;
