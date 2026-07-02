export const STEPS = [
  'Upload Document',
  'Details Page',
  'Banking',
  'Payout Selection',
  'E-Signing'
];

export const VENDOR_CATEGORIES = [
  'DSA', 'Connector', 'Technical', 'Legal', 'RCU', 'PD', 'Legal Recovery',
  'Collection Vendor', 'Branch Admin Vendors', 'HO Vendors', 'Other'
];

export const DOCUMENT_MATRIX = {
  'DSA': ['Vendor Empanelment Form', 'PAN/Form 60', 'Vendor Income', 'Cancelled Cheque', 'Agreement', 'Stamp Paper', 'Profile (CV, Photo)', 'GST & MSME Certificate', 'Declaration from Employee', 'DSA empanelment form', 'Enrollment letter from other FI'],
  'Connector': ['Vendor Empanelment Form', 'PAN/Form 60', 'Vendor Income', 'Cancelled Cheque', 'Agreement', 'Stamp Paper', 'Profile (CV, Photo)', 'GST & MSME Certificate', 'Declaration from vendor on relationship', 'Declaration from Employee', 'DSA empanelment form', 'Enrollment letter from other FI'],
  'Legal': ['Vendor Empanelment Form', 'PAN/Form 60', 'Vendor Income', 'Cancelled Cheque', 'Agreement', 'Stamp Paper', 'Profile (CV, Photo)', 'GST & MSME Certificate', 'Professional Docs', 'Educational Certificates', 'References', 'Legal Degree & Bar Council License'],
  'Technical': ['Vendor Empanelment Form', 'PAN/Form 60', 'Vendor Income', 'Cancelled Cheque', 'Agreement', 'Stamp Paper', 'Profile (CV, Photo)', 'GST & MSME Certificate', 'Professional Docs', 'Educational Certificates', 'References'],
  'RCU': ['Vendor Empanelment Form', 'PAN/Form 60', 'Vendor Income', 'Cancelled Cheque', 'Agreement', 'Stamp Paper', 'GST & MSME Certificate'],
  'Other': ['Vendor Empanelment Form', 'PAN/Form 60', 'Cancelled Cheque']
};

export const BASE_DOCS = [
  { key: 'photoUpload', label: 'Photo (2 Recent)', desc: 'Hard copy also to be sent', hasOcr: false, mandatory: true },
  { key: 'panUpload', label: 'PAN', desc: 'Upload PAN document', hasOcr: true, mandatory: true },
  { key: 'addressProofUpload', label: 'KYC Document (Address Proof)', desc: 'Upload Address Proof (Aadhar / Voter ID / Passport)', hasOcr: true, mandatory: true },
  { key: 'dsaTrainingPhotoUpload', label: 'DSA Training Photo', desc: '2 Photos with DSA team and training', hasOcr: false, mandatory: true },
  { key: 'gstCertificateUpload', label: 'GST Registration Certificate', desc: 'Upload GST Registration Certificate', hasOcr: true, mandatory: false },
  { key: 'msmeCertificateUpload', label: 'MSME Udhyam Registration Certificate', desc: 'Upload MSME Udhyam Certificate', hasOcr: true, mandatory: false },
  { key: 'enrollmentLetterUpload', label: 'Enrollment Letter', desc: 'Upload Enrollment Letter from other FI', hasOcr: false, mandatory: false },
];

export const ENTITY_ADDITIONAL_DOCS = {
  'Proprietorship': [
    { key: 'firmRegistrationUpload', label: 'Registration Certificate of Firm', desc: 'Upload Firm Registration document', hasOcr: false, mandatory: true },
    { key: 'shopEstablishmentUpload', label: 'Shop Establishment Certificate', desc: 'In case of Separate office', hasOcr: false, mandatory: false },
    { key: 'officeAddressProofUpload', label: 'Address Proof of Office', desc: 'In case of Separate office', hasOcr: false, mandatory: false },
  ],
  'Partnership': [
    { key: 'firmRegistrationUpload', label: 'Registration Certificate of Firm', desc: 'Upload Firm Registration document', hasOcr: false, mandatory: true },
    { key: 'partnershipDeedUpload', label: 'Partnership Deed', desc: 'Upload Partnership Deed document', hasOcr: false, mandatory: true },
  ],
  'Private/Public Ltd Company': [
    { key: 'incorporationCertificateUpload', label: 'Incorporation Certificate', desc: 'Upload Certificate of Incorporation', hasOcr: false, mandatory: true },
    { key: 'aoaUpload', label: 'Articles of Association', desc: 'Upload Articles of Association of company', hasOcr: false, mandatory: true },
    { key: 'moaUpload', label: 'Memorandum of Association', desc: 'Upload Memorandum of Association', hasOcr: false, mandatory: true },
  ],
};

export const INDIAN_STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
  'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Dadar and Nagar Haveli', 'Daman and Diu',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir',
  'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
  'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

export const FIELD_DOC_TYPE_MAP = {
  panUpload: 'PAN',
  addressProofUpload: 'AADHAAR',
  gstCertificateUpload: 'GST',
  msmeCertificateUpload: 'MSME',
  udyamCertificateUpload: 'UDYAM',
  cancelledChequeUpload: 'CHEQUE',
  bankStatementUpload: 'BANK_STATEMENT',
  photoUpload: 'ANY',
  dsaTrainingPhotoUpload: 'ANY',
  enrollmentLetterUpload: 'ENROLLMENT_LETTER',
  firmRegistrationUpload: 'FIRM_REGISTRATION',
  shopEstablishmentUpload: 'SHOP_ESTABLISHMENT',
  officeAddressProofUpload: 'AADHAAR',
  partnershipDeedUpload: 'PARTNERSHIP_DEED',
  incorporationCertificateUpload: 'INCORPORATION_CERTIFICATE',
  aoaUpload: 'AOA',
  moaUpload: 'MOA',
};
