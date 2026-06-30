import re
from typing import Dict, List, Any, Optional


def extract_fields(document_type: str, raw_dict: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract specific data fields based on the identified document type.
    Uses the raw Docling JSON structure for precise field extraction.
    """
    data = {}
    
    # Build combined text from all text elements for regex operations
    all_texts = []
    for txt in raw_dict.get("texts", []):
        if isinstance(txt, dict) and "text" in txt:
            all_texts.append(txt["text"])
    combined_text = "\n".join(all_texts)
    text_lower = combined_text.lower()
    
    if document_type == "UDYAM":
        data = _extract_udyam_fields(combined_text, text_lower, raw_dict)
    elif document_type == "PAN":
        data = _extract_pan_fields(combined_text)
    elif document_type == "AADHAAR":
        data = _extract_aadhaar_fields(combined_text)
    elif document_type == "GST":
        data = _extract_gst_fields(combined_text)
    elif document_type == "MSME":
        data = _extract_msme_fields(combined_text, text_lower)
    elif document_type == "CHEQUE":
        data = _extract_cheque_fields(combined_text)
    
    return data


def _extract_udyam_fields(text: str, text_lower: str, raw_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Extract all relevant fields from Udyam Registration Certificate."""
    data = {}
    
    # ========== UDYAM REGISTRATION NUMBER ==========
    # Format: UDYAM-XX-00-0000000 (with various separators)
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
    
    # ========== ENTERPRISE NAME ==========
    # Try multiple patterns to handle OCR variations
    enterprise_patterns = [
        r'name\s*of\s*enterprise\s*[:\-=]?\s*([a-zA-Z][a-zA-Z0-9\s&.,_-]{2,60})',
        r'enterprise\s*name\s*[:\-=]?\s*([a-zA-Z][a-zA-Z0-9\s&.,_-]{2,60})',
        r'name\s*of\s*unit\(s\)\s*[:\-=]?\s*([a-zA-Z][a-zA-Z0-9\s&.,_-]{2,60})',
    ]
    for pattern in enterprise_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            name = match.group(1).strip()
            # Clean up common OCR artifacts
            name = re.sub(r'\s+', ' ', name).strip()
            if len(name) > 2:
                data['enterprise_name'] = name
                break
    
    # ========== OWNER/APPLICANT NAME ==========
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
    
    # ========== PAN NUMBER ==========
    pan_match = re.search(r'\b[A-Z]{5}[0-9]{4}[A-Z]\b', text)
    if pan_match:
        data['pan_number'] = pan_match.group(0)
    
    # ========== MOBILE NUMBER ==========
    # Look for 10-digit Indian mobile numbers
    mobile_patterns = [
        r'mobile\s*(?:no\.?|number)?\s*[:\-=]?\s*(\d{10})',
        r'\b\d{10}\b',
    ]
    for pattern in mobile_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            mobile = match.group(1) if match.groups() else match.group(0)
            # Validate starts with valid Indian prefix
            if mobile[0] in '6789':
                data['mobile_number'] = mobile
                break
    
    # ========== EMAIL ==========
    email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
    if email_match:
        email = email_match.group(0)
        # Clean common OCR errors in email
        email = email.replace(' ', '').replace('..', '.')
        data['email'] = email
    
    # ========== DATE OF INCORPORATION / COMMENCEMENT ==========
    date_patterns = [
        (r'date\s*of\s*incorporation\s*/\s*registration\s*of\s*enterprise\s*[:\-=]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})', 'date_of_incorporation'),
        (r'date\s*of\s*commencement\s*of\s*production/business\s*[:\-=]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})', 'date_of_commencement'),
        (r'date\s*of\s*udyam\s*registration\s*[:\-=]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})', 'date_of_udyam_registration'),
    ]
    for pattern, key in date_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            data[key] = match.group(1)
    
    # ========== MAJOR ACTIVITY ==========
    activity_match = re.search(r'major\s*activity\s*[:\-=]?\s*(manufacturing|service|trading|wholesale|retail)', text, re.IGNORECASE)
    if activity_match:
        data['major_activity'] = activity_match.group(1).capitalize()
    
    # ========== SOCIAL CATEGORY ==========
    social_match = re.search(r'social\s*category\s*(?:of\s*entrepreneur)?\s*[:\-=]?\s*(OBC|SC|ST|General|Minority)', text, re.IGNORECASE)
    if social_match:
        data['social_category'] = social_match.group(1).upper()
    
    # ========== TYPE OF ENTERPRISE ==========
    enterprise_type_match = re.search(r'type\s*of\s*enterprise\s*[:\-=]?\s*(Micro|Small|Medium)', text, re.IGNORECASE)
    if enterprise_type_match:
        data['enterprise_type'] = enterprise_type_match.group(1).capitalize()
    
    # ========== NIC CODE(S) ==========
    # Extract all NIC codes found
    nic_2digit = re.findall(r'\b(\d{2})\s*-\s*[a-zA-Z\s,]+\b', text)
    nic_4digit = re.findall(r'\b(\d{4})\s*-\s*[a-zA-Z\s,]+\b', text)
    nic_5digit = re.findall(r'\b(\d{5})\s*-\s*[a-zA-Z\s,]+\b', text)
    
    if nic_2digit:
        data['nic_2digit_codes'] = list(set(nic_2digit))
    if nic_4digit:
        data['nic_4digit_codes'] = list(set(nic_4digit))
    if nic_5digit:
        data['nic_5digit_codes'] = list(set(nic_5digit))
    
    # ========== BANK DETAILS ==========
    bank_name_match = re.search(r'bank\s*name\s*[:\-=]?\s*([a-zA-Z][a-zA-Z\s]{2,40})', text, re.IGNORECASE)
    if bank_name_match:
        data['bank_name'] = bank_name_match.group(1).strip()
    
    # IFSC Code
    ifsc_match = re.search(r'\b[A-Z]{4}0[A-Z0-9]{6}\b', text)
    if ifsc_match:
        data['ifsc_code'] = ifsc_match.group(0)
    
    # Bank Account Number
    account_match = re.search(r'bank\s*account\s*number\s*[:\-=]?\s*(\d{9,18})', text, re.IGNORECASE)
    if account_match:
        data['bank_account_number'] = account_match.group(1)
    
    # ========== ADDRESS ==========
    address_patterns = [
        r'official\s*address\s*of\s*enterprise\s*[:\-=]?\s*([^\n\r]{10,100})',
        r'address\s*[:\-=]?\s*([^\n\r]{10,100})',
    ]
    for pattern in address_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            data['official_address'] = match.group(1).strip()
            break
    
    # ========== PINCODE ==========
    pincode_match = re.search(r'pin\s*[:\-=]?\s*(\d{6})', text, re.IGNORECASE)
    if pincode_match:
        data['pincode'] = pincode_match.group(1)
    
    # ========== DISTRICT & STATE ==========
    district_match = re.search(r'district\s*[:\-=]?\s*([a-zA-Z\s]{3,30})', text, re.IGNORECASE)
    if district_match:
        data['district'] = district_match.group(1).strip()
    
    state_match = re.search(r'state\s*[:\-=]?\s*([a-zA-Z\s]{3,30})', text, re.IGNORECASE)
    if state_match:
        state_val = state_match.group(1).strip()
        # Clean up common OCR artifacts
        state_val = re.sub(r'\s+', ' ', state_val).strip()
        data['state'] = state_val
    
    # ========== GENDER ==========
    gender_match = re.search(r'gender\s*[:\-=]?\s*(Male|Female|Other|Transgender)', text, re.IGNORECASE)
    if gender_match:
        data['gender'] = gender_match.group(1).capitalize()
    
    # ========== EMPLOYMENT DETAILS ==========
    # Extract total employees if available
    total_emp_match = re.search(r'total\s*[:\-=]?\s*(\d{1,4})', text_lower)
    if total_emp_match:
        data['total_employees'] = int(total_emp_match.group(1))
    
    # Male/Female employee count
    male_match = re.search(r'male\s*[:\-=]?\s*(\d{1,4})', text_lower)
    if male_match:
        data['male_employees'] = int(male_match.group(1))
    
    female_match = re.search(r'female\s*[:\-=]?\s*(\d{1,4})', text_lower)
    if female_match:
        data['female_employees'] = int(female_match.group(1))
    
    # ========== INVESTMENT & TURNOVER ==========
    # Net investment in plant and machinery
    investment_match = re.search(r'net\s*investment\s*in\s*plant\s*(?:and|&)\s*machinery\s*(?:or|&)?\s*equipment\s*[:\-=]?\s*[\w\s]*?(\d[\d,]*\.?\d{0,2})', text, re.IGNORECASE)
    if investment_match:
        data['net_investment'] = investment_match.group(1).replace(',', '')
    
    # Total turnover
    turnover_match = re.search(r'net\s*turnover\s*\(?a-b\)?\s*[:\-=]?\s*[\w\s]*?(\d[\d,]*\.?\d{0,2})', text, re.IGNORECASE)
    if turnover_match:
        data['net_turnover'] = turnover_match.group(1).replace(',', '')
    
    # ========== GSTIN STATUS ==========
    gstin_status_match = re.search(r'do\s*vou\s*have\s*gstin\s*no\s*[:\-=]?\s*(Yes|No)', text, re.IGNORECASE)
    if gstin_status_match:
        data['has_gstin'] = gstin_status_match.group(1).lower() == 'yes'
    
    # ========== IEC DETAILS (Import Export Code) ==========
    iec_status_match = re.search(r'iec\s*status\s*[:\-=]?\s*(Active|Inactive)', text, re.IGNORECASE)
    if iec_status_match:
        data['iec_status'] = iec_status_match.group(1)
    
    # ========== DOCUMENT METADATA ==========
    data['document_pages'] = len(raw_dict.get("pages", {}))
    
    return data


def _extract_pan_fields(text: str) -> Dict[str, Any]:
    """Extract fields from PAN Card."""
    data = {}
    
    pan_match = re.search(r'\b[A-Z]{5}[0-9]{4}[A-Z]\b', text)
    if pan_match:
        data['pan_number'] = pan_match.group(0)
    
    # Name
    name_match = re.search(r'name\s*[:\-=]?\s*([a-zA-Z][a-zA-Z\s.]{2,40})', text, re.IGNORECASE)
    if name_match:
        data['name'] = name_match.group(1).strip()
    
    # Father's Name
    father_match = re.search(r'father\'?s?\s*name\s*[:\-=]?\s*([a-zA-Z][a-zA-Z\s.]{2,40})', text, re.IGNORECASE)
    if father_match:
        data['father_name'] = father_match.group(1).strip()
    
    # Date of Birth
    dob_match = re.search(r'(?:date\s*of\s*birth|dob)\s*[:\-=]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})', text, re.IGNORECASE)
    if dob_match:
        data['date_of_birth'] = dob_match.group(1)
    
    return data


def _extract_aadhaar_fields(text: str) -> Dict[str, Any]:
    """Extract fields from Aadhaar Card."""
    data = {}
    
    # Aadhaar Number (with or without spaces)
    aadhaar_match = re.search(r'\b(\d{4})\s?(\d{4})\s?(\d{4})\b', text)
    if aadhaar_match:
        data['aadhaar_number'] = ''.join(aadhaar_match.groups())
        data['aadhaar_masked'] = f"XXXX-XXXX-{aadhaar_match.group(3)}"
    
    # Name
    name_match = re.search(r'(?:name|naam)\s*[:\-=]?\s*([a-zA-Z][a-zA-Z\s.]{2,40})', text, re.IGNORECASE)
    if name_match:
        data['name'] = name_match.group(1).strip()
    
    # Date of Birth
    dob_match = re.search(r'(?:date\s*of\s*birth|dob|janm\s*tithi)\s*[:\-=]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})', text, re.IGNORECASE)
    if dob_match:
        data['date_of_birth'] = dob_match.group(1)
    
    # Gender
    gender_match = re.search(r'(?:gender|ling)\s*[:\-=]?\s*(Male|Female|Transgender|M|F|T)', text, re.IGNORECASE)
    if gender_match:
        g = gender_match.group(1).upper()
        data['gender'] = {'M': 'Male', 'F': 'Female', 'T': 'Transgender'}.get(g, g.capitalize())
    
    # Address
    address_match = re.search(r'(?:address|pata)\s*[:\-=]?\s*([^\n\r]{10,150})', text, re.IGNORECASE)
    if address_match:
        data['address'] = address_match.group(1).strip()
    
    return data


def _extract_gst_fields(text: str) -> Dict[str, Any]:
    """Extract fields from GST Registration Certificate."""
    data = {}
    
    # GSTIN
    gstin_match = re.search(r'\b(\d{2})([A-Z]{5})(\d{4})([A-Z])([A-Z\d])([Zz])([A-Z\d])\b', text)
    if gstin_match:
        data['gstin'] = gstin_match.group(0).upper()
        data['state_code'] = gstin_match.group(1)
        data['pan_in_gstin'] = gstin_match.group(2) + gstin_match.group(3) + gstin_match.group(4)
    
    # Legal Name
    legal_name_match = re.search(r'legal\s*name\s*(?:of\s*business)?\s*[:\-=]?\s*([a-zA-Z][a-zA-Z0-9\s&.,_-]{2,60})', text, re.IGNORECASE)
    if legal_name_match:
        data['legal_name'] = legal_name_match.group(1).strip()
    
    # Trade Name
    trade_name_match = re.search(r'trade\s*name\s*[:\-=]?\s*([a-zA-Z][a-zA-Z0-9\s&.,_-]{2,60})', text, re.IGNORECASE)
    if trade_name_match:
        data['trade_name'] = trade_name_match.group(1).strip()
    
    # Date of Registration
    reg_date_match = re.search(r'date\s*of\s*registration\s*[:\-=]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})', text, re.IGNORECASE)
    if reg_date_match:
        data['date_of_registration'] = reg_date_match.group(1)
    
    # Constitution of Business
    constitution_match = re.search(r'constitution\s*of\s*business\s*[:\-=]?\s*([a-zA-Z\s]{3,30})', text, re.IGNORECASE)
    if constitution_match:
        data['constitution_of_business'] = constitution_match.group(1).strip()
    
    # Taxpayer Type
    taxpayer_match = re.search(r'taxpayer\s*type\s*[:\-=]?\s*(Regular|Composition|Casual\s*Taxable\s*Person|Non-Resident\s*Taxable\s*Person)', text, re.IGNORECASE)
    if taxpayer_match:
        data['taxpayer_type'] = taxpayer_match.group(1)
    
    # GSTIN Status
    status_match = re.search(r'status\s*[:\-=]?\s*(Active|Inactive|Suspended|Cancelled)', text, re.IGNORECASE)
    if status_match:
        data['gst_status'] = status_match.group(1)
    
    return data


def _extract_msme_fields(text: str, text_lower: str) -> Dict[str, Any]:
    """Extract fields from old MSME Registration (non-Udyam)."""
    data = {}
    
    # MSME Registration Number
    msme_match = re.search(r'(?:msme|udi)\s*(?:no|number|reg\s*no)?\s*[:\-=]?\s*([a-zA-Z0-9/-]{5,20})', text, re.IGNORECASE)
    if msme_match:
        data['msme_number'] = msme_match.group(1).strip()
    
    # Enterprise Name
    name_match = re.search(r'(?:name\s*of\s*enterprise|enterprise\s*name)\s*[:\-=]?\s*([a-zA-Z][a-zA-Z0-9\s&.,_-]{2,60})', text, re.IGNORECASE)
    if name_match:
        data['enterprise_name'] = name_match.group(1).strip()
    
    # Type
    type_match = re.search(r'type\s*(?:of\s*enterprise)?\s*[:\-=]?\s*(Micro|Small|Medium)', text, re.IGNORECASE)
    if type_match:
        data['enterprise_type'] = type_match.group(1).capitalize()
    
    return data


def _extract_cheque_fields(text: str) -> Dict[str, Any]:
    """Extract fields from Bank Cheque."""
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