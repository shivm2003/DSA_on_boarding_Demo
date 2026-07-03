import React from 'react';
import './DSAPortfolio.css';

// Remove predefined sample data; populate from API/backend instead
const portfolioSummary = [];
const caseList = [];

const DSAPortfolio = () => {
  return (
    <div className="portfolio-page">
      <header className="portfolio-header">
        <div>
          <h1 className="page-title">DSA Portfolio & Performance</h1>
          <p className="text-muted">Review monthly performance metrics and current case status at a glance.</p>
        </div>
      </header>

      <div className="portfolio-summary-grid">
        {portfolioSummary.map((item) => (
          <div key={item.title} className={`summary-card glass-panel ${item.variant}`}>
            <div className="summary-card-top">
              <span className="summary-card-title">{item.title}</span>
              <span className="summary-card-value">{item.value}</span>
            </div>
            <p className="summary-card-subtitle">{item.subtitle}</p>
          </div>
        ))}
      </div>

      <section className="portfolio-cases glass-panel">
        <div className="portfolio-cases-header">
          <h2>Active Leads</h2>
          <p className="text-muted">Latest lead cases for the current month.</p>
        </div>

        <div className="table-wrapper">
          <table className="cases-table">
            <thead>
              <tr>
                <th>Lead ID</th>
                <th>Name</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {caseList.map((caseItem) => (
                <tr key={caseItem.id}>
                  <td>{caseItem.id}</td>
                  <td>{caseItem.name}</td>
                  <td>{caseItem.amount}</td>
                  <td>
                    <span className={`status-pill status-${caseItem.status.replace(/\s+/g, '-').toLowerCase()}`}>
                      {caseItem.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default DSAPortfolio;
