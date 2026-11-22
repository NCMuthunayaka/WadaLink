import re

from app.models.service_request import UrgencyLevel


CATEGORY_RULES = {
    "Electrical": ["electrical", "breaker", "circuit", "wiring", "socket", "outlet", "power", "spark", "fuse", "light"],
    "Plumbing": ["plumb", "leak", "pipe", "drain", "faucet", "water heater", "toilet", "flood"],
    "HVAC": ["ac", "air condition", "hvac", "thermostat", "heating", "cooling", "ventilation", "furnace"],
    "Carpentry": ["carpentry", "wood", "door", "cabinet", "furniture", "shelf", "roof"],
    "General Maintenance": ["repair", "maintenance", "install", "broken", "fix"],
}
HAZARDS = {"fire", "smoke", "gas", "spark", "flood", "explosion", "exposed wire", "shock"}


def classify_text(text: str) -> dict:
    normalized = re.sub(r"\s+", " ", text.lower()).strip()
    scores = {category: sum(len(re.findall(r'\b' + re.escape(term) + r'\w*\b', normalized)) for term in terms) for category, terms in CATEGORY_RULES.items()}
    category, score = max(scores.items(), key=lambda item: item[1])
    if score == 0:
        category, confidence = "General Maintenance", 0.35
    else:
        confidence = min(0.97, 0.55 + (score * 0.10))

    hazards = sorted(hazard for hazard in HAZARDS if hazard in normalized)
    urgency = UrgencyLevel.EMERGENCY if any(h in hazards for h in ("fire", "gas", "explosion")) else (
        UrgencyLevel.HIGH if hazards else UrgencyLevel.MEDIUM
    )
    details = {
        "riskHeadline": "Immediate safety risk detected" if hazards else "Service issue requires assessment",
        "anomaly": f"Detected hazard indicators: {', '.join(hazards)}" if hazards else None,
        "rootCause": f"Possible {category.lower()} system fault based on the description.",
        "credentials": f"Hire a licensed {category.lower()} professional.",
        "durationHours": {"min": 1, "max": 4},
        "costRange": {"min": 50, "max": 250},
        "safetyTips": ["Do not attempt repairs beyond your training."] + (["Turn off the main supply and leave the area if unsafe."] if hazards else []),
    }
    return {"category": category, "confidence": round(confidence, 4), "urgency": urgency, "details": details}

