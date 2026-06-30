import re
from typing import Dict, Any
from .base_parser import BaseParser

class DsaApplicationParser(BaseParser):
    """
    Parses DSA Application, Agreement & Code of Conduct documents.
    Extracts: DSA name, applicant name, date, employee code,
    branch, product types, signed by.
    """
    def extract_fields(self, text: str, text_lower: str, raw_dict: Dict[str, Any] = None) -> Dict[str, Any]:
        data = {}

        # Applicant / DSA Name
        name_patterns = [
            r'(?:applicant\s*name|dsa\s*name|vendor\s*name|name\s*of\s*(?:the\s*)?(?:applicant|dsa|vendor))\s*[:\-=]?\s*([A-Z][a-zA-Z\s.&]{2,60})',
            r'(?:m/s\.?)\s*([A-Z][a-zA-Z\s.&]{2,60})',
        ]
        for pat in name_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                data['applicant_name'] = m.group(1).strip()
                break

        # Application Date
        date_m = re.search(
            r'(?:date|dated|application\s*date)\s*[:\-=]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            text, re.IGNORECASE
        )
        if date_m:
            data['application_date'] = date_m.group(1)

        # Employee / Empanelment Code
        code_m = re.search(
            r'(?:employee\s*code|emp\s*code|dsa\s*code|empanelment\s*(?:no|code|number))\s*[:\-=]?\s*([A-Z0-9\-]{3,20})',
            text, re.IGNORECASE
        )
        if code_m:
            data['employee_code'] = code_m.group(1).strip()

        # Branch
        branch_m = re.search(r'(?:branch)\s*[:\-=]?\s*([A-Z][a-zA-Z\s,\-]{3,50})', text, re.IGNORECASE)
        if branch_m:
            data['branch'] = branch_m.group(1).strip()

        # PAN
        pan_m = re.search(r'\b([A-Z]{5}[0-9]{4}[A-Z])\b', text)
        if pan_m:
            data['pan_number'] = pan_m.group(1)

        # Mobile / Phone
        phone_m = re.search(r'(?:mobile|phone|contact)\s*[:\-=]?\s*(\+?91?[\s\-]?\d{10})', text, re.IGNORECASE)
        if phone_m:
            data['phone'] = re.sub(r'\D', '', phone_m.group(1))[-10:]

        # Email
        email_m = re.search(r'[\w.\-]+@[\w.\-]+\.\w{2,}', text)
        if email_m:
            data['email'] = email_m.group(0)

        # Products / Services
        product_m = re.search(
            r'(?:product|loan\s*type|services?)\s*[:\-=]?\s*([a-zA-Z][a-zA-Z\s,\/]{2,80})',
            text, re.IGNORECASE
        )
        if product_m:
            data['products'] = product_m.group(1).strip()

        return data
