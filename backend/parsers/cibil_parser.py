import re
from typing import Dict, Any
from .base_parser import BaseParser

class CibilParser(BaseParser):
    """
    Parses CIBIL Format documents / Credit Reports.
    Extracts: name, PAN, CIBIL score, report date, active loans,
    overdue amounts, enquiry details.
    """
    def extract_fields(self, text: str, text_lower: str, raw_dict: Dict[str, Any] = None) -> Dict[str, Any]:
        data = {}

        # Name
        name_m = re.search(
            r'(?:name|consumer\s*name|applicant\s*name)\s*[:\-=]?\s*([A-Z][a-zA-Z\s.]{2,50})',
            text, re.IGNORECASE
        )
        if name_m:
            data['name'] = name_m.group(1).strip()

        # PAN
        pan_m = re.search(r'\b([A-Z]{5}[0-9]{4}[A-Z])\b', text)
        if pan_m:
            data['pan_number'] = pan_m.group(1)

        # CIBIL Score
        score_patterns = [
            r'(?:cibil\s*(?:trans)?union\s*score|credit\s*score|score)\s*[:\-=]?\s*(-?1|\d{3})',
            r'\b(7\d{2}|[89]\d{2})\b',  # typical score range 700-900
        ]
        for pat in score_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                score = m.group(1)
                if score.lstrip('-').isdigit():
                    data['cibil_score'] = int(score)
                break

        # Report Date
        report_date_m = re.search(
            r'(?:report\s*(?:date|generated|as\s*on)|date\s*of\s*(?:report|enquiry))\s*[:\-=]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            text, re.IGNORECASE
        )
        if report_date_m:
            data['report_date'] = report_date_m.group(1)

        # Total Active Loans
        active_m = re.search(
            r'(?:total\s*(?:active\s*)?accounts?|no\.\s*of\s*accounts?)\s*[:\-=]?\s*(\d+)',
            text, re.IGNORECASE
        )
        if active_m:
            data['total_accounts'] = int(active_m.group(1))

        # Total Overdue
        overdue_m = re.search(
            r'(?:total\s*overdue|overdue\s*amount)\s*[:\-=]?\s*(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d{0,2})',
            text, re.IGNORECASE
        )
        if overdue_m:
            data['total_overdue'] = overdue_m.group(1).replace(',', '')

        # Date of Birth
        dob_m = re.search(
            r'(?:date\s*of\s*birth|dob)\s*[:\-=]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            text, re.IGNORECASE
        )
        if dob_m:
            data['date_of_birth'] = dob_m.group(1)

        # Enquiries in last 24 months
        enq_m = re.search(
            r'(?:enquiries?\s*in\s*last\s*24\s*months?|no\.\s*of\s*enquiries?)\s*[:\-=]?\s*(\d+)',
            text, re.IGNORECASE
        )
        if enq_m:
            data['enquiries_24m'] = int(enq_m.group(1))

        return data
