import re
from typing import Dict, Any
from .base_parser import BaseParser

class AoaParser(BaseParser):
    """
    Parses Articles of Association.
    Extracts: company name.
    """
    def extract_fields(self, text: str, text_lower: str, raw_dict: Dict[str, Any] = None) -> Dict[str, Any]:
        data = {}

        # Company Name
        name_patterns = [
            r'(?:articles\s*of\s*association\s*of)\s*([A-Z][a-zA-Z\s.&]+(?:Limited|Ltd|Private|Pvt)\.?)',
        ]
        for pat in name_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                data['company_name'] = m.group(1).strip()
                break

        return data
