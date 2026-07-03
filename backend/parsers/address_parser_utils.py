import re


INDIAN_STATES = [
    "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
    "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand",
    "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra",
    "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
    "Uttarakhand", "West Bengal"
]


def extract_address_fields(text, address_labels):
    data = {}
    label_pattern = "|".join(address_labels)
    address_match = re.search(
        rf"(?:{label_pattern})\s*[:\-=]?\s*([^\n\r]{{10,220}}(?:[\n\r]+[^\n\r]{{5,120}}){{0,3}})",
        text,
        re.IGNORECASE
    )

    if address_match:
        data["address"] = re.sub(r"\s+", " ", address_match.group(1)).strip(" ,.-")

    pincode_match = re.search(r"\b[1-9][0-9]{5}\b", text)
    if pincode_match:
        data["pincode"] = pincode_match.group(0)

    text_lower = text.lower()
    for state in INDIAN_STATES:
        if state.lower() in text_lower:
            data["state"] = state
            break

    city_match = re.search(
        r"(?:city|district|dist\.?|place)\s*[:\-=]?\s*([a-zA-Z][a-zA-Z\s.]{2,40})",
        text,
        re.IGNORECASE
    )
    if city_match:
        data["city"] = city_match.group(1).strip()

    if not data.get("address"):
        fallback = re.search(
            r"([^\n\r]{10,180}\b[1-9][0-9]{5}\b)",
            text,
            re.IGNORECASE
        )
        if fallback:
            data["address"] = re.sub(r"\s+", " ", fallback.group(1)).strip(" ,.-")

    return data
