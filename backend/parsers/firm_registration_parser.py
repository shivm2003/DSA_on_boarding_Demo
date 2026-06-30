import re
from typing import Dict, Any
from .base_parser import BaseParser

class FirmRegistrationParser(BaseParser):
    """
    Parses Firm Registration Certificates (Proprietorship / Partnership).
    Extracts: firm name, registration number, date of registration, address.
    """
    def extract_fields(self, text: str, text_lower: str, raw_dict: Dict[str, Any] = None) -> Dict[str, Any]:
        data = {}

        # Firm Name
        name_patterns = [
            r'(?:name\s*of\s*(?:the\s*)?firm|firm\s*name)\s*[:\-=]?\s*([A-Z][a-zA-Z\s.&]{2,60})',
            r'(?:m/s\.?)\s*([A-Z][a-zA-Z\s.&]{2,60})',
        ]
        for pat in name_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                data['firm_name'] = m.group(1).strip()
                break

        # Registration Number
        reg_m = re.search(
            r'(?:registration\s*no|regn\.\s*no|certificate\s*no)\s*[:\-=]?\s*([A-Z0-9\-\/]{4,30})',
            text, re.IGNORECASE
        )
        if reg_m:
            data['registration_number'] = reg_m.group(1).strip()

        # Date of Registration
        date_m = re.search(
            r'(?:date\s*of\s*registration|registered\s*on|date)\s*[:\-=]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            text, re.IGNORECASE
        )
        if date_m:
            data['registration_date'] = date_m.group(1)

        # Address
        addr_m = re.search(
            r'(?:address|principal\s*place\s*of\s*business)\s*[:\-=]?\s*([^\n\r]{10,150})',
            text, re.IGNORECASE
        )
        if addr_m:
            data['registered_address'] = addr_m.group(1).strip()

        return data
