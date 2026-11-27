"""Conservative non-marketplace intent checks, before any model/LLM call.

These rules reject clear content-generation, educational, travel, financial,
medical, and prompt-injection requests. They are not a complete OOS detector.
"""
import re

NON_SERVICE = re.compile(
    r'\b(?:write|compose)\s+(?:me\s+)?(?:a\s+)?(?:poem|story|essay)\b'
    r'|\btranslate\b|\bschool\s+(?:essay|assignment)\b|\bhomework\b'
    r'|\bexplain\s+how\b|\bsummariz[es]\b'
    r'|\binvestment\s+advice\b|\b(?:buying|buy)\s+shares\b'
    r'|\b(?:book|reserve)\s+(?:a\s+)?flight\b|\bweather\s+forecast\b'
    r'|\b(?:solve|calculate)\b.*\b(?:equation|homework)\b'
    r'|\b(?:generate|design)\s+(?:a\s+)?logo\b'
    r'|\b(?:prescribe|antibiotics|diagnose my fever)\b'
    r'|\b(?:recipe|recipes)\b'
    r'|\bignore\b.*\b(?:instructions|rules|prompt)\b', re.I)


def outside_service_scope(text):
    return bool(NON_SERVICE.search(text))
