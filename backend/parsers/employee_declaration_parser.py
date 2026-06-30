import re
from typing import Dict, Any
from .base_parser import BaseParser

class EmployeeDeclarationParser(BaseParser):
    """
    Parses Employee Declaration / Relationship Declaration forms.
    Extracts: employee name, employee code, designation, department,
    date, declaration about relationship with vendor/DSA.
    """
    def extract_fields(self, text: str, text_lower: str, raw_dict: Dict[str, Any] = None) -> Dict[str, Any]:
        data = {}

        # Employee Name
        emp_name_patterns = [
            r'(?:i,|i\s+|employee\s*name|name\s*of\s*employee)\s*[:\-=]?\s*([A-Z][a-zA-Z\s.]{2,50})',
            r'(?:undersigned|declarant)\s*[:\-=]?\s*([A-Z][a-zA-Z\s.]{2,50})',
        ]
        for pat in emp_name_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                data['employee_name'] = m.group(1).strip()
                break

        # Employee Code
        code_m = re.search(
            r'(?:employee\s*(?:code|id|no|number)|emp\.?\s*(?:code|id|no))\s*[:\-=]?\s*([A-Z0-9\-]{3,20})',
            text, re.IGNORECASE
        )
        if code_m:
            data['employee_code'] = code_m.group(1).strip()

        # Designation
        desig_m = re.search(
            r'(?:designation|post|position)\s*[:\-=]?\s*([A-Z][a-zA-Z\s.]{2,50})',
            text, re.IGNORECASE
        )
        if desig_m:
            data['designation'] = desig_m.group(1).strip()

        # Department / Branch
        dept_m = re.search(
            r'(?:department|dept|branch)\s*[:\-=]?\s*([A-Z][a-zA-Z\s.]{2,50})',
            text, re.IGNORECASE
        )
        if dept_m:
            data['department'] = dept_m.group(1).strip()

        # Vendor / DSA Name (who is being declared about)
        vendor_m = re.search(
            r'(?:vendor\s*name|dsa\s*name|name\s*of\s*(?:the\s*)?(?:vendor|dsa|agent))\s*[:\-=]?\s*([A-Z][a-zA-Z\s.&]{2,60})',
            text, re.IGNORECASE
        )
        if vendor_m:
            data['vendor_name'] = vendor_m.group(1).strip()

        # Date
        date_m = re.search(r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})', text)
        if date_m:
            data['declaration_date'] = date_m.group(1)

        # Relationship declared (e.g., "no relative", "no financial interest")
        rel_m = re.search(
            r'(?:relation(?:ship)?|relative|financial\s*interest)\s*[:\-=]?\s*([a-zA-Z][a-zA-Z\s,\-]{2,80})',
            text, re.IGNORECASE
        )
        if rel_m:
            data['declared_relationship'] = rel_m.group(1).strip()

        return data
