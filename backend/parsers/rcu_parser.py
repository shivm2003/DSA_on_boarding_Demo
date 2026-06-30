import re
from typing import Dict, Any
from .base_parser import BaseParser

class RcuParser(BaseParser):
    """
    Parses RCU (Risk Containment Unit) Format documents.
    Extracts: vendor name, check type, status, findings, reviewer.
    """
    def extract_fields(self, text: str, text_lower: str, raw_dict: Dict[str, Any] = None) -> Dict[str, Any]:
        data = {}

        # Vendor/Agency Name
        vendor_m = re.search(
            r'(?:vendor\s*name|agency\s*name|name\s*of\s*(?:the\s*)?(?:vendor|agency))\s*[:\-=]?\s*([A-Z][a-zA-Z\s.&]{2,60})',
            text, re.IGNORECASE
        )
        if vendor_m:
            data['vendor_name'] = vendor_m.group(1).strip()

        # RCU Check Status
        status_m = re.search(
            r'(?:status|overall\s*status|conclusion)\s*[:\-=]?\s*(Positive|Negative|Clear|Refer|Pending)',
            text, re.IGNORECASE
        )
        if status_m:
            data['rcu_status'] = status_m.group(1).capitalize()

        # Date of verification
        date_m = re.search(
            r'(?:date\s*of\s*verification|report\s*date|date)\s*[:\-=]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            text, re.IGNORECASE
        )
        if date_m:
            data['verification_date'] = date_m.group(1)

        # Verified by / Reviewer
        reviewer_m = re.search(
            r'(?:verified\s*by|reviewed\s*by|rcu\s*officer)\s*[:\-=]?\s*([A-Z][a-zA-Z\s.]{2,50})',
            text, re.IGNORECASE
        )
        if reviewer_m:
            data['reviewer_name'] = reviewer_m.group(1).strip()

        return data
