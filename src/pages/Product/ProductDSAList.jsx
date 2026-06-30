import { useState } from 'react';
import { Menu } from 'lucide-react';
import './ProductDashboard.css';

const DSA_LIST = [
  {
    code: 'DSA-101',
    name: 'Amit Sharma',
    mobile: '9876543210',
    branch: 'Gurugram',
    created: '10-03-2026',
    expiry: '10-03-2027',
    vendorName: 'ABCD1234',
    vendorCategory: 'Company',
    incorporationDate: '01-01-2001',
    designation: 'Managing Director',
    phone: '9876543210',
    email: 'ABC@gmail.com',
    registeredAddress: 'F292 Pashchim vihar, Geeta colony',
    servingState: 'Delhi,Haryana',
    servingCity: 'Dwarka, Gurugram',
    servingBranch: 'Delhi 1, Gurugram 1',
    alternateContact: '9876543210',
    annualTurnover: '739383',
    yearsExperience: '39',
    keyClients: 'HDFC',
    referenceName: 'Shashi',
    referenceRelationship: 'Partner',
    referenceContact: '9876543210',
    referenceEmail: 'ABC@gmail.com',
    assessedByName: 'Hemant',
    assessedByDepartment: 'Sales',
    assessedByDesignation: 'RO',
    assessedByDate: '13-02-2001',
    spocName: 'Devesh',
    spocDesignation: 'Business owner',
    spocPhone: '9876543210',
    spocEmail: 'ABCE@gmail.com',
    empanelmentDate: '13-01-2001',
    idProofType: 'Aadhaar',
    idProofNumber: 'XXXXXXXX2828',
    addressProofType: 'Aadhaar',
    addressProofNumber: 'XXXXXXXX2737',
    panNumber: 'MLBPS2828Q',
    gstNumber: 'Maharastra',
    msmeNumber: 'UDYAM-00-000000',
    incomeProof: 'ITR',
    msmeRegistered: 'Yes',
    cancelledCheque: 'Cheques uploaded',
    cv: 'CV Uploaded',
    bankAccountHolder: 'Raman',
    bankAccountNumber: 'xxxxxxx3210',
    bankBranch: 'Delhi 1',
    bankIFSC: 'PUNCC203032',
    payoutOptedFor: '5%',
    payoutStatus: 'Approved',
    signedDocument: 'Signed Document',
    remarks: 'Enter remarks here...',
    verifiedDocs: {
      pan: true,
      udyam: true,
      dedupe: true,
      gst: true
    }
  },
  {
    code: 'DSA-102',
    name: 'Neha Verma',
    mobile: '9876543211',
    branch: 'Noida',
    created: '22-04-2026',
    expiry: '22-04-2027'
  },
  {
    code: 'DSA-103',
    name: 'Ravi Kapoor',
    mobile: '9876543212',
    branch: 'Faridabad',
    created: '03-05-2026',
    expiry: '03-05-2027'
  }
];

const ProductDSAList = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDSA, setSelectedDSA] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusAction, setStatusAction] = useState('');
  const [statusRemarks, setStatusRemarks] = useState('');

  const toggleDropdown = (code) => {
    setActiveDropdown(activeDropdown === code ? null : code);
  };

  const openEditModal = (dsa) => {
    setSelectedDSA(dsa);
    setEditModalOpen(true);
    setActiveDropdown(null);
  };

  const openStatusModal = (action, dsa) => {
    setSelectedDSA(dsa);
    setStatusAction(action);
    setStatusRemarks('');
    setStatusModalOpen(true);
    setActiveDropdown(null);
  };

  const closeStatusModal = () => {
    setStatusModalOpen(false);
    setStatusAction('');
    setStatusRemarks('');
    setSelectedDSA(null);
  };

  const saveStatus = () => {
    // For now update the selectedDSA locally and close modal.
    setSelectedDSA((prev) => prev ? { ...prev, status: statusAction, remarks: statusRemarks } : prev);
    // TODO: persist change to backend/store if needed
    setStatusModalOpen(false);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedDSA(null);
  };

  const handleInputChange = (field, value) => {
    setSelectedDSA((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="product-dashboard-page">
      <div className="page-heading-row">
        <div>
          <h1 className="page-title">DSA List</h1>
          <p className="text-muted">View and manage the registered DSAs in the product module.</p>
        </div>
      </div>

      <div className="table-card glass-panel">
        <div className="table-wrapper">
          <table className="standard-table">
            <thead>
              <tr>
                <th>DSA Code</th>
                <th>Name</th>
                <th>Mobile Number</th>
                <th>Branch</th>
                <th>Created Date</th>
                <th>Expiry Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {DSA_LIST.map((dsa) => (
                <tr key={dsa.code}>
                  <td>{dsa.code}</td>
                  <td>{dsa.name}</td>
                  <td>{dsa.mobile}</td>
                  <td>{dsa.branch}</td>
                  <td>{dsa.created}</td>
                  <td>{dsa.expiry}</td>
                  <td className="actions-cell">
                    <button
                      type="button"
                      className="icon-button"
                      onClick={() => toggleDropdown(dsa.code)}
                      aria-label={`Open actions for ${dsa.name}`}
                    >
                      <Menu size={18} />
                    </button>
                    {activeDropdown === dsa.code && (
                      <div className="dropdown-menu">
                        <button type="button" className="dropdown-item" onClick={() => openEditModal(dsa)}>Edit</button>
                        <button type="button" className="dropdown-item" onClick={() => openStatusModal('Deactivate', dsa)}>Deactivate</button>
                        <button type="button" className="dropdown-item" onClick={() => openStatusModal('Hold', dsa)}>Hold</button>
                        <button type="button" className="dropdown-item">Active</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editModalOpen && selectedDSA && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-dialog glass-panel" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit DSA Details</h2>
              <button className="btn btn-outline btn-sm" type="button" onClick={closeEditModal}>Close</button>
            </div>
            <div className="modal-body">
              <section className="modal-section">
                <h3>Company and Vendor Details</h3>
                <div className="field-grid">
                  <div className="field">
                    <label>Company / Vendor name</label>
                    <input type="text" value={selectedDSA.vendorName || ''} onChange={(e) => handleInputChange('vendorName', e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Vendor Category</label>
                    <input type="text" value={selectedDSA.vendorCategory || ''} onChange={(e) => handleInputChange('vendorCategory', e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Date of Incorporation / DOB</label>
                    <input type="text" value={selectedDSA.incorporationDate || ''} onChange={(e) => handleInputChange('incorporationDate', e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Designation</label>
                    <input type="text" value={selectedDSA.designation || ''} onChange={(e) => handleInputChange('designation', e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Phone Number</label>
                    <input type="text" value={selectedDSA.phone || ''} onChange={(e) => handleInputChange('phone', e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Email Address</label>
                    <input type="email" value={selectedDSA.email || ''} onChange={(e) => handleInputChange('email', e.target.value)} />
                  </div>
                  <div className="field field-full">
                    <label>Registered Address</label>
                    <input type="text" value={selectedDSA.registeredAddress || ''} onChange={(e) => handleInputChange('registeredAddress', e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Select Serving State(s)</label>
                    <input type="text" value={selectedDSA.servingState || ''} onChange={(e) => handleInputChange('servingState', e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Select Serving City(s)</label>
                    <input type="text" value={selectedDSA.servingCity || ''} onChange={(e) => handleInputChange('servingCity', e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Select Serving Branch's</label>
                    <input type="text" value={selectedDSA.servingBranch || ''} onChange={(e) => handleInputChange('servingBranch', e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Alternate Contact Number</label>
                    <input type="text" value={selectedDSA.alternateContact || ''} onChange={(e) => handleInputChange('alternateContact', e.target.value)} />
                  </div>
                </div>
              </section>

              <section className="modal-section">
                <h3>Business Details</h3>
                <div className="field-grid">
                  <div className="field">
                    <label>Vendor Annual Turnover (INR)</label>
                    <input type="text" value={selectedDSA.annualTurnover || ''} onChange={(e) => handleInputChange('annualTurnover', e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Years of Experience</label>
                    <input type="text" value={selectedDSA.yearsExperience || ''} onChange={(e) => handleInputChange('yearsExperience', e.target.value)} />
                  </div>
                  <div className="field field-full">
                    <label>Key clients worked with</label>
                    <input type="text" value={selectedDSA.keyClients || ''} onChange={(e) => handleInputChange('keyClients', e.target.value)} />
                  </div>
                </div>
              </section>

              <section className="modal-section">
                <h3>Reference Details</h3>
                <div className="field-grid">
                  <div className="field">
                    <label>Reference Name</label>
                    <input type="text" value={selectedDSA.referenceName || ''} onChange={(e) => handleInputChange('referenceName', e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Relationship with Vendor</label>
                    <input type="text" value={selectedDSA.referenceRelationship || ''} onChange={(e) => handleInputChange('referenceRelationship', e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Contact Details</label>
                    <input type="text" value={selectedDSA.referenceContact || ''} onChange={(e) => handleInputChange('referenceContact', e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Email ID</label>
                    <input type="email" value={selectedDSA.referenceEmail || ''} onChange={(e) => handleInputChange('referenceEmail', e.target.value)} />
                  </div>
                </div>
              </section>

              <section className="modal-section">
                <h3>Vendor Met & Assessed By</h3>
                <div className="field-grid">
                  <div className="field">
                    <label>Employee Name</label>
                    <input type="text" value={selectedDSA.assessedByName || ''} onChange={(e) => handleInputChange('assessedByName', e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Department</label>
                    <input type="text" value={selectedDSA.assessedByDepartment || ''} onChange={(e) => handleInputChange('assessedByDepartment', e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Designation</label>
                    <input type="text" value={selectedDSA.assessedByDesignation || ''} onChange={(e) => handleInputChange('assessedByDesignation', e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Date of Meeting</label>
                    <input type="text" value={selectedDSA.assessedByDate || ''} onChange={(e) => handleInputChange('assessedByDate', e.target.value)} />
                  </div>
                </div>
              </section>

              <section className="modal-section">
                <h3>ISFC SPOC Details</h3>
                <div className="field-grid">
                  <div className="field">
                    <label>SPOC Name</label>
                    <input type="text" value={selectedDSA.spocName || ''} onChange={(e) => handleInputChange('spocName', e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Designation</label>
                    <input type="text" value={selectedDSA.spocDesignation || ''} onChange={(e) => handleInputChange('spocDesignation', e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Phone Number</label>
                    <input type="text" value={selectedDSA.spocPhone || ''} onChange={(e) => handleInputChange('spocPhone', e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Email ID</label>
                    <input type="email" value={selectedDSA.spocEmail || ''} onChange={(e) => handleInputChange('spocEmail', e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Date of Empanelment Request</label>
                    <input type="text" value={selectedDSA.empanelmentDate || ''} onChange={(e) => handleInputChange('empanelmentDate', e.target.value)} />
                  </div>
                </div>
              </section>

              <section className="modal-section">
                <h3>KYC Document</h3>
                <div className="field-grid">
                  <div className="field">
                    <label>ID proof type</label>
                    <input type="text" value={selectedDSA.idProofType || ''} onChange={(e) => handleInputChange('idProofType', e.target.value)} />
                  </div>
                  <div className="field">
                    <label>ID proof Number</label>
                    <input type="text" value={selectedDSA.idProofNumber || ''} onChange={(e) => handleInputChange('idProofNumber', e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Address proof type</label>
                    <input type="text" value={selectedDSA.addressProofType || ''} onChange={(e) => handleInputChange('addressProofType', e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Address proof Number</label>
                    <input type="text" value={selectedDSA.addressProofNumber || ''} onChange={(e) => handleInputChange('addressProofNumber', e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Pan number</label>
                    <input type="text" value={selectedDSA.panNumber || ''} onChange={(e) => handleInputChange('panNumber', e.target.value)} />
                  </div>
                  <div className="field">
                    <label>DSA Photo</label>
                    <button type="button" className="view-button">View Photo</button>
                  </div>
                </div>
              </section>

              <section className="modal-section">
                <h3>Business Document</h3>
                <div className="field-grid">
                  <div className="field">
                    <label>GST No</label>
                    <input type="text" value={selectedDSA.gstNumber || ''} onChange={(e) => handleInputChange('gstNumber', e.target.value)} />
                  </div>
                  <div className="field">
                    <label>MSME / Udyam Number</label>
                    <input type="text" value={selectedDSA.msmeNumber || ''} onChange={(e) => handleInputChange('msmeNumber', e.target.value)} />
                  </div>
                  <div className="field">
                    <label>MSME Registered (Yes/No)</label>
                    <input type="text" value={selectedDSA.msmeRegistered || ''} onChange={(e) => handleInputChange('msmeRegistered', e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Cancelled Cheque</label>
                    <button type="button" className="view-button">View Photo</button>
                  </div>
                  <div className="field">
                    <label>Income proof</label>
                    <input type="text" value={selectedDSA.incomeProof || ''} onChange={(e) => handleInputChange('incomeProof', e.target.value)} />
                  </div>
                  <div className="field">
                    <label>CV</label>
                    <button type="button" className="view-button">CV Uploaded</button>
                  </div>
                </div>
              </section>

              <section className="modal-section">
                <h3>Banking Details</h3>
                <div className="field-grid">
                  <div className="field">
                    <label>Account Holder Name</label>
                    <input type="text" value={selectedDSA.bankAccountHolder || ''} onChange={(e) => handleInputChange('bankAccountHolder', e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Account Number</label>
                    <input type="text" value={selectedDSA.bankAccountNumber || ''} onChange={(e) => handleInputChange('bankAccountNumber', e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Branch</label>
                    <input type="text" value={selectedDSA.bankBranch || ''} onChange={(e) => handleInputChange('bankBranch', e.target.value)} />
                  </div>
                  <div className="field">
                    <label>IFSC Code</label>
                    <input type="text" value={selectedDSA.bankIFSC || ''} onChange={(e) => handleInputChange('bankIFSC', e.target.value)} />
                  </div>
                  <div className="field field-full field-inline">
                    <button type="button" className="view-button">View Bank Statement</button>
                  </div>
                </div>
              </section>

              <section className="modal-section status-section">
                <div className="status-card">
                  <h4>Verified Documents</h4>
                  <div className="status-list">
                    <span className={selectedDSA.verifiedDocs?.pan ? 'status-badge status-success' : 'status-badge'}>PAN</span>
                    <span className={selectedDSA.verifiedDocs?.udyam ? 'status-badge status-success' : 'status-badge'}>Udyam</span>
                    <span className={selectedDSA.verifiedDocs?.dedupe ? 'status-badge status-success' : 'status-badge'}>Dedupe</span>
                    <span className={selectedDSA.verifiedDocs?.gst ? 'status-badge status-success' : 'status-badge'}>GST</span>
                  </div>
                </div>
                <div className="status-card">
                  <h4>Payout opted for</h4>
                  <div className="status-summary">
                    <span className="status-value">{selectedDSA.payoutOptedFor || ''}</span>
                    <span className="status-label">{selectedDSA.payoutStatus || ''}</span>
                  </div>
                </div>
                <div className="status-card">
                  <h4>Signed Document</h4>
                  <button type="button" className="view-button">View PDF</button>
                </div>
              </section>

              <section className="modal-section remarks-section">
                <div className="field-full">
                  <label>Remarks</label>
                  <textarea value={selectedDSA.remarks || ''} onChange={(e) => handleInputChange('remarks', e.target.value)} />
                </div>
                <div className="field-full field-inline">
                  <button type="button" className="btn btn-outline">Select Document</button>
                </div>
              </section>

              <div className="run-checks-row">
                <button type="button" className="btn btn-danger">Run Checks</button>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" type="button" onClick={closeEditModal}>Save and Send for approval</button>
              <button className="btn btn-outline" type="button" onClick={closeEditModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {statusModalOpen && selectedDSA && (
        <div className="modal-overlay" onClick={closeStatusModal}>
          <div className="modal-dialog glass-panel" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>{statusAction} DSA</h2>
              <button className="btn btn-outline btn-sm" type="button" onClick={closeStatusModal}>Close</button>
            </div>
            <div className="modal-body">
              <div className="field-grid">
                <div className="field">
                  <label>DSA code</label>
                  <input type="text" value={selectedDSA.code || ''} disabled />
                </div>
                <div className="field">
                  <label>DSA name</label>
                  <input type="text" value={selectedDSA.name || ''} disabled />
                </div>
                <div className="field">
                  <label>Phone number</label>
                  <input type="text" value={selectedDSA.mobile || ''} disabled />
                </div>
                <div className="field">
                  <label>Branch</label>
                  <input type="text" value={selectedDSA.branch || ''} disabled />
                </div>
                <div className="field">
                  <label>Status</label>
                  <input type="text" value={statusAction} disabled />
                </div>
                <div className="field field-full">
                  <label>Remarks</label>
                  <textarea value={statusRemarks} onChange={(e) => setStatusRemarks(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" type="button" onClick={saveStatus}>Save</button>
              <button className="btn btn-outline" type="button" onClick={closeStatusModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDSAList;
