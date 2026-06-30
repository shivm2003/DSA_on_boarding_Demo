import re
from typing import Dict, Any
from .base_parser import BaseParser

class VendorIncomeParser(BaseParser):
    """
    Parses Vendor Income documents: Balance Sheets, ITR, Income Proofs.
    Extracts: entity name, PAN, financial year, total income/turnover,
    gross profit, net profit, total assets, auditor name.
    """
    def extract_fields(self, text: str, text_lower: str, raw_dict: Dict[str, Any] = None) -> Dict[str, Any]:
        data = {}

        # Entity / Company Name
        name_patterns = [
            r'(?:name\s*of\s*(?:the\s*)?(?:assessee|taxpayer|firm|company|business))\s*[:\-=]?\s*([A-Z][a-zA-Z\s.&]{2,60})',
            r'(?:m/s\.?|messrs\.?)\s*([A-Z][a-zA-Z\s.&]{2,60})',
        ]
        for pat in name_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                data['entity_name'] = m.group(1).strip()
                break

        # PAN
        pan_m = re.search(r'\b([A-Z]{5}[0-9]{4}[A-Z])\b', text)
        if pan_m:
            data['pan_number'] = pan_m.group(1)

        # Financial Year
        fy_m = re.search(
            r'(?:financial\s*year|assessment\s*year|fy|ay)\s*[:\-=]?\s*(\d{4}[-/]\d{2,4})',
            text, re.IGNORECASE
        )
        if fy_m:
            data['financial_year'] = fy_m.group(1)

        # Total Income / Gross Turnover
        income_patterns = [
            r'(?:total\s*income|gross\s*total\s*income)\s*[:\-=]?\s*(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d{0,2})',
            r'(?:total\s*turnover|gross\s*revenue|net\s*revenue)\s*[:\-=]?\s*(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d{0,2})',
        ]
        for pat in income_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                data['total_income'] = m.group(1).replace(',', '')
                break

        # Net Profit
        np_m = re.search(
            r'(?:net\s*profit|profit\s*after\s*tax)\s*[:\-=]?\s*(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d{0,2})',
            text, re.IGNORECASE
        )
        if np_m:
            data['net_profit'] = np_m.group(1).replace(',', '')

        # Total Assets
        assets_m = re.search(
            r'(?:total\s*assets|balance\s*sheet\s*total)\s*[:\-=]?\s*(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d{0,2})',
            text, re.IGNORECASE
        )
        if assets_m:
            data['total_assets'] = assets_m.group(1).replace(',', '')

        # Auditor / CA Name
        auditor_m = re.search(
            r'(?:chartered\s*accountant|auditor|ca)\s*[:\-=]?\s*([A-Z][a-zA-Z\s.]{2,50})',
            text, re.IGNORECASE
        )
        if auditor_m:
            data['auditor_name'] = auditor_m.group(1).strip()

        return data
