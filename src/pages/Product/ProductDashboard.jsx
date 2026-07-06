import React, { useState, useEffect } from 'react';
import { ArrowRight, TrendingUp, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import './ProductDashboard.css';

const ProductDashboard = () => {
  const [recentPending, setRecentPending] = useState([]);
  const [metrics, setMetrics] = useState({
    totalApplications: 0,
    pendingReview: 0,
    approvedApplications: 0,
    returnedApplications: 0,
    salesforcePending: 0,
    salesforceCompleted: 0,
    salesforceFailed: 0,
    todaysApprovals: 0,
    monthlyApprovals: 0
  });

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/product/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setMetrics(data.metrics);
          setRecentPending(data.recentApplications);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };
    fetchSubmissions();
  }, []);

  return (
    <div className="product-dashboard-page" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h1 className="page-title" style={{ margin: 0 }}>Product Team Dashboard</h1>
      
      <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <div className="metric-card glass-panel">
          <h3>Total Applications</h3>
          <div className="metric-value">{metrics.totalApplications}</div>
          <div className="metric-trend text-muted">All time</div>
        </div>
        
        <div className="metric-card glass-panel">
          <h3>Pending Review</h3>
          <div className="metric-value">{metrics.pendingReview}</div>
          <div className="metric-trend warning">Needs Action</div>
        </div>
        
        <div className="metric-card glass-panel">
          <h3>Approved DSAs</h3>
          <div className="metric-value">{metrics.approvedApplications}</div>
          <div className="metric-trend positive">Fully onboarded</div>
        </div>

        <div className="metric-card glass-panel">
          <h3>Returned to CM</h3>
          <div className="metric-value">{metrics.returnedApplications}</div>
          <div className="metric-trend danger">Queries Raised</div>
        </div>

        <div className="metric-card glass-panel">
          <h3>Salesforce Pending</h3>
          <div className="metric-value">{metrics.salesforcePending}</div>
          <div className="metric-trend warning">Integration Q</div>
        </div>

        <div className="metric-card glass-panel">
          <h3>Salesforce Success</h3>
          <div className="metric-value">{metrics.salesforceCompleted}</div>
          <div className="metric-trend positive">Sync Complete</div>
        </div>
      </div>
      
      <div className="dashboard-content" style={{ display: 'flex', gap: '1.5rem' }}>
        <div className="content-section glass-panel flex-grow" style={{ flex: 2 }}>
          <div className="flex justify-between items-center mb-6 pb-3 border-bottom" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
            <h2 className="m-0" style={{ border: 'none', padding: 0, margin: 0, fontSize: '1.25rem' }}>Recent Pending Items</h2>
            <NavLink to="/product/pending-items" className="text-sm font-semibold flex items-center gap-1" style={{ color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <ArrowRight size={16} />
            </NavLink>
          </div>
          <div className="table-wrapper" style={{ overflowX: 'auto' }}>
            <table className="dashboard-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>App ID</th>
                  <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>DSA Name</th>
                  <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Date</th>
                  <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPending.map((app) => (
                  <tr key={app.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px 8px' }}><strong>{app.id}</strong></td>
                    <td style={{ padding: '12px 8px' }}>{app.name}</td>
                    <td style={{ padding: '12px 8px' }}>{app.date}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <span className={`status-badge status-${app.status.replace(/\s+/g, '-').toLowerCase()}`} style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                        <Clock size={12} className="mr-1 inline-block" style={{ marginRight: '4px' }} />
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentPending.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No pending items currently.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDashboard;
