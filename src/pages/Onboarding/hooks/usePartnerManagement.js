import {
  initPartnerDetail,
  initPartnerBank,
  initPartnerOcr,
  initPartnerUpload,
  initPartnerOcrStatus,
  initPartnerOcrOutput,
  adjustPartnerArrays,
  adjustPartnerStatusArray,
  adjustStatusArray
} from '../helpers';

/**
 * Partner management hook – entity type changes, partner count,
 * and per-partner detail/bank/OCR field handlers.
 */
export const usePartnerManagement = (
  formData,
  setFormData,
  extractionStatus,
  setExtractionStatus,
  ocrOutputs,
  setOcrOutputs
) => {

  // ── Entity type change (Individual / Partnership / Pvt Ltd) ──
  const handleEntityTypeChange = (e) => {
    const value = e.target.value;
    const isMultiPerson = value === 'Partnership' || value === 'Private/Public Ltd Company';

    setExtractionStatus(prev => ({
      ...prev,
      partnerBanks: isMultiPerson
        ? adjustStatusArray(Math.max(1, formData.numberOfPartners || 1), prev.partnerBanks)
        : [],
      partnerOcr: isMultiPerson
        ? adjustPartnerStatusArray(Math.max(1, formData.numberOfPartners || 1), prev.partnerOcr, initPartnerOcrStatus)
        : []
    }));

    setOcrOutputs(prev => ({
      ...prev,
      partners: isMultiPerson
        ? adjustPartnerStatusArray(Math.max(1, formData.numberOfPartners || 1), prev.partners, initPartnerOcrOutput)
        : []
    }));

    setFormData(prev => {
      const update = { ...prev, entityType: value };
      if (!isMultiPerson) {
        update.numberOfPartners = 0;
        update.partnerDetails = [];
        update.partnerBankDetails = [];
        update.partnerOcrDetails = [];
        update.partnerUploads = [];
      } else {
        const count = prev.numberOfPartners || Math.max(1, prev.partnerUploads.length || 1);
        const { partnerDetails, partnerBankDetails, partnerOcrDetails } = adjustPartnerArrays(count, prev);
        update.numberOfPartners = count;
        update.partnerDetails = partnerDetails;
        update.partnerBankDetails = partnerBankDetails;
        update.partnerOcrDetails = partnerOcrDetails;
        update.partnerUploads = prev.partnerUploads.length ? prev.partnerUploads : [initPartnerUpload()];
      }
      return update;
    });
  };

  // ── Number of partners change ──
  const handleNumberOfPartnersChange = (e) => {
    const value = Number(e.target.value);
    const count = Number.isNaN(value) ? 0 : Math.min(10, Math.max(0, value));
    const error = count === 0 ? 'Number of partners/directors cannot be 0.' : '';

    setExtractionStatus(prev => ({
      ...prev,
      partnerBanks: adjustStatusArray(count, prev.partnerBanks),
      partnerOcr: adjustPartnerStatusArray(count, prev.partnerOcr, initPartnerOcrStatus)
    }));

    setOcrOutputs(prev => ({
      ...prev,
      partners: adjustPartnerStatusArray(count, prev.partners, initPartnerOcrOutput)
    }));

    setFormData(prev => {
      const updated = { ...prev, numberOfPartners: count, partnerCountError: error };
      if (count > 0) {
        const { partnerDetails, partnerBankDetails, partnerOcrDetails } = adjustPartnerArrays(count, prev);
        updated.partnerDetails = partnerDetails;
        updated.partnerBankDetails = partnerBankDetails;
        updated.partnerOcrDetails = partnerOcrDetails;
      } else {
        updated.partnerDetails = [];
        updated.partnerBankDetails = [];
        updated.partnerOcrDetails = [];
      }
      return updated;
    });
  };

  // ── Per-partner field handlers ──
  const handlePartnerDetailChange = (index, name, value) => {
    if (name === 'dob') {
      value = value.replace(/[^0-9-]/g, '');
    }
    setFormData(prev => {
      const partnerDetails = [...prev.partnerDetails];
      partnerDetails[index] = { ...partnerDetails[index], [name]: value };
      return { ...prev, partnerDetails };
    });
  };

  const handlePartnerBankChange = (index, name, value) => {
    setFormData(prev => {
      const partnerBankDetails = [...prev.partnerBankDetails];
      partnerBankDetails[index] = { ...partnerBankDetails[index], [name]: value };
      return { ...prev, partnerBankDetails };
    });
  };

  const handlePartnerOcrChange = (index, name, value) => {
    setFormData(prev => {
      const partnerOcrDetails = [...prev.partnerOcrDetails];
      partnerOcrDetails[index] = { ...partnerOcrDetails[index], [name]: value };
      return { ...prev, partnerOcrDetails };
    });
  };

  const handleCompanyOcrFileChange = (name, file) => {
    setFormData(prev => ({ ...prev, [name]: file }));
  };

  return {
    handleEntityTypeChange,
    handleNumberOfPartnersChange,
    handlePartnerDetailChange,
    handlePartnerBankChange,
    handlePartnerOcrChange,
    handleCompanyOcrFileChange
  };
};
