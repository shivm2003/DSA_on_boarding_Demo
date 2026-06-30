import re
from typing import Dict, Any
from .base_parser import BaseParser

class EnrollmentLetterParser(BaseParser):
    """
    Parses Enrollment Letters from other Financial Institutions (FI).
    Extracts: institution name, vendor name, enrollment date, emp code.
    """
    def extract_fields(self, text: str, text_lower: str, raw_dict: Dict[str, Any] = None) -> Dict[str, Any]:
        data = {}

        # Issuing Institution
        inst_m = re.search(
            r'(?:issued\s*by|institution|bank|nbfc|company)\s*[:\-=]?\s*([A-Z][a-zA-Z\s.&]{3,50}(?:Bank|Finance|Financial|Capital|Ltd|Limited))',
            text, re.IGNORECASE
        )
        if inst_m:
            data['issuing_institution'] = inst_m.group(1).strip()

        # Vendor/Agent Name
        vendor_m = re.search(
            r'(?:vendor|agent|dsa|name)\s*[:\-=]?\s*([A-Z][a-zA-Z\s.&]{2,60})',
            text, re.IGNORECASE
        )
        if vendor_m:
            data['vendor_name'] = vendor_m.group(1).strip()

        # Enrollment Date
        date_m = re.search(
            r'(?:enrollment\s*date|date\s*of\s*empanelment|date)\s*[:\-=]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            text, re.IGNORECASE
        )
        if date_m:
            data['enrollment_date'] = date_m.group(1)

        # Code
        code_m = re.search(
            r'(?:empanelment\s*code|dsa\s*code|vendor\s*code|id)\s*[:\-=]?\s*([A-Z0-9\-]{3,20})',
            text, re.IGNORECASE
        )
        if code_m:
            data['enrollment_code'] = code_m.group(1).strip()

        return data
