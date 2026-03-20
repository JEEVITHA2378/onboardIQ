"""
OnboardIQ+ — Observation Engine Service
Computes behavioral struggle scores from telemetry metadata.
"""
from models.schemas import TelemetryEntry

def compute_struggle_score(telemetry: TelemetryEntry) -> float:
    """
    Computes a struggle score based on behavioral signals, not just correctness.
    Formula: Hints(1.5) + Errors(2.0) + Retries(1.0) + Abandoned(5.0) - SpeedBonus
    """
    score = 0.0
    
    # Base negative signals
    score += telemetry.hints_requested * 1.5
    score += telemetry.errors_made * 2.0
    score += telemetry.retry_count * 1.0
    
    if telemetry.task_abandoned:
        score += 5.0
        
    # Time threshold adjustments (assuming target time is ~300s)
    # If they completed it very fast (< 60s) with no errors, they know it cold.
    target_time = 300
    if telemetry.time_spent_seconds < 60 and telemetry.errors_made == 0 and not telemetry.task_abandoned:
        score -= 2.0  # Speed bonus for fluency
    elif telemetry.time_spent_seconds > (target_time * 1.5):
        score += 1.5  # Heavy struggle signal from time alone
        
    # Clamp to non-negative
    return max(0.0, round(score, 2))


def process_session_telemetry(telemetry_list: list[TelemetryEntry]) -> list[dict]:
    """
    Processes all tasks and returns scores.
    """
    results = []
    for entry in telemetry_list:
        score = compute_struggle_score(entry)
        results.append({
            "task_id": entry.task_id,
            "struggle_score": score,
            "telemetry": entry.model_dump()
        })
    return results
