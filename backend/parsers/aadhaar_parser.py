import re
from typing import Dict, Any
from .base_parser import BaseParser

class AadhaarParser(BaseParser):
    def extract_fields(self, text: str, text_lower: str, raw_dict: Dict[str, Any] = None) -> Dict[str, Any]:
        data = {}
        
        # Aadhaar Number (with or without spaces)
        aadhaar_match = re.search(r'\b(\d{4})\s?(\d{4})\s?(\d{4})\b', text)
        if aadhaar_match:
            data['aadhaar_number'] = ''.join(aadhaar_match.groups())
            data['aadhaar_masked'] = f"XXXX-XXXX-{aadhaar_match.group(3)}"
        
        # Name
        name_match = re.search(r'(?:name|naam)\s*[:\-=]?\s*([a-zA-Z][a-zA-Z\s.]{2,40})', text, re.IGNORECASE)
        if name_match:
            data['name'] = name_match.group(1).strip()
        
        # Date of Birth
        dob_match = re.search(r'(?:date\s*of\s*birth|dob|janm\s*tithi)\s*[:\-=]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})', text, re.IGNORECASE)
        if dob_match:
            data['date_of_birth'] = dob_match.group(1)
        
        # Gender
        gender_match = re.search(r'(?:gender|ling)\s*[:\-=]?\s*(Male|Female|Transgender|M|F|T)', text, re.IGNORECASE)
        if gender_match:
            g = gender_match.group(1).upper()
            data['gender'] = {'M': 'Male', 'F': 'Female', 'T': 'Transgender'}.get(g, g.capitalize())
        
        # Address
        address_match = re.search(r'(?:address|pata)\s*[:\-=]?\s*([^\n\r]{10,150})', text, re.IGNORECASE)
        if address_match:
            data['address'] = address_match.group(1).strip()
        
        return data
