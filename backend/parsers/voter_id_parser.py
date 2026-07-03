from typing import Dict, Any
from .base_parser import BaseParser
from .address_parser_utils import extract_address_fields


class VoterIdParser(BaseParser):
    def extract_fields(self, text: str, text_lower: str, raw_dict: Dict[str, Any] = None) -> Dict[str, Any]:
        return extract_address_fields(text, [
            "address",
            "ordinary residence",
            "residence",
            "particulars of place of ordinary residence"
        ])
