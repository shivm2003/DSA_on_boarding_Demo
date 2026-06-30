import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import './DSADirectory.css';

const DSA_LIST = [
  { code: 'DSA-101', name: 'Amit Sharma', phone: '9876543210', area: 'Gurugram' },
  { code: 'DSA-102', name: 'Neha Verma', phone: '9876543211', area: 'Noida' },
  { code: 'DSA-103', name: 'Ravi Kapoor', phone: '9876543212', area: 'Faridabad' },
  { code: 'DSA-104', name: 'Priya Singh', phone: '9876543213', area: 'Delhi' },
  { code: 'DSA-105', name: 'Sanjay Mehta', phone: '9876543214', area: 'Ghaziabad' }
];

const PERFORMANCE_DATA = {
  'DSA-101': {
    months: [
      { name: 'April', leads: 32, disbursed: '₹4.1L' },
      { name: 'May', leads: 42, disbursed: '₹5.3L' },
      { name: 'June', leads: 54, disbursed: '₹6.0L' }
    ]
  },
  'DSA-102': {
    months: [
      { name: 'April', leads: 20, disbursed: '₹3.2L' },
      { name: 'May', leads: 35, disbursed: '₹4.0L' },
      { name: 'June', leads: 40, disbursed: '₹4.6L' }
    ]
  },
  'DSA-103': {
    months: [
      { name: 'April', leads: 28, disbursed: '₹2.9L' },
      { name: 'May', leads: 31, disbursed: '₹3.4L' },
      { name: 'June', leads: 45, disbursed: '₹5.1L' }
    ]
  },
  'DSA-104': {
    months: [
      { name: 'April', leads: 14, disbursed: '₹1.8L' },
      { name: 'May', leads: 22, disbursed: '₹2.4L' },
      { name: 'June', leads: 30, disbursed: '₹3.5L' }
    ]
  },
  'DSA-105': {
    months: [
      { name: 'April', leads: 18, disbursed: '₹2.2L' },
      { name: 'May', leads: 27, disbursed: '₹3.1L' },
      { name: 'June', leads: 34, disbursed: '₹3.8L' }
    ]
  }
};

const PENDING_LEADS_DATA = {
  'DSA-101': {
    April: [
      { id: 'LD-1091', name: 'Ravi Gupta', status: 'Document Pending' },
      { id: 'LD-1124', name: 'Kavita Rao', status: 'Bank Verification' }
    ],
    May: [
      { id: 'LD-1148', name: 'Suresh Mehta', status: 'Under Review' },
      { id: 'LD-1155', name: 'Sunita Patel', status: 'Bank Verification' }
    ],
    June: [
      { id: 'LD-1180', name: 'Vikas Yadav', status: 'Document Pending' },
      { id: 'LD-1188', name: 'Asha Gupta', status: 'Under Review' }
    ]
  },
  'DSA-102': {
    April: [
      { id: 'LD-1102', name: 'Meera Joshi', status: 'Document Pending' }
    ],
    May: [
      { id: 'LD-1135', name: 'Ajay Kumar', status: 'Under Review' }
    ],
    June: [
      { id: 'LD-1201', name: 'Nisha Singh', status: 'Bank Verification' }
    ]
  },
  'DSA-103': {
    April: [
      { id: 'LD-1110', name: 'Priya Patel', status: 'Bank Verification' }
    ],
    May: [
      { id: 'LD-1176', name: 'Anil Sharma', status: 'Under Review' }
    ],
    June: [
      { id: 'LD-1210', name: 'Rohit Sharma', status: 'Document Pending' }
    ]
  },
  'DSA-104': {
    April: [
      { id: 'LD-1161', name: 'Sneha Singh', status: 'Document Pending' }
    ],
    May: [
      { id: 'LD-1224', name: 'Rajesh K.', status: 'Bank Verification' }
    ],
    June: [
      { id: 'LD-1230', name: 'Priya N.', status: 'Under Review' }
    ]
  },
  'DSA-105': {
    April: [
      { id: 'LD-1198', name: 'Deepak Jain', status: 'Bank Verification' }
    ],
    May: [
      { id: 'LD-1204', name: 'Manisha S.', status: 'Under Review' }
    ],
    June: [
      { id: 'LD-1242', name: 'Amit K.', status: 'Document Pending' }
    ]
  }
};

const DSADirectory = () => {
  const [selectedDsa, setSelectedDsa] = useState(null);
  const [activeMonthIndex, setActiveMonthIndex] = useState(0);

  const closeModal = () => {
    setSelectedDsa(null);
    setActiveMonthIndex(0);
  };

  const handleOpenPerformance = (dsa) => {
    setSelectedDsa(dsa);
    setActiveMonthIndex(0);
  };

  const selectedPerformance = selectedDsa ? PERFORMANCE_DATA[selectedDsa.code] : null;
  const activeMonth = selectedPerformance?.months[activeMonthIndex];
  const currentMonthIndex = selectedPerformance ? selectedPerformance.months.length - 1 : -1;
  const currentMonth = selectedPerformance?.months[currentMonthIndex];
  const activePendingLeads = selectedDsa ? PENDING_LEADS_DATA[selectedDsa.code]?.[activeMonth?.name] || [] : [];

  return (
    <div className="directory-page">
      <div className="directory-header">
        <h1 className="page-title">DSA Directory</h1>
        <p className="text-muted">Browse active DSAs with quick access to their performance portfolio.</p>
      </div>

      <div className="glass-panel directory-card">
        <div className="directory-table-wrapper">
          <table className="directory-table">
            <thead>
              <tr>
                <th>DSA Code</th>
                <th>DSA Name</th>
                <th>Phone Number</th>
                <th>Area</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {DSA_LIST.map((dsa) => (
                <tr key={dsa.code}>
                  <td>{dsa.code}</td>
                  <td>{dsa.name}</td>
                  <td>{dsa.phone}</td>
                  <td>{dsa.area}</td>
                  <td>
                    <button
                      type="button"
                      className="icon-button"
                      onClick={() => handleOpenPerformance(dsa)}
                      aria-label={`Open performance for ${dsa.name}`}
                    >
                      <ArrowRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedDsa && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-dialog glass-panel" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{selectedDsa.name} Performance</h2>
                <p className="text-muted">Review last 3 months of leads and disbursed amounts.</p>
              </div>
              <button className="btn btn-outline btn-sm" type="button" onClick={closeModal}>
                Close
              </button>
            </div>

            <div className="month-filter">
              {selectedPerformance?.months.map((month, index) => (
                <button
                  key={month.name}
                  type="button"
                  className={`month-chip ${activeMonthIndex === index ? 'active' : ''}`}
                  onClick={() => setActiveMonthIndex(index)}
                >
                  {month.name}
                </button>
              ))}
            </div>

            {activeMonth ? (
              <>
                <div className="performance-summary-grid">
                  <div className="performance-summary-card">
                    <span className="summary-label">Number of Leads</span>
                    <strong>{activeMonth.leads}</strong>
                  </div>
                  <div className="performance-summary-card">
                    <span className="summary-label">Amount Disbursed</span>
                    <strong>{activeMonth.disbursed}</strong>
                  </div>
                </div>

                <div className="pending-leads-section">
                  <div className="pending-leads-header">
                    <div>
                      <h3>
                        {activeMonthIndex === currentMonthIndex ? 'Pending Leads' : 'Completed Leads'} for {activeMonth.name}
                        {activeMonthIndex === currentMonthIndex ? (
                          <span className="current-month-tag">Current Month</span>
                        ) : null}
                      </h3>
                      <p className="text-muted">
                        {activeMonthIndex === currentMonthIndex
                          ? 'Only current month pending leads are shown below.'
                          : 'Previous month leads are shown as completed.'}
                      </p>
                    </div>
                    <span className="pending-count">
                      {activePendingLeads.length} {activeMonthIndex === currentMonthIndex ? 'pending' : 'completed'}
                    </span>
                  </div>

                  <div className="table-wrapper">
                    <table className="pending-leads-table">
                      <thead>
                        <tr>
                          <th>Lead ID</th>
                          <th>Name</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activePendingLeads.map((lead) => (
                          <tr key={lead.id}>
                            <td>{lead.id}</td>
                            <td>{lead.name}</td>
                            <td>
                              <span className={`status-pill status-${(activeMonthIndex === currentMonthIndex ? lead.status : 'completed').replace(/\s+/g, '-').toLowerCase()}`}>
                                {activeMonthIndex === currentMonthIndex ? lead.status : 'Completed'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default DSADirectory;
