import re
from typing import Dict, Any
from .base_parser import BaseParser

class UdyamParser(BaseParser):
    def extract_fields(self, text: str, text_lower: str, raw_dict: Dict[str, Any] = None) -> Dict[str, Any]:
        data = {}
        
        # UDYAM REGISTRATION NUMBER
        udyam_patterns = [
            r'udyam\s*[-.]?\s*([a-z]{2})\s*[-.]?\s*(\d{2})\s*[-.]?\s*(\d{6,7})',
            r'udyam\s*([a-z]{2})(\d{2})(\d{6,7})',
        ]
        for pattern in udyam_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                state, year, serial = match.groups()
                data['udyam_number'] = f"UDYAM-{state.upper()}-{year}-{serial}"
                data['udyam_state_code'] = state.upper()
                data['udyam_registration_year'] = year
                break
        
        # ENTERPRISE NAME (Relaxed for tabular data)
        enterprise_patterns = [
            r'name\s*of\s*enterprise\s*[:\-=]?\s*([a-zA-Z][a-zA-Z0-9\s&.,_-]{2,60})',
            r'enterprise\s*name\s*[:\-=]?\s*([a-zA-Z][a-zA-Z0-9\s&.,_-]{2,60})',
            r'\bM/S\s+([A-Z0-9\s&.,_-]{2,60})\b'
        ]
        for pattern in enterprise_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                name = match.group(1).strip()
                name = re.sub(r'\s+', ' ', name).strip()
                if len(name) > 2:
                    data['enterprise_name'] = name
                    break
        
        # OWNER/APPLICANT NAME
        owner_patterns = [
            r'owner\s*name\s*[:\-=]?\s*([a-zA-Z][a-zA-Z\s.]{2,40})',
            r'applicant\s*name\s*[:\-=]?\s*([a-zA-Z][a-zA-Z\s.]{2,40})',
            r'promoter\s*name\s*[:\-=]?\s*([a-zA-Z][a-zA-Z\s.]{2,40})',
        ]
        for pattern in owner_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                data['owner_name'] = match.group(1).strip()
                break
        
        # PAN NUMBER
        pan_match = re.search(r'\b[A-Z]{5}[0-9]{4}[A-Z]\b', text)
        if pan_match:
            data['pan_number'] = pan_match.group(0)
        
        # MOBILE NUMBER
        mobile_patterns = [
            r'mobile\s*(?:no\.?|number)?\s*[:\-=]?\s*(\d{10})',
            r'\b\d{10}\b',
        ]
        for pattern in mobile_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                mobile = match.group(1) if match.groups() else match.group(0)
                if mobile[0] in '6789':
                    data['mobile_number'] = mobile
                    break
        
        # EMAIL
        email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
        if email_match:
            email = email_match.group(0)
            email = email.replace(' ', '').replace('..', '.')
            data['email'] = email
        
        # DATE OF INCORPORATION / COMMENCEMENT
        date_patterns = [
            (r'date\s*of\s*incorporation.*?[:\-=]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})', 'date_of_incorporation'),
            (r'date\s*of\s*commencement.*?[:\-=]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})', 'date_of_commencement'),
            (r'date\s*of\s*udyam\s*registration.*?[:\-=]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})', 'date_of_udyam_registration'),
            # Fallback for tabular dates
            (r'\b(\d{2}/\d{2}/\d{4})\b', 'date_fallback'),
        ]
        dates_found = []
        for pattern, key in date_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for m in matches:
                if key == 'date_fallback':
                    dates_found.append(m.group(1))
                else:
                    data[key] = m.group(1)
                    
        if 'date_of_incorporation' not in data and len(dates_found) > 0:
            data['date_of_incorporation'] = dates_found[0]
        
        # MAJOR ACTIVITY
        activity_match = re.search(r'\b(manufacturing|services?|trading|wholesale|retail)\b', text, re.IGNORECASE)
        if activity_match:
            data['major_activity'] = activity_match.group(1).capitalize()
        
        # SOCIAL CATEGORY
        social_match = re.search(r'\b(OBC|SC|ST|General|Minority)\b', text, re.IGNORECASE)
        if social_match:
            data['social_category'] = social_match.group(1).upper()
        
        # TYPE OF ENTERPRISE
        enterprise_type_match = re.search(r'\b(Micro|Small|Medium)\b', text, re.IGNORECASE)
        if enterprise_type_match:
            data['enterprise_type'] = enterprise_type_match.group(1).capitalize()
        
        # BANK DETAILS
        bank_name_match = re.search(r'bank\s*name\s*[:\-=]?\s*([a-zA-Z][a-zA-Z\s]{2,40})', text, re.IGNORECASE)
        if bank_name_match:
            data['bank_name'] = bank_name_match.group(1).strip()
        
        ifsc_match = re.search(r'\b[A-Z]{4}0[A-Z0-9]{6}\b', text)
        if ifsc_match:
            data['ifsc_code'] = ifsc_match.group(0)
        
        account_match = re.search(r'bank\s*account\s*number\s*[:\-=]?\s*(\d{9,18})', text, re.IGNORECASE)
        if account_match:
            data['bank_account_number'] = account_match.group(1)
        
        # ADDRESS
        address_patterns = [
            r'official\s*address\s*of\s*enterprise\s*[:\-=]?\s*([^\n\r]{10,100})',
            r'address\s*[:\-=]?\s*([^\n\r]{10,100})',
        ]
        for pattern in address_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                data['official_address'] = match.group(1).strip()
                break
        
        pincode_match = re.search(r'\b(\d{6})\b', text)
        if pincode_match:
            data['pincode'] = pincode_match.group(1)
        
        district_match = re.search(r'district\s*[:\-=]?\s*([a-zA-Z\s]{3,30})', text, re.IGNORECASE)
        if district_match:
            data['district'] = district_match.group(1).strip()
        
        state_match = re.search(r'state\s*[:\-=]?\s*([a-zA-Z\s]{3,30})', text, re.IGNORECASE)
        if state_match:
            state_val = state_match.group(1).strip()
            state_val = re.sub(r'\s+', ' ', state_val).strip()
            data['state'] = state_val
        
        # GSTIN STATUS
        gstin_status_match = re.search(r'do\s*vou\s*have\s*gstin\s*no\s*[:\-=]?\s*(Yes|No)', text, re.IGNORECASE)
        if gstin_status_match:
            data['has_gstin'] = gstin_status_match.group(1).lower() == 'yes'
        
        if raw_dict:
            data['document_pages'] = len(raw_dict.get("pages", {}))
            
        return data
