from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseParser(ABC):
    @abstractmethod
    def extract_fields(self, text: str, text_lower: str, raw_dict: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Extract specific data fields based on the document text.
        """
        pass
