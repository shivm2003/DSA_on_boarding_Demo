import React from 'react';
import './Dashboard.css';

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
        <div className="content-section glass-panel">
          <h2>Recent Applications</h2>
          <div className="empty-state">
            <p>Loading recent applications...</p>
          </div>
        </div>
        
        <div className="content-section glass-panel">
          <h2>Performance Portfolio</h2>
          <div className="empty-state">
            <p>Loading performance data...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
