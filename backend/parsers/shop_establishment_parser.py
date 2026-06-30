import re
from typing import Dict, Any
from .base_parser import BaseParser

class ShopEstablishmentParser(BaseParser):
    """
    Parses Shop and Establishment Certificates.
    Extracts: shop name, employer name, registration number, category, address.
    """
    def extract_fields(self, text: str, text_lower: str, raw_dict: Dict[str, Any] = None) -> Dict[str, Any]:
        data = {}

        # Shop/Establishment Name
        name_patterns = [
            r'(?:name\s*of\s*(?:the\s*)?establishment|shop\s*name)\s*[:\-=]?\s*([A-Z][a-zA-Z\s.&]{2,60})',
        ]
        for pat in name_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                data['shop_name'] = m.group(1).strip()
                break

        # Employer Name
        emp_m = re.search(
            r'(?:name\s*of\s*(?:the\s*)?employer|employer\s*name)\s*[:\-=]?\s*([A-Z][a-zA-Z\s.]{2,50})',
            text, re.IGNORECASE
        )
        if emp_m:
            data['employer_name'] = emp_m.group(1).strip()

        # Registration Number
        reg_m = re.search(
            r'(?:registration\s*no|certificate\s*no)\s*[:\-=]?\s*([A-Z0-9\-\/]{4,30})',
            text, re.IGNORECASE
        )
        if reg_m:
            data['registration_number'] = reg_m.group(1).strip()

        # Address
        addr_m = re.search(
            r'(?:postal\s*address|address\s*of\s*establishment|address)\s*[:\-=]?\s*([^\n\r]{10,150})',
            text, re.IGNORECASE
        )
        if addr_m:
            data['shop_address'] = addr_m.group(1).strip()

        return data
