import re
from typing import Dict, Any
from .base_parser import BaseParser

class BankStatementParser(BaseParser):
    """
    Parses Bank Statements (last 6 months).
    Extracts: bank name, account number, IFSC, account holder name,
    statement period, opening/closing balance, branch address.
    """
    def extract_fields(self, text: str, text_lower: str, raw_dict: Dict[str, Any] = None) -> Dict[str, Any]:
        data = {}

        # Account Holder Name
        holder_patterns = [
            r'(?:account\s*holder|customer\s*name|name)\s*[:\-=]?\s*([A-Z][a-zA-Z\s.]{2,50})',
            r'(?:mr\.|mrs\.|ms\.)\s*([A-Z][a-zA-Z\s.]{2,50})',
        ]
        for pat in holder_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                data['account_holder'] = m.group(1).strip()
                break

        # Account Number
        acc_patterns = [
            r'(?:account\s*(?:no|number|num))\s*[:\-=]?\s*(\d{9,18})',
            r'(?:a/c\s*(?:no|number))\s*[:\-=]?\s*(\d{9,18})',
        ]
        for pat in acc_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                data['account_number'] = m.group(1)
                break

        # IFSC Code
        ifsc_m = re.search(r'\b([A-Z]{4}0[A-Z0-9]{6})\b', text)
        if ifsc_m:
            data['ifsc_code'] = ifsc_m.group(1)

        # Bank Name
        bank_m = re.search(
            r'([A-Z][a-zA-Z\s]{2,30}(?:Bank|Bancorp|Financial|Co-operative))',
            text, re.IGNORECASE
        )
        if bank_m:
            data['bank_name'] = bank_m.group(1).strip()

        # Statement Period
        period_m = re.search(
            r'(?:statement\s*(?:period|for)|from)\s*[:\-]?\s*'
            r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\s*(?:to|–|-)\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            text, re.IGNORECASE
        )
        if period_m:
            data['statement_from'] = period_m.group(1)
            data['statement_to'] = period_m.group(2)

        # Opening Balance
        ob_m = re.search(
            r'(?:opening\s*balance|balance\s*b/f)\s*[:\-=]?\s*(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d{0,2})',
            text, re.IGNORECASE
        )
        if ob_m:
            data['opening_balance'] = ob_m.group(1).replace(',', '')

        # Closing Balance
        cb_m = re.search(
            r'(?:closing\s*balance|balance\s*c/f)\s*[:\-=]?\s*(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d{0,2})',
            text, re.IGNORECASE
        )
        if cb_m:
            data['closing_balance'] = cb_m.group(1).replace(',', '')

        # Branch
        branch_m = re.search(r'(?:branch)\s*[:\-=]?\s*([A-Z][a-zA-Z\s,\-]{3,60})', text, re.IGNORECASE)
        if branch_m:
            data['branch'] = branch_m.group(1).strip()

        return data
