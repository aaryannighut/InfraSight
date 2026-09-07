"""
Cost Estimation & Priority Ranking Engine for CRACKWATCH.
Estimates repair costs in INR, ranks by urgency, generates repair plans.
"""

from datetime import datetime, timezone

# Repair cost database (INR) — based on Indian municipal road repair rates
REPAIR_COSTS = {
    "D00": {  # Longitudinal Crack
        "minor": {"min": 500, "max": 2000, "method": "Crack sealing", "time": "1-2 hours", "crew": 2},
        "warning": {"min": 2000, "max": 8000, "method": "Routing and sealing", "time": "2-4 hours", "crew": 3},
        "critical": {"min": 8000, "max": 25000, "method": "Full-depth patching", "time": "4-8 hours", "crew": 5},
    },
    "D10": {  # Transverse Crack
        "minor": {"min": 800, "max": 3000, "method": "Crack filling", "time": "1-2 hours", "crew": 2},
        "warning": {"min": 3000, "max": 12000, "method": "Partial-depth repair", "time": "3-5 hours", "crew": 4},
        "critical": {"min": 12000, "max": 35000, "method": "Full-depth reclamation", "time": "6-10 hours", "crew": 6},
    },
    "D20": {  # Alligator Crack — most severe
        "minor": {"min": 3000, "max": 10000, "method": "Surface seal coat", "time": "2-4 hours", "crew": 3},
        "warning": {"min": 10000, "max": 40000, "method": "Mill and overlay", "time": "1-2 days", "crew": 6},
        "critical": {"min": 40000, "max": 150000, "method": "Full-depth reclamation + overlay", "time": "2-5 days", "crew": 8},
    },
    "D40": {  # Pothole
        "minor": {"min": 1000, "max": 3000, "method": "Throw-and-roll patch", "time": "30 min", "crew": 2},
        "warning": {"min": 3000, "max": 10000, "method": "Semi-permanent patch", "time": "1-2 hours", "crew": 3},
        "critical": {"min": 10000, "max": 30000, "method": "Full-depth repair", "time": "3-6 hours", "crew": 5},
    },
    "spalling": {
        "minor": {"min": 2000, "max": 5000, "method": "Surface grinding", "time": "1-2 hours", "crew": 2},
        "warning": {"min": 5000, "max": 15000, "method": "Concrete patching", "time": "2-4 hours", "crew": 3},
        "critical": {"min": 15000, "max": 50000, "method": "Structural repair + overlay", "time": "1-3 days", "crew": 6},
    },
    "corrosion": {
        "minor": {"min": 3000, "max": 8000, "method": "Rust treatment + sealant", "time": "2-3 hours", "crew": 2},
        "warning": {"min": 8000, "max": 25000, "method": "Section replacement", "time": "4-8 hours", "crew": 4},
        "critical": {"min": 25000, "max": 80000, "method": "Structural reinforcement", "time": "2-5 days", "crew": 6},
    },
    "leak": {
        "minor": {"min": 1500, "max": 5000, "method": "Joint sealing", "time": "1-2 hours", "crew": 2},
        "warning": {"min": 5000, "max": 20000, "method": "Pipe repair + resurfacing", "time": "4-8 hours", "crew": 4},
        "critical": {"min": 20000, "max": 60000, "method": "Pipeline replacement", "time": "1-3 days", "crew": 6},
    },
}

# Degradation multiplier — cost increases if ignored
IGNORE_MULTIPLIER = {
    "minor": 3.0,      # ₹1K → ₹3K in 6 months
    "warning": 4.0,     # ₹10K → ₹40K in 6 months
    "critical": 6.0,    # ₹40K → ₹240K in 6 months
    "building_crack": {
        "minor": {"min": 2000, "max": 8000, "method": "Epoxy injection", "time": "2-3 hours", "crew": 2},
        "warning": {"min": 8000, "max": 30000, "method": "Structural patching + reinforcement", "time": "1-2 days", "crew": 4},
        "critical": {"min": 30000, "max": 100000, "method": "Structural reinforcement + underpinning", "time": "3-7 days", "crew": 8},
    },
    "pipe_damage": {
        "minor": {"min": 5000, "max": 15000, "method": "Pipe patch repair", "time": "2-4 hours", "crew": 3},
        "warning": {"min": 15000, "max": 50000, "method": "Section replacement", "time": "1-2 days", "crew": 5},
        "critical": {"min": 50000, "max": 200000, "method": "Full pipeline replacement", "time": "3-10 days", "crew": 8},
    },
    "Longitudinal Crack": {  # Map display names to costs too
        "minor": {"min": 500, "max": 2000, "method": "Crack sealing", "time": "1-2 hours", "crew": 2},
        "warning": {"min": 2000, "max": 8000, "method": "Routing and sealing", "time": "2-4 hours", "crew": 3},
        "critical": {"min": 8000, "max": 25000, "method": "Full-depth patching", "time": "4-8 hours", "crew": 5},
    },
    "Transverse Crack": {
        "minor": {"min": 800, "max": 3000, "method": "Crack filling", "time": "1-2 hours", "crew": 2},
        "warning": {"min": 3000, "max": 12000, "method": "Partial-depth repair", "time": "3-5 hours", "crew": 4},
        "critical": {"min": 12000, "max": 35000, "method": "Full-depth reclamation", "time": "6-10 hours", "crew": 6},
    },
    "Alligator Crack": {
        "minor": {"min": 3000, "max": 10000, "method": "Surface seal coat", "time": "2-4 hours", "crew": 3},
        "warning": {"min": 10000, "max": 40000, "method": "Mill and overlay", "time": "1-2 days", "crew": 6},
        "critical": {"min": 40000, "max": 150000, "method": "Full-depth reclamation + overlay", "time": "2-5 days", "crew": 8},
    },
    "Potholes": {
        "minor": {"min": 1000, "max": 3000, "method": "Throw-and-roll patch", "time": "30 min", "crew": 2},
        "warning": {"min": 3000, "max": 10000, "method": "Semi-permanent patch", "time": "1-2 hours", "crew": 3},
        "critical": {"min": 10000, "max": 30000, "method": "Full-depth repair", "time": "3-6 hours", "crew": 5},
    },
}

URGENCY_SCORES = {
    "critical": 100,
    "warning": 60,
    "minor": 20,
}

import os
import json

COST_FEEDBACK_FILE = os.path.join(os.path.dirname(__file__), "cost_feedback_store.json")

def _load_cost_feedback() -> list:
    try:
        if os.path.exists(COST_FEEDBACK_FILE):
            with open(COST_FEEDBACK_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
    except Exception:
        pass
    return []

def _save_cost_feedback(data: list):
    try:
        with open(COST_FEEDBACK_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception:
        pass

COST_FEEDBACK_DATA = _load_cost_feedback()

def record_cost_feedback(damage_type: str, severity_label: str, ai_cost: float, inspector_cost: float) -> dict:
    """
    Record inspector manual cost override to continuously train future AI price estimates.
    """
    if not ai_cost or ai_cost <= 0 or not inspector_cost or inspector_cost <= 0:
        return {}

    ratio = float(inspector_cost) / float(ai_cost)
    entry = {
        "damage_type": str(damage_type or "General Defect"),
        "severity_label": str(severity_label or "minor"),
        "ai_cost": float(ai_cost),
        "inspector_cost": float(inspector_cost),
        "ratio": ratio,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    COST_FEEDBACK_DATA.append(entry)
    _save_cost_feedback(COST_FEEDBACK_DATA)

    mult, count = get_learned_cost_multiplier(damage_type, severity_label)
    print(f"[AI PRICE LEARNING] Recorded feedback. New learned multiplier for {damage_type}: {mult:.3f}x across {count} samples")
    return {"learned_multiplier": mult, "sample_count": count}

def get_learned_cost_multiplier(damage_type: str = None, severity_label: str = None) -> tuple[float, int]:
    """
    Returns (learned_multiplier, total_samples).
    """
    if not COST_FEEDBACK_DATA:
        return 1.0, 0

    matching = [
        e["ratio"] for e in COST_FEEDBACK_DATA
        if (not damage_type or str(e.get("damage_type")).lower() in str(damage_type).lower() or str(damage_type).lower() in str(e.get("damage_type")).lower())
    ]
    if not matching:
        matching = [e["ratio"] for e in COST_FEEDBACK_DATA]

    if not matching:
        return 1.0, 0

    avg_mult = sum(matching) / len(matching)
    clamped_mult = max(0.5, min(3.0, avg_mult))
    return round(clamped_mult, 3), len(matching)


def estimate_cost(detection: dict) -> dict:
    """Estimate repair cost for a single detection with continuous AI price learning."""
    cls = detection.get("class_name", "D00")
    severity = detection.get("severity_label", "minor")

    costs = REPAIR_COSTS.get(cls, REPAIR_COSTS.get("D00", {}))
    level = costs.get(severity, costs.get("minor", {}))

    cost_min = level.get("min", 1000)
    cost_max = level.get("max", 5000)
    cost_avg = (cost_min + cost_max) // 2

    # Scale by area ratio — bigger damage = higher cost
    area_ratio = detection.get("area_ratio", 5)
    area_multiplier = 1 + (area_ratio / 100) * 2  # 0-100% → 1x-3x
    raw_cost_estimated = int(cost_avg * area_multiplier)

    # Apply continuous learning multiplier from past inspector overrides
    learned_mult, sample_count = get_learned_cost_multiplier(detection.get("display_name") or cls, severity)
    cost_estimated = int(raw_cost_estimated * learned_mult)

    # If ignored cost
    ignore_mult = IGNORE_MULTIPLIER.get(severity, 3.0)
    cost_if_ignored = int(cost_estimated * ignore_mult)
    savings = cost_if_ignored - cost_estimated

    return {
        "cost_min": cost_min,
        "cost_max": cost_max,
        "raw_ai_cost": raw_cost_estimated,
        "cost_estimated": cost_estimated,
        "learned_multiplier": learned_mult,
        "learning_samples": sample_count,
        "cost_if_ignored": cost_if_ignored,
        "savings_if_fixed_now": savings,
        "repair_method": level.get("method", "Professional assessment"),
        "repair_time": level.get("time", "TBD"),
        "crew_size": level.get("crew", 2),
        "currency": "INR",
    }


def rank_priorities(detections: list) -> list:
    """Rank detections by urgency score. Highest priority first."""
    ranked = []
    for i, det in enumerate(detections):
        severity = det.get("severity_label", "minor")
        confidence = det.get("confidence", 0)
        area = det.get("area_ratio", 0)

        # Urgency = base severity + confidence bonus + area bonus
        urgency = (
            URGENCY_SCORES.get(severity, 20)
            + confidence * 20
            + min(area, 50)
        )

        cost_info = estimate_cost(det)

        ranked.append({
            **det,
            "priority_rank": 0,  # filled after sorting
            "urgency_score": round(urgency, 1),
            "cost": cost_info,
        })

    # Sort by urgency descending
    ranked.sort(key=lambda x: x["urgency_score"], reverse=True)
    for i, r in enumerate(ranked):
        r["priority_rank"] = i + 1

    return ranked


def generate_repair_plan(detections: list, location: str = "Unknown") -> dict:
    """
    Generate a complete repair plan from detections.
    This is the "What should I fix today?" output.
    """
    ranked = rank_priorities(detections)

    total_cost = sum(d["cost"]["cost_estimated"] for d in ranked)
    total_if_ignored = sum(d["cost"]["cost_if_ignored"] for d in ranked)
    total_savings = total_if_ignored - total_cost

    critical = [d for d in ranked if d.get("severity_label") == "critical"]
    warnings = [d for d in ranked if d.get("severity_label") == "warning"]
    minor = [d for d in ranked if d.get("severity_label") == "minor"]

    # Build action items
    actions = []
    for d in ranked[:5]:  # Top 5 priorities
        actions.append({
            "priority": d["priority_rank"],
            "damage_type": d.get("display_name", d.get("class_name")),
            "severity": d.get("severity_label"),
            "urgency_score": d["urgency_score"],
            "location": location,
            "repair_method": d["cost"]["repair_method"],
            "estimated_cost": f"₹{d['cost']['cost_estimated']:,}",
            "repair_time": d["cost"]["repair_time"],
            "crew_needed": d["cost"]["crew_size"],
            "cost_if_delayed": f"₹{d['cost']['cost_if_ignored']:,}",
            "savings": f"₹{d['cost']['savings_if_fixed_now']:,}",
        })

    plan = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "location": location,
        "summary": {
            "total_defects": len(ranked),
            "critical_count": len(critical),
            "warning_count": len(warnings),
            "minor_count": len(minor),
            "total_repair_cost": f"₹{total_cost:,}",
            "cost_if_ignored_6months": f"₹{total_if_ignored:,}",
            "potential_savings": f"₹{total_savings:,}",
            "recommended_action": (
                "IMMEDIATE REPAIR REQUIRED — Critical structural damage detected"
                if critical
                else "SCHEDULED MAINTENANCE — Monitor and repair within 30 days"
                if warnings
                else "ROUTINE INSPECTION — Minor issues detected, low priority"
            ),
        },
        "top_priorities": actions,
        "all_detections": ranked,
    }

    return plan


def explain_severity(detection: dict) -> dict:
    """
    Explainable AI — tell the user WHY severity is what it is.
    """
    severity = detection.get("severity", 0)
    severity_label = detection.get("severity_label", "minor")
    confidence = detection.get("confidence", 0)
    area_ratio = detection.get("area_ratio", 0)
    class_name = detection.get("class_name", "")

    factors = []

    # Area factor
    if area_ratio > 20:
        factors.append({"factor": "Large damage area", "impact": "high", "detail": f"Covers {area_ratio}% of inspected region — indicates widespread deterioration"})
    elif area_ratio > 5:
        factors.append({"factor": "Moderate damage area", "impact": "medium", "detail": f"Covers {area_ratio}% of inspected region"})
    else:
        factors.append({"factor": "Small damage area", "impact": "low", "detail": f"Covers {area_ratio}% — localized damage"})

    # Confidence factor
    if confidence > 0.7:
        factors.append({"factor": "High detection confidence", "impact": "high", "detail": f"AI is {confidence*100:.0f}% certain this is real damage"})
    elif confidence > 0.4:
        factors.append({"factor": "Moderate confidence", "impact": "medium", "detail": f"AI is {confidence*100:.0f}% certain — recommend manual verification"})
    else:
        factors.append({"factor": "Low confidence", "impact": "low", "detail": f"AI is {confidence*100:.0f}% certain — needs manual inspection"})

    # Damage type factor
    high_risk_types = {"D20", "D40", "leak"}
    if class_name in high_risk_types:
        factors.append({"factor": "High-risk damage type", "impact": "high", "detail": f"{detection.get('display_name', class_name)} is classified as high-risk for structural integrity"})
    else:
        factors.append({"factor": "Moderate-risk damage type", "impact": "medium", "detail": f"{detection.get('display_name', class_name)} — monitor for progression"})

    return {
        "severity_score": severity,
        "severity_label": severity_label,
        "explanation": f"Severity {severity}% = {severity_label.upper()} because: {'large area' if area_ratio > 10 else 'moderate area'} ({area_ratio}%) + {'high' if confidence > 0.5 else 'moderate'} confidence ({confidence*100:.0f}%) + {'high' if class_name in high_risk_types else 'moderate'}-risk damage type",
        "factors": factors,
        "recommendation": (
            "Immediate repair required. Delay increases cost by 4-6x."
            if severity_label == "critical"
            else "Schedule repair within 30 days. Delay increases cost by 3-4x."
            if severity_label == "warning"
            else "Monitor during next inspection cycle. Low immediate risk."
        ),
    }
