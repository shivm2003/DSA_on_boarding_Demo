from .base_parser import BaseParser
from .pan_parser import PanParser
from .aadhaar_parser import AadhaarParser
from .gst_parser import GstParser
from .udyam_parser import UdyamParser
from .cheque_parser import ChequeParser

from .bank_statement_parser import BankStatementParser
from .vendor_income_parser import VendorIncomeParser
from .dsa_application_parser import DsaApplicationParser
from .stamp_paper_parser import StampPaperParser
from .employee_declaration_parser import EmployeeDeclarationParser
from .cibil_parser import CibilParser
from .rcu_parser import RcuParser
from .enrollment_letter_parser import EnrollmentLetterParser
from .profile_cv_parser import ProfileCvParser
from .firm_registration_parser import FirmRegistrationParser
from .shop_establishment_parser import ShopEstablishmentParser
from .partnership_deed_parser import PartnershipDeedParser
from .incorporation_certificate_parser import IncorporationCertificateParser
from .aoa_parser import AoaParser
from .moa_parser import MoaParser

import re

# Map frontend document types to their respective parsers
PARSER_REGISTRY = {
    "PAN": PanParser,
    "AADHAAR": AadhaarParser,
    "GST": GstParser,
    "UDYAM": UdyamParser,
    "MSME": UdyamParser,
    "CHEQUE": ChequeParser,
    "BANK_STATEMENT": BankStatementParser,
    "VENDOR_INCOME": VendorIncomeParser,
    "DSA_APPLICATION": DsaApplicationParser,
    "STAMP_PAPER": StampPaperParser,
    "EMPLOYEE_DECLARATION": EmployeeDeclarationParser,
    "CIBIL": CibilParser,
    "RCU": RcuParser,
    "ENROLLMENT_LETTER": EnrollmentLetterParser,
    "PROFILE_CV": ProfileCvParser,
    "FIRM_REGISTRATION": FirmRegistrationParser,
    "SHOP_ESTABLISHMENT": ShopEstablishmentParser,
    "PARTNERSHIP_DEED": PartnershipDeedParser,
    "INCORPORATION_CERTIFICATE": IncorporationCertificateParser,
    "AOA": AoaParser,
    "MOA": MoaParser,
}

def get_parser(document_type: str) -> BaseParser:
    """Return the parser class for the given document type, or None if not found."""
    parser_class = PARSER_REGISTRY.get(document_type.upper())
    return parser_class() if parser_class else None

def classify_document(text: str) -> str:
    """
    Auto-classify a document based on its text content.
    Used as a fallback when the frontend doesn't send a documentType.
    """
    text_lower = text.lower()

    # UDYAM (highest priority)
    udyam_number = re.search(r'udyam\s*[-.]?\s*[a-z]{2}\s*[-.]?\s*\d{2}\s*[-.]?\s*\d{6,7}', text_lower)
    udyam_headers = [
        "udyam registration certif", "udyam registration number",
        "ministry of micro", "small and medium enterprises",
    ]
    if udyam_number or any(h in text_lower for h in udyam_headers):
        return "UDYAM"

    # PAN
    pan_headers = ["permanent account number", "income tax department", "pan card"]
    if any(h in text_lower for h in pan_headers) or re.search(r'\b[a-z]{5}\d{4}[a-z]\b', text_lower):
        return "PAN"

    # AADHAAR
    aadhaar_headers = ["unique identification authority", "aadhaar card", "uidai"]
    if any(h in text_lower for h in aadhaar_headers) or re.search(r'\b\d{4}\s?\d{4}\s?\d{4}\b', text_lower):
        return "AADHAAR"

    # GST
    gst_headers = ["gst registration certificate", "gst certificate", "goods and services tax"]
    if any(h in text_lower for h in gst_headers):
        return "GST"
    elif 'udyam' in text_lower or 'msme' in text_lower or 'micro, small' in text_lower:
        return 'UDYAM'

    # CHEQUE
    if "account payee" in text_lower or "ifsc" in text_lower or "cheque" in text_lower:
        return "CHEQUE"

    return "UNKNOWN"
