import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Clock, Eye, Edit3, Save, X, History, FileText, CheckCircle, Search, Filter, RefreshCw, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import './ProductDashboard.css';

const ProductPendingItems = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    priority: 'All'
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Quick Preview
  const [previewApp, setPreviewApp] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem('token');
      // In a real app with 10k+ records, we'd pass search & filters to backend
      const response = await fetch('http://localhost:5000/api/product/pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      } else {
        setError('Unable to load Product Queue.');
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
      setError('Unable to load Product Queue.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // Compute Priority (Mock logic: based on forward date, but we use random for demo if date missing)
  const getPriority = (app) => {
    // Basic logic: if status is 'Send to Product', wait time determines priority.
    // For demo, we'll assign random priorities or just base it on ID length.
    return 'Medium'; 
  };

  // Filter and Search Logic
  const filteredApps = applications.filter(app => {
    // Search Term Filter (ID, Company, Applicant, PAN, Mobile, Email, GST)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const company = (app.data?.companyDetails?.companyName || app.name || '').toLowerCase();
      const applicant = (app.data?.applicantDetails?.name || '').toLowerCase();
      const pan = (app.data?.businessKyc?.panNumber || '').toLowerCase();
      const mobile = (app.data?.contactVerification?.phone || '').toLowerCase();
      const email = (app.data?.contactVerification?.email || '').toLowerCase();
      
      if (!app.id.toLowerCase().includes(term) && 
          !company.includes(term) && 
          !applicant.includes(term) && 
          !pan.includes(term) && 
          !mobile.includes(term) && 
          !email.includes(term)) {
        return false;
      }
    }
    return true;
  });

  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
  const currentApps = filteredApps.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const renderStatusBadge = (status) => {
    let colorClass = 'status-default';
    if (status === 'Send to Product') colorClass = 'status-send-to-product'; // blue
    if (status === 'Returned' || status === 'Query Raised') colorClass = 'status-returned'; // orange
    if (status === 'Approved') colorClass = 'status-approved'; // green
    if (status === 'Salesforce Pending') colorClass = 'status-sf-pending'; // purple
    if (status === 'Salesforce Failed') colorClass = 'status-sf-failed'; // red

    return (
      <span className={`status-badge ${colorClass}`} style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
        <Clock size={12} className="mr-1 inline-block" />
        {status}
      </span>
    );
  };

  const renderPriorityBadge = (app) => {
    const priority = getPriority(app);
    let color = 'var(--text-muted)';
    if (priority === 'High') color = 'var(--danger)';
    if (priority === 'Medium') color = 'var(--warning)';
    if (priority === 'Low') color = 'var(--success)';
    return <span style={{ color, fontWeight: 'bold' }}>{priority}</span>;
  };

  return (
    <div className="product-dashboard-page" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-bottom" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div>
          <h1 className="page-title m-0" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Product Review Queue 
            <span className="badge" style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>
              {filteredApps.length}
            </span>
          </h1>
          <p className="text-muted mt-1 text-sm">Last updated: {new Date().toLocaleTimeString()}</p>
        </div>
        <div>
          <button className="btn btn-outline flex items-center gap-2" onClick={fetchSubmissions}>
            <RefreshCw size={16} className={loading ? "spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="search-section" style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search by App ID, Company, PAN, Mobile, Email..." 
            value={searchTerm}
            onChange={handleSearch}
            style={{ paddingLeft: '2.5rem', width: '100%', maxWidth: '500px' }}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="glass-panel" style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
        {error ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--danger)' }}>
            <AlertTriangle size={32} style={{ margin: '0 auto 1rem' }} />
            <p>{error}</p>
            <button className="btn btn-primary mt-2" onClick={fetchSubmissions}>Retry</button>
          </div>
        ) : loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw size={32} className="spin" style={{ margin: '0 auto 1rem' }} />
            <p>Loading Product Queue...</p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CheckCircle size={48} style={{ margin: '0 auto 1rem', color: 'var(--success)', opacity: 0.5 }} />
            <h3 style={{ margin: '0 0 0.5rem 0' }}>All caught up!</h3>
            <p>No applications are currently waiting for Product Review.</p>
          </div>
        ) : (
          <>
            <div className="table-wrapper" style={{ overflowX: 'auto' }}>
              <table className="dashboard-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', whiteSpace: 'nowrap' }}>
                    <th style={{ padding: '16px' }}>App ID</th>
                    <th style={{ padding: '16px' }}>Company Name</th>
                    <th style={{ padding: '16px' }}>Applicant</th>
                    <th style={{ padding: '16px' }}>PAN</th>
                    <th style={{ padding: '16px' }}>Mobile</th>
                    <th style={{ padding: '16px' }}>Forward Date</th>
                    <th style={{ padding: '16px' }}>Priority</th>
                    <th style={{ padding: '16px' }}>Status</th>
                    <th style={{ padding: '16px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentApps.map((app) => {
                    const companyName = app.data?.companyDetails?.companyName || app.name || 'N/A';
                    const applicant = app.data?.applicantDetails?.name || 'N/A';
                    const pan = app.data?.businessKyc?.panNumber || 'N/A';
                    const mobile = app.data?.contactVerification?.phone || 'N/A';
                    const forwardDate = app.date || 'N/A';

                    return (
                      <tr key={app.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '16px' }}><strong>{app.id}</strong></td>
                        <td style={{ padding: '16px' }}>{companyName}</td>
                        <td style={{ padding: '16px' }}>{applicant}</td>
                        <td style={{ padding: '16px' }}>{pan}</td>
                        <td style={{ padding: '16px' }}>{mobile}</td>
                        <td style={{ padding: '16px' }}>{forwardDate}</td>
                        <td style={{ padding: '16px' }}>{renderPriorityBadge(app)}</td>
                        <td style={{ padding: '16px' }}>{renderStatusBadge(app.status)}</td>
                        <td style={{ padding: '16px' }}>
                          <div className="flex gap-2">
                            <button className="btn btn-outline btn-sm flex items-center gap-1" onClick={() => setPreviewApp(app)} title="Quick Preview">
                              <Eye size={14} /> 
                            </button>
                            <button className="btn btn-primary btn-sm flex items-center gap-1" onClick={() => navigate(`/product/application/${app.id}`)} title="Open Application">
                              Open
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="pagination" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="text-muted text-sm">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredApps.length)} of {filteredApps.length} entries
              </div>
              <div className="flex gap-1">
                <button 
                  className="btn btn-outline btn-sm" 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="btn btn-outline btn-sm" style={{ pointerEvents: 'none', background: 'rgba(255,255,255,0.05)' }}>
                  {currentPage} / {totalPages}
                </span>
                <button 
                  className="btn btn-outline btn-sm" 
                  disabled={currentPage === totalPages} 
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Quick Preview Modal */}
      {previewApp && (
        <div className="modal-overlay" onClick={() => setPreviewApp(null)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', width: '100%' }}>
            <div className="modal-header flex justify-between items-center mb-4 border-bottom pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <h2 className="m-0">Quick Preview: {previewApp.id}</h2>
              <button className="btn btn-outline btn-sm" onClick={() => setPreviewApp(null)}><X size={16} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div><span className="text-muted w-32 inline-block">Company:</span> <strong>{previewApp.data?.companyDetails?.companyName || previewApp.name}</strong></div>
              <div><span className="text-muted w-32 inline-block">Applicant:</span> <strong>{previewApp.data?.applicantDetails?.name || 'N/A'}</strong></div>
              <div><span className="text-muted w-32 inline-block">Status:</span> {renderStatusBadge(previewApp.status)}</div>
              <div><span className="text-muted w-32 inline-block">Forward Date:</span> <strong>{previewApp.date}</strong></div>
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                <p className="text-sm text-muted m-0 mb-2">Recent Remarks:</p>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                  {previewApp.remarksHistory && previewApp.remarksHistory.length > 0 
                    ? previewApp.remarksHistory[previewApp.remarksHistory.length - 1].remarks
                    : 'No remarks found.'}
                </div>
              </div>
            </div>
            <div className="modal-actions mt-4 flex justify-end gap-2">
              <button className="btn btn-outline" onClick={() => setPreviewApp(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => navigate(`/product/application/${previewApp.id}`)}>Open Full Application</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductPendingItems;
