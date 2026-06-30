import re
from typing import Dict, Any
from .base_parser import BaseParser

class MoaParser(BaseParser):
    """
    Parses Memorandum of Association.
    Extracts: company name, state of registered office.
    """
    def extract_fields(self, text: str, text_lower: str, raw_dict: Dict[str, Any] = None) -> Dict[str, Any]:
        data = {}

        # Company Name
        name_patterns = [
            r'(?:memorandum\s*of\s*association\s*of)\s*([A-Z][a-zA-Z\s.&]+(?:Limited|Ltd|Private|Pvt)\.?)',
            r'(?:name\s*of\s*the\s*company\s*is)\s*([A-Z][a-zA-Z\s.&]+(?:Limited|Ltd|Private|Pvt)\.?)',
        ]
        for pat in name_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                data['company_name'] = m.group(1).strip()
                break

        # State of Registered Office
        state_m = re.search(
            r'(?:registered\s*office\s*of\s*the\s*company\s*will\s*be\s*situated\s*in\s*the\s*state\s*of)\s*([A-Z][a-zA-Z\s]+)',
            text, re.IGNORECASE
        )
        if state_m:
            data['state_of_registration'] = state_m.group(1).strip()

        return data
