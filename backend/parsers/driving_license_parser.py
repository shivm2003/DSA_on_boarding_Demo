from typing import Dict, Any
from .base_parser import BaseParser
from .address_parser_utils import extract_address_fields


class DrivingLicenseParser(BaseParser):
    def extract_fields(self, text: str, text_lower: str, raw_dict: Dict[str, Any] = None) -> Dict[str, Any]:
        return extract_address_fields(text, [
            "address",
            "permanent address",
            "present address",
            "add"
        ])
