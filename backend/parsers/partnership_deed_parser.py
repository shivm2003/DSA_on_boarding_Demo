import re
from typing import Dict, Any
from .base_parser import BaseParser

class PartnershipDeedParser(BaseParser):
    """
    Parses Partnership Deeds.
    Extracts: firm name, date of deed, principal place of business, partners' names.
    """
    def extract_fields(self, text: str, text_lower: str, raw_dict: Dict[str, Any] = None) -> Dict[str, Any]:
        data = {}

        # Firm Name
        firm_m = re.search(
            r'(?:name\s*and\s*style\s*of|name\s*of\s*(?:the\s*)?firm)\s*[:\-=]?\s*(?:m/s\.?)?\s*([A-Z][a-zA-Z\s.&]{2,60})',
            text, re.IGNORECASE
        )
        if firm_m:
            data['firm_name'] = firm_m.group(1).strip()

        # Date of Deed
        date_m = re.search(
            r'(?:deed\s*of\s*partnership\s*made\s*on|dated?)\s*[:\-=]?\s*(\d{1,2}(?:st|nd|rd|th)?\s*[a-zA-Z]+\s*\d{4}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            text, re.IGNORECASE
        )
        if date_m:
            data['deed_date'] = date_m.group(1).strip()

        # Partners
        # This is a bit tricky, but we can look for "First Party", "Second Party"
        partners = []
        party_patterns = [
            r'first\s*party\s*[:\-=]?\s*([A-Z][a-zA-Z\s.]{2,50})',
            r'second\s*party\s*[:\-=]?\s*([A-Z][a-zA-Z\s.]{2,50})',
            r'third\s*party\s*[:\-=]?\s*([A-Z][a-zA-Z\s.]{2,50})',
        ]
        for pat in party_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                partners.append(m.group(1).strip())
        
        if partners:
            data['partners'] = partners

        return data
