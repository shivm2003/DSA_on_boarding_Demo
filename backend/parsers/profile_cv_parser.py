import re
from typing import Dict, Any
from .base_parser import BaseParser

class ProfileCvParser(BaseParser):
    """
    Parses Profile / CV documents.
    Extracts: name, email, phone, education, experience.
    """
    def extract_fields(self, text: str, text_lower: str, raw_dict: Dict[str, Any] = None) -> Dict[str, Any]:
        data = {}

        # Name (usually at top, but hard to reliably regex without NLP, trying basic match)
        name_m = re.search(r'^(?:Name:\s*)?([A-Z][a-zA-Z\s.]{3,40})', text)
        if name_m:
            data['name'] = name_m.group(1).strip()

        # Email
        email_m = re.search(r'[\w.\-]+@[\w.\-]+\.\w{2,}', text)
        if email_m:
            data['email'] = email_m.group(0)

        # Phone
        phone_m = re.search(r'(?:\+?91[\s\-]?)?(\d{10})', text)
        if phone_m:
            data['phone'] = phone_m.group(1)

        # Experience
        exp_m = re.search(r'(\d+)\s*(?:\+)?\s*years?(?:\s*of)?\s*experience', text, re.IGNORECASE)
        if exp_m:
            data['years_of_experience'] = int(exp_m.group(1))

        return data
