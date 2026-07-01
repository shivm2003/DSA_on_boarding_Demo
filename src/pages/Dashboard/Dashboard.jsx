import React, { useState, useEffect } from 'react';
import { ArrowRight, TrendingUp, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import './Dashboard.css';

const RECENT_APPLICATIONS = [
  { id: 'APP-001', name: 'Raman Associates', date: '14-04-2026', status: 'Pending' },
  { id: 'APP-002', name: 'Shivam Sharma', date: '15-04-2026', status: 'Query Raised' },
  { id: 'APP-003', name: 'Alok Traders', date: '16-04-2026', status: 'Approved' },
  { id: 'APP-004', name: 'Neha Verma', date: '16-04-2026', status: 'Approved' },
  { id: 'APP-005', name: 'Sanjay Mehta', date: '17-04-2026', status: 'Pending' }
];

const TOP_PERFORMERS = [
  { name: 'Ravi Kapoor', disbursed: '₹6.0L', leads: 54, progress: 85 },
  { name: 'Priya Singh', disbursed: '₹5.1L', leads: 45, progress: 72 },
  { name: 'Amit Sharma', disbursed: '₹4.6L', leads: 40, progress: 65 },
  { name: 'Sanjay Mehta', disbursed: '₹3.8L', leads: 34, progress: 55 },
];

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <h1 className="page-title">Dashboard Overview</h1>
      
      <div className="metrics-grid">
        <div className="metric-card glass-panel">
          <h3>Total Active DSAs</h3>
          <div className="metric-value">24</div>
          <div className="metric-trend positive">+3 this month</div>
        </div>
        
        <div className="metric-card glass-panel">
          <h3>Pending Onboarding</h3>
          <div className="metric-value">12</div>
          <div className="metric-trend warning">Needs Review</div>
        </div>
        
        <div className="metric-card glass-panel">
          <h3>Total Disbursement</h3>
          <div className="metric-value">1.3 Cr</div>
          <div className="metric-trend positive">+15% vs last month</div>
        </div>
        
        <div className="metric-card glass-panel">
          <h3>Queries Raised</h3>
          <div className="metric-value">4</div>
          <div className="metric-trend negative">Requires Action</div>
        </div>
      </div>
      
      <div className="dashboard-content">
        <div className="content-section glass-panel flex-grow">
          <div className="flex justify-between items-center mb-6 pb-3 border-bottom">
            <h2 className="m-0" style={{ border: 'none', padding: 0 }}>Recent Applications</h2>
            <NavLink to="/app/applications" className="text-sm font-semibold flex items-center gap-1" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
              View All <ArrowRight size={16} />
            </NavLink>
          </div>
          <div className="table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>App ID</th>
                  <th>DSA Name</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_APPLICATIONS.map((app) => (
                  <tr key={app.id}>
                    <td><strong>{app.id}</strong></td>
                    <td>{app.name}</td>
                    <td>{app.date}</td>
                    <td>
                      <span className={`status-badge status-${app.status.replace(/\s+/g, '-').toLowerCase()}`}>
                        {app.status === 'Approved' && <CheckCircle size={12} className="mr-1 inline-block" />}
                        {app.status === 'Pending' && <Clock size={12} className="mr-1 inline-block" />}
                        {app.status === 'Query Raised' && <AlertTriangle size={12} className="mr-1 inline-block" />}
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="content-section glass-panel flex-grow">
          <div className="flex justify-between items-center mb-6 pb-3 border-bottom">
            <h2 className="m-0" style={{ border: 'none', padding: 0 }}>Top Performers</h2>
            <NavLink to="/app/dsa-directory" className="text-sm font-semibold flex items-center gap-1" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
              Directory <ArrowRight size={16} />
            </NavLink>
          </div>
          <div className="performers-list">
            {TOP_PERFORMERS.map((performer, idx) => (
              <div key={idx} className="performer-item">
                <div className="performer-info">
                  <div className="performer-name">{performer.name}</div>
                  <div className="performer-stats">
                    <span>{performer.leads} Leads</span>
                    <span className="dot-separator">•</span>
                    <span className="font-semibold text-primary">{performer.disbursed}</span>
                  </div>
                </div>
                <div className="progress-container" title={`${performer.progress}% of target`}>
                  <div className="progress-bar" style={{ width: `${performer.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
