import re
from typing import Dict, Any
from .base_parser import BaseParser

class IncorporationCertificateParser(BaseParser):
    """
    Parses Certificate of Incorporation (COI).
    Extracts: CIN, company name, date of incorporation.
    """
    def extract_fields(self, text: str, text_lower: str, raw_dict: Dict[str, Any] = None) -> Dict[str, Any]:
        data = {}

        # Company Name
        name_patterns = [
            r'(?:name\s*of\s*(?:the\s*)?company|is\s*incorporated|that)\s*([A-Z][a-zA-Z\s.&]+(?:Limited|Ltd|Private|Pvt)\.?)',
        ]
        for pat in name_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                data['company_name'] = m.group(1).strip()
                break

        # CIN
        cin_m = re.search(r'\b([LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6})\b', text)
        if cin_m:
            data['cin'] = cin_m.group(1)

        # Date of Incorporation
        date_m = re.search(
            r'(?:this\s*\d{1,2}(?:st|nd|rd|th)?\s*day\s*of\s*[a-zA-Z]+\s*\d{4}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            text, re.IGNORECASE
        )
        if date_m:
            data['incorporation_date'] = date_m.group(0).strip()

        return data
