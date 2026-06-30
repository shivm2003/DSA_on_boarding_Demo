import re
from typing import Dict, Any
from .base_parser import BaseParser

class GstParser(BaseParser):
    def extract_fields(self, text: str, text_lower: str, raw_dict: Dict[str, Any] = None) -> Dict[str, Any]:
        data = {}
        
        # GSTIN
        gstin_match = re.search(r'\b(\d{2})([A-Z]{5})(\d{4})([A-Z])([A-Z\d])([Zz])([A-Z\d])\b', text)
        if gstin_match:
            data['gstin'] = gstin_match.group(0).upper()
            data['state_code'] = gstin_match.group(1)
            data['pan_in_gstin'] = gstin_match.group(2) + gstin_match.group(3) + gstin_match.group(4)
        
        # Legal Name
        legal_name_match = re.search(r'legal\s*name\s*(?:of\s*business)?\s*[:\-=]?\s*([a-zA-Z][a-zA-Z0-9\s&.,_-]{2,60})', text, re.IGNORECASE)
        if legal_name_match:
            data['legal_name'] = legal_name_match.group(1).strip()
        
        # Trade Name
        trade_name_match = re.search(r'trade\s*name\s*[:\-=]?\s*([a-zA-Z][a-zA-Z0-9\s&.,_-]{2,60})', text, re.IGNORECASE)
        if trade_name_match:
            data['trade_name'] = trade_name_match.group(1).strip()
        
        # Date of Registration
        reg_date_match = re.search(r'date\s*of\s*registration\s*[:\-=]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})', text, re.IGNORECASE)
        if reg_date_match:
            data['date_of_registration'] = reg_date_match.group(1)
        
        # Constitution of Business
        constitution_match = re.search(r'constitution\s*of\s*business\s*[:\-=]?\s*([a-zA-Z\s]{3,30})', text, re.IGNORECASE)
        if constitution_match:
            data['constitution_of_business'] = constitution_match.group(1).strip()
        
        # Taxpayer Type
        taxpayer_match = re.search(r'taxpayer\s*type\s*[:\-=]?\s*(Regular|Composition|Casual\s*Taxable\s*Person|Non-Resident\s*Taxable\s*Person)', text, re.IGNORECASE)
        if taxpayer_match:
            data['taxpayer_type'] = taxpayer_match.group(1)
        
        # GSTIN Status
        status_match = re.search(r'status\s*[:\-=]?\s*(Active|Inactive|Suspended|Cancelled)', text, re.IGNORECASE)
        if status_match:
            data['gst_status'] = status_match.group(1)
        
        return data
