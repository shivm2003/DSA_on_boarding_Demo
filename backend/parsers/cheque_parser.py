import re
from typing import Dict, Any
from .base_parser import BaseParser

class ChequeParser(BaseParser):
    def extract_fields(self, text: str, text_lower: str, raw_dict: Dict[str, Any] = None) -> Dict[str, Any]:
        data = {}
        
        # IFSC Code
        ifsc_match = re.search(r'\b([A-Z]{4})0([A-Z0-9]{6})\b', text)
        if ifsc_match:
            data['ifsc_code'] = ifsc_match.group(0)
            data['bank_code'] = ifsc_match.group(1)
        
        # Account Number
        account_match = re.search(r'(?:account\s*no|a/c\s*no)\s*[:\-=]?\s*(\d{9,18})', text, re.IGNORECASE)
        if account_match:
            data['account_number'] = account_match.group(1)
        
        # Bank Name
        bank_match = re.search(r'([a-zA-Z][a-zA-Z\s]{2,30})\s*(?:bank|limited|ltd)', text, re.IGNORECASE)
        if bank_match:
            data['bank_name'] = bank_match.group(1).strip()
        
        # MICR Code
        micr_match = re.search(r'\b\d{9}\b', text)
        if micr_match:
            data['micr_code'] = micr_match.group(0)
        
        # Cheque Number
        cheque_no_match = re.search(r'cheque\s*no\s*[:\-=]?\s*(\d{6,8})', text, re.IGNORECASE)
        if cheque_no_match:
            data['cheque_number'] = cheque_no_match.group(1)
        
        # Payee Name
        payee_match = re.search(r'pay\s*(?:to)?\s*(?:the)?\s*order\s*of\s*([a-zA-Z][a-zA-Z\s.]{2,40})', text, re.IGNORECASE)
        if payee_match:
            data['payee_name'] = payee_match.group(1).strip()
        
        # Amount
        amount_match = re.search(r'(?:rs\.?|inr|₹)\s*(\d[\d,]*\.?\d{0,2})', text, re.IGNORECASE)
        if amount_match:
            data['amount'] = amount_match.group(1).replace(',', '')
        
        # Date
        date_match = re.search(r'(\d{1,2})[/\-\s](\d{1,2})[/\-\s](\d{2,4})', text)
        if date_match:
            data['cheque_date'] = f"{date_match.group(1)}/{date_match.group(2)}/{date_match.group(3)}"
        
        return data
