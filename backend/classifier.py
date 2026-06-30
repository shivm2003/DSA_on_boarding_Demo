import re

def identify_document(text: str) -> str:
    """
    Classify the document based on extracted text content.
    
    Priority: Strong document headers > Document number patterns > Weak keywords
    """
    text_lower = text.lower()

    # ========== STRONG UDYAM INDICATORS (Highest Priority) ==========
    # These are definitive proof of Udyam certificate - check FIRST
    
    # 1. Udyam number pattern: UDYAM-XX-00-0000000 (most reliable)
    udyam_number_pattern = re.search(r'udyam\s*[-.]?\s*[a-z]{2}\s*[-.]?\s*\d{2}\s*[-.]?\s*\d{6,7}', text_lower)
    
    # 2. Udyam-specific headers (handle OCR typos like "CERTIFCATE" missing 'I')
    udyam_headers = [
        "udyam registration certif",      # partial for "certificate"/"certifcate"
        "udyam registration number",
        "date of udyam registration",
        "udyam aadhar memorandum",
        "udyam aadhaar memorandum",
        "ministry of micro",               # Ministry of MSME header
        "small and medium enterprises",    # Full MSME name
        "udyamregistration.gov",           # URL in footer
        "udyam_user",                      # URL path
        "udyam printapplication",          # URL path
        "print udyam registration",        # Page header
        "udyam regist",                    # partial catch-all
    ]
    has_udyam_header = any(header in text_lower for header in udyam_headers)
    
    # If ANY strong Udyam indicator exists → UDYAM (overrides everything else)
    if udyam_number_pattern or has_udyam_header:
        return "UDYAM"

    # ========== PAN ==========
    pan_headers = [
        "permanent account number",
        "income tax department",
        "pan card",
    ]
    pan_number = re.search(r'\b[a-z]{5}\d{4}[a-z]\b', text_lower)
    if any(h in text_lower for h in pan_headers) or pan_number:
        return "PAN"

    # ========== AADHAAR ==========
    aadhaar_headers = [
        "unique identification authority",
        "aadhaar card",
        "uidai",
    ]
    aadhaar_number = re.search(r'\b\d{4}\s?\d{4}\s?\d{4}\b', text_lower)
    if any(h in text_lower for h in aadhaar_headers) or aadhaar_number:
        return "AADHAAR"

    # ========== GST (Actual GST documents only) ==========
    # IMPORTANT: "gstin" alone is NOT enough - could be a field in Udyam cert
    # Must have GST-specific context
    gst_headers = [
        "gst registration certificate",
        "gst certificate",
        "tax invoice",
        "goods and services tax",
    ]
    gstin_number = re.search(r'\b\d{2}[a-z]{5}\d{4}[a-z][a-z\d][z][a-z\d]\b', text_lower)
    
    # Only classify as GST if:
    # - Has GST header, OR
    # - Has valid GSTIN number AND no Udyam indicators
    has_gst_header = any(h in text_lower for h in gst_headers)
    
    if has_gst_header or (gstin_number and not has_udyam_header and not udyam_number_pattern):
        return "GST"

    # ========== MSME (Old registration, not Udyam) ==========
    if "msme" in text_lower and "udyam" not in text_lower:
        return "MSME"

    # ========== CHEQUE ==========
    if "account payee" in text_lower or "ifsc" in text_lower or "cheque" in text_lower:
        return "CHEQUE"

    # ========== FALLBACK ==========
    # If "udyam" appears anywhere, classify as UDYAM
    if "udyam" in text_lower:
        return "UDYAM"

    return "UNKNOWN"


def extract_fields(document_type: str, text: str) -> dict:
    """Extract specific data fields based on the identified document type using regex."""
    data = {}
    
    if document_type == "UDYAM":
        # Flexible Udyam number matching
        patterns = [
            r'udyam\s*[-.]?\s*([a-z]{2})\s*[-.]?\s*(\d{2})\s*[-.]?\s*(\d{6,7})',  # With separators
            r'udyam\s*([a-z]{2})(\d{2})(\d{6,7})',                                # No separators
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                state, year, serial = match.groups()
                data['udyam_number'] = f"UDYAM-{state.upper()}-{year}-{serial}"
                data['udyam_state'] = state.upper()
                data['udyam_year'] = year
                break
        
        # Extract Enterprise Name
        ent_patterns = [
            r'name\s*of\s*enterprise\s*[:=\s]*([^\n\r]{3,60})',
            r'enterprise\s*name\s*[:=\s]*([^\n\r]{3,60})',
        ]
        for pattern in ent_patterns:
            ent_match = re.search(pattern, text, re.IGNORECASE)
            if ent_match:
                data['enterprise_name'] = ent_match.group(1).strip()
                break
        
        # Extract Date of Commencement / Registration
        date_patterns = [
            r'date\s*of\s*commencement\s*of\s*production/business\s*[:=\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            r'date\s*of\s*incorporation\s*[:=\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
        ]
        for pattern in date_patterns:
            date_match = re.search(pattern, text, re.IGNORECASE)
            if date_match:
                data['date_of_commencement'] = date_match.group(1)
                break
        
        # Extract NIC Code
        nic_match = re.search(r'nic\s*code\(s\)\s*[:=\s]*(\d{2,8})', text, re.IGNORECASE)
        if nic_match:
            data['nic_code'] = nic_match.group(1)
            
        # Extract Major Activity
        activity_match = re.search(r'major\s*activity\s*[:=\s]*(manufacturing|service|trading|wholesale|retail)', text, re.IGNORECASE)
        if activity_match:
            data['major_activity'] = activity_match.group(1).capitalize()
        
        # Extract PAN
        pan_match = re.search(r'\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b', text)
        if pan_match:
            data['pan_number'] = pan_match.group(0)
            
        # Extract Mobile
        mobile_match = re.search(r'\b\d{10}\b', text)
        if mobile_match:
            data['mobile_number'] = mobile_match.group(0)
            
        # Extract Email
        email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
        if email_match:
            data['email'] = email_match.group(0)
            
        # Extract Bank Details
        bank_match = re.search(r'bank\s*name\s*[:=\s]*([^\n\r]{3,40})', text, re.IGNORECASE)
        if bank_match:
            data['bank_name'] = bank_match.group(1).strip()
            
        ifsc_match = re.search(r'\b[A-Z]{4}0[A-Z0-9]{6}\b', text)
        if ifsc_match:
            data['ifsc_code'] = ifsc_match.group(0)
            
        # Extract Social Category
        social_match = re.search(r'social\s*category\s*[:=\s]*(OBC|SC|ST|General)', text, re.IGNORECASE)
        if social_match:
            data['social_category'] = social_match.group(1).upper()
            
        # Extract Type of Enterprise
        type_match = re.search(r'type\s*of\s*enterprise\s*[:=\s]*(Micro|Small|Medium)', text, re.IGNORECASE)
        if type_match:
            data['enterprise_type'] = type_match.group(1).capitalize()
            
    elif document_type == "PAN":
        pan_match = re.search(r'\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b', text, re.IGNORECASE)
        if pan_match:
            data['pan_number'] = pan_match.group(0).upper()
            
    elif document_type == "AADHAAR":
        aadhaar_match = re.search(r'\b\d{4}\s?\d{4}\s?\d{4}\b', text)
        if aadhaar_match:
            data['aadhaar_number'] = aadhaar_match.group(0).replace(" ", "")
            
    elif document_type == "GST":
        gst_match = re.search(r'\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Zz]{1}[A-Z\d]{1}\b', text, re.IGNORECASE)
        if gst_match:
            data['gstin'] = gst_match.group(0).upper()
            
    elif document_type == "CHEQUE":
        ifsc_match = re.search(r'\b[A-Z]{4}0[A-Z0-9]{6}\b', text, re.IGNORECASE)
        if ifsc_match:
            data['ifsc_code'] = ifsc_match.group(0).upper()
            
    return data