import re
from typing import Dict, Any
from .base_parser import BaseParser


class KycParser(BaseParser):
    def extract_fields(self, text: str, text_lower: str, raw_dict: Dict[str, Any] = None) -> Dict[str, Any]:
        data = {}

        name_match = re.search(
            r'(?:name|holder\s*name|customer\s*name|tenant\s*name)\s*[:\-=]?\s*([a-zA-Z][a-zA-Z\s.]{2,60})',
            text,
            re.IGNORECASE
        )
        if name_match:
            data['name'] = name_match.group(1).strip()

        dob_match = re.search(
            r'(?:date\s*of\s*birth|dob|birth\s*date)\s*[:\-=]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            text,
            re.IGNORECASE
        )
        if dob_match:
            data['date_of_birth'] = dob_match.group(1)

        address_match = re.search(
            r'(?:address|service\s*address|tenant\s*address|premises)\s*[:\-=]?\s*([^\n\r]{10,180})',
            text,
            re.IGNORECASE
        )
        if address_match:
            data['address'] = address_match.group(1).strip()

        voter_match = re.search(r'\b[A-Z]{3}[0-9]{7}\b', text)
        if voter_match:
            data['voter_id_number'] = voter_match.group(0)
            data['document_number'] = voter_match.group(0)

        passport_match = re.search(r'\b[A-Z][0-9]{7}\b', text)
        if passport_match:
            data['passport_number'] = passport_match.group(0)
            data['document_number'] = passport_match.group(0)

        dl_match = re.search(r'\b[A-Z]{2}[-\s]?\d{2}[-\s]?\d{4}[-\s]?\d{7}\b', text)
        if dl_match:
            data['dl_number'] = dl_match.group(0).replace(' ', '').replace('-', '')
            data['document_number'] = data['dl_number']

        consumer_match = re.search(
            r'(?:consumer\s*(?:no|number)|ca\s*number|account\s*number)\s*[:\-=]?\s*([A-Z0-9/-]{5,30})',
            text,
            re.IGNORECASE
        )
        if consumer_match:
            data['consumer_number'] = consumer_match.group(1).strip()
            data['document_number'] = consumer_match.group(1).strip()

        agreement_match = re.search(
            r'(?:agreement\s*(?:no|number)|document\s*(?:no|number))\s*[:\-=]?\s*([A-Z0-9/-]{5,30})',
            text,
            re.IGNORECASE
        )
        if agreement_match:
            data['agreement_number'] = agreement_match.group(1).strip()
            data['document_number'] = agreement_match.group(1).strip()

        pincode_match = re.search(r'\b[1-9][0-9]{5}\b', text)
        if pincode_match:
            data['pincode'] = pincode_match.group(0)

        return data
