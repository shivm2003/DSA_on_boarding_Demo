import re
from typing import Dict, Any
from .base_parser import BaseParser

class PanParser(BaseParser):
    def extract_fields(self, text: str, text_lower: str, raw_dict: Dict[str, Any] = None) -> Dict[str, Any]:
        data = {}
        
        pan_match = re.search(r'\b[A-Z]{5}[0-9]{4}[A-Z]\b', text)
        if pan_match:
            data['pan_number'] = pan_match.group(0)
        
        # Name
        name_match = re.search(r'name\s*[:\-=]?\s*([a-zA-Z][a-zA-Z\s.]{2,40})', text, re.IGNORECASE)
        if name_match:
            data['name'] = name_match.group(1).strip()
        
        # Father's Name
        father_match = re.search(r'father\'?s?\s*name\s*[:\-=]?\s*([a-zA-Z][a-zA-Z\s.]{2,40})', text, re.IGNORECASE)
        if father_match:
            data['father_name'] = father_match.group(1).strip()
        
        # Date of Birth
        dob_match = re.search(r'(?:date\s*of\s*birth|dob)\s*[:\-=]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})', text, re.IGNORECASE)
        if dob_match:
            data['date_of_birth'] = dob_match.group(1)
        
        return data
