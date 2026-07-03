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
            r'(?:welcome|account\s*holder|customer\s*name|name)\s*[:\-=]?\s*(?:mr\.|mrs\.|ms\.)?\s*([A-Z][a-zA-Z \t.]{2,50})',
            r'(?:mr\.|mrs\.|ms\.)[ \t]*([A-Z][a-zA-Z \t.]{2,50})',
        ]
        for pat in holder_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                data['account_holder'] = m.group(1).strip()
                break

        # Account Number - support masked characters, spaces, dashes and asterisks
        acc_patterns = [
            r'(?:account\s*(?:no|number|num|#))\s*[:\-:=]?\s*([\d\*Xx\s\-]{4,30})',
            r'(?:a/c\s*(?:no|number))\s*[:\-:=]?\s*([\d\*Xx\s\-]{4,30})',
            r'Account\s*Number\s*\n\s*([\d\*Xx\s\-]{4,30})'
        ]
        for pat in acc_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                acc_raw = m.group(1).strip()
                # normalize: remove spaces and dashes but keep masking chars (*) and X
                acc_norm = re.sub(r'[\s\-]', '', acc_raw)
                data['account_number'] = acc_norm
                break

        # Fallback: find a standalone long numeric sequence (likely account number), avoid matching phone-like 10-digit numbers
        if 'account_number' not in data:
            seq_m = re.search(r'\b(\d{11,18})\b', text)
            if seq_m:
                data['account_number'] = seq_m.group(1)

        # IFSC Code
        ifsc_m = re.search(r'\b([A-Z]{4}0[A-Z0-9]{6})\b', text)
        if ifsc_m:
            data['ifsc_code'] = ifsc_m.group(1)

        # Bank Name
        bank_m = re.search(
            r'\b([A-Z][a-zA-Z]+(?:[ \t]+[A-Z][a-zA-Z]+)*[ \t]+(?:Bank|Bancorp|Financial|Co-operative))\b',
            text
        )
        if bank_m:
            data['bank_name'] = bank_m.group(1).strip()
        elif 'ifsc_code' in data:
            if data['ifsc_code'].startswith('SBIN'):
                data['bank_name'] = 'State Bank of India'
            elif data['ifsc_code'].startswith('HDFC'):
                data['bank_name'] = 'HDFC Bank'
            elif data['ifsc_code'].startswith('ICIC'):
                data['bank_name'] = 'ICICI Bank'

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
        branch_m = re.search(r'(?:branch|branch\s+name)[ \t]*[:\-=]?[ \t]*([A-Z][a-zA-Z0-9 \t,\-\(\)]{3,60})', text, re.IGNORECASE)
        if branch_m:
            val = branch_m.group(1).strip()
            if val.lower() not in ['code', 'address', 'information', 'details']:
                data['branch'] = val

        return data
