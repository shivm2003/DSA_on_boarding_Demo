import re
from typing import Dict, Any
from .base_parser import BaseParser

class StampPaperParser(BaseParser):
    """
    Parses Stamp Paper / Stamp Duty documents.
    Extracts: stamp value, state, article number, vendor name,
    purchaser name, date, certificate number.
    """
    def extract_fields(self, text: str, text_lower: str, raw_dict: Dict[str, Any] = None) -> Dict[str, Any]:
        data = {}

        # Stamp Value / Amount
        value_patterns = [
            r'(?:stamp\s*(?:duty|value|amount)|e-stamp\s*value)\s*[:\-=]?\s*(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d{0,2})',
            r'(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)\s*(?:stamp|only)',
        ]
        for pat in value_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                data['stamp_value'] = m.group(1).replace(',', '')
                break

        # State
        states = [
            'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi',
            'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
            'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
            'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
            'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
            'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
        ]
        for state in states:
            if state.lower() in text_lower:
                data['state'] = state
                break

        # Article Number
        article_m = re.search(
            r'(?:article\s*(?:no|number))\s*[:\-=]?\s*(\d+[A-Z]?)',
            text, re.IGNORECASE
        )
        if article_m:
            data['article_number'] = article_m.group(1)

        # First Party / Purchaser
        purchaser_m = re.search(
            r'(?:first\s*party|purchaser|purchased\s*by|buyer)\s*[:\-=]?\s*([A-Z][a-zA-Z\s.&]{2,60})',
            text, re.IGNORECASE
        )
        if purchaser_m:
            data['purchaser_name'] = purchaser_m.group(1).strip()

        # Second Party / Vendor
        vendor_m = re.search(
            r'(?:second\s*party|vendor|seller|in\s*favour\s*of)\s*[:\-=]?\s*([A-Z][a-zA-Z\s.&]{2,60})',
            text, re.IGNORECASE
        )
        if vendor_m:
            data['vendor_name'] = vendor_m.group(1).strip()

        # Certificate Number / GRN
        cert_m = re.search(
            r'(?:certificate\s*(?:no|number)|grn|unique\s*document\s*(?:id|number))\s*[:\-=]?\s*([A-Z0-9\-]{5,30})',
            text, re.IGNORECASE
        )
        if cert_m:
            data['certificate_number'] = cert_m.group(1).strip()

        # Date
        date_m = re.search(r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})', text)
        if date_m:
            data['stamp_date'] = date_m.group(1)

        return data
