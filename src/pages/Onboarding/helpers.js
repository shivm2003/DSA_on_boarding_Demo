export const initPartnerDetail = () => ({
  fullName: '',
  dob: '',
  pan: '',
  designation: '',
  role: '',
  sharePercentage: ''
});

export const initPartnerBank = () => ({
  bankName: '',
  accountNumber: '',
  ifscCode: ''
});

export const initPartnerOcr = () => ({
  idProofFile: null,
  addressProofFile: null,
  fullName: '',
  dob: '',
  pan: '',
  aadharNumber: ''
});

export const initPartnerUpload = () => ({
  idProofUpload: null,
  addressProofUpload: null,
  panCardUpload: null
});

export const initPartnerOcrStatus = () => ({
  idProofUpload: false,
  addressProofUpload: false,
  panCardUpload: false
});

export const initPartnerOcrOutput = () => ({
  idProofUpload: '',
  addressProofUpload: '',
  panCardUpload: ''
});

export const adjustPartnerArrays = (count, prev) => {
  const partnerDetails = Array.from({ length: count }, (_, idx) => prev.partnerDetails[idx] || initPartnerDetail());
  const partnerBankDetails = Array.from({ length: count }, (_, idx) => prev.partnerBankDetails[idx] || initPartnerBank());
  const partnerOcrDetails = Array.from({ length: count }, (_, idx) => prev.partnerOcrDetails[idx] || initPartnerOcr());
  return { partnerDetails, partnerBankDetails, partnerOcrDetails };
};

export const adjustPartnerStatusArray = (count, statusArray = [], initFn) =>
  Array.from({ length: count }, (_, idx) => statusArray[idx] || initFn());

export const adjustStatusArray = (count, statusArray = []) =>
  Array.from({ length: count }, (_, idx) => statusArray[idx] || false);

export const normalizePhoneValue = (value) => value.replace(/\D/g, '').slice(0, 10);
export const normalizeDateValue = (value) => value.replace(/[^0-9-]/g, '');

export const serializeFileField = (value) => {
  if (!value) return '';
  if (Array.isArray(value)) return value.map(serializeFileField).filter(Boolean);
  return value.name || value.filename || String(value);
};

export const serializePartnerUpload = (partner) => ({
  idProofUpload: serializeFileField(partner.idProofUpload),
  addressProofUpload: serializeFileField(partner.addressProofUpload),
  panCardUpload: serializeFileField(partner.panCardUpload)
});

export const serializePartnerOcrDetail = (partner) => ({
  idProofFile: serializeFileField(partner.idProofFile),
  addressProofFile: serializeFileField(partner.addressProofFile),
  fullName: partner.fullName || '',
  dob: partner.dob || '',
  pan: partner.pan || '',
  aadharNumber: partner.aadharNumber || ''
});
