import hashlib
import re
from decimal import Decimal


RATE_PATTERN = re.compile(r"(?<!\d)(\d+(?:\.\d+)?)\s*(?:%\s*[pP]?|%포인트)")
SPLIT_PATTERN = re.compile(
    r"(?:<br\s*/?>|[\r\n]+|[①②③④⑤⑥⑦⑧⑨⑩]|(?:^|\s)[-•·]\s+)",
    re.IGNORECASE,
)


def _condition_name(segment, index):
    name = RATE_PATTERN.sub("", segment)
    name = re.sub(r"^[\s:;,./()\[\]{}]+|[\s:;,./()\[\]{}]+$", "", name)
    name = re.sub(r"\s+", " ", name)
    return (name or f"우대 조건 {index}")[:100]


def _condition_code(segment):
    digest = hashlib.sha1(segment.encode("utf-8")).hexdigest()[:12].upper()
    return f"FSS_{digest}"


def parse_preference_conditions(raw_text, maximum_bonus):
    maximum_bonus = Decimal(maximum_bonus)
    if maximum_bonus <= 0:
        return []

    text = (raw_text or "").strip()
    segments = [re.sub(r"\s+", " ", item).strip(" -•·:;")
                for item in SPLIT_PATTERN.split(text)]
    parsed = []
    for segment in segments:
        if not segment:
            continue
        rates = RATE_PATTERN.findall(segment)
        if len(rates) != 1:
            continue
        value = Decimal(rates[0])
        if value <= 0 or value > maximum_bonus:
            continue
        parsed.append({
            "condition_code": _condition_code(segment),
            "condition_name": _condition_name(segment, len(parsed) + 1),
            "description": segment[:1000],
            "additional_interest_rate": value,
        })

    if parsed:
        return parsed

    return [{
        "condition_code": "FSS_MAX_RATE",
        "condition_name": "상품 우대조건 충족",
        "description": text[:1000] or None,
        "additional_interest_rate": maximum_bonus,
    }]
