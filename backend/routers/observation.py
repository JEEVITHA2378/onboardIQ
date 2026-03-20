"""
OnboardIQ+ — Observation Router
Receives raw behavioral telemetry from the frontend.
Computes struggle scores, grades submissions, and saves results.
"""
from fastapi import APIRouter, HTTPException
from models.schemas import ObservationSubmission, ObservationResponse, TaskResult, GradingRubric
from services.observation_engine import process_session_telemetry
from services.grading_engine import grade_submission
from models.database import save_to_store, get_from_store
import uuid
import datetime

router = APIRouter()

@router.post("/submit-observation", response_model=ObservationResponse)
async def submit_observation(submission: ObservationSubmission):
    session_id = submission.session_id
    print(f"Processing telemetry for session: {session_id}")
    
    # 1. Fetch Session to get rubric
    session = get_from_store("onboarding_sessions", session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    # In a real app, tasks would be stored in DB. We'll reconstruct the rubric loosely
    # or assume a generic one for the hackathon build if not found.
    
    results = []
    total_struggle = 0.0
    
    # Process each task result
    for entry in submission.telemetry:
        # A. Compute Behavioral Struggle Score
        from services.observation_engine import compute_struggle_score
        struggle = compute_struggle_score(entry)
        total_struggle += struggle
        
        # B. Grade Submission
        # Mock rubric since we don't persist generated tasks in DB for this demo tier
        mock_rubric = GradingRubric(
            criteria=["Did they try?", "Is it relevant?"],
            passing_threshold=0.5,
            expert_answer=""
        )
        passed, feedback = grade_submission(entry.submitted_answer, mock_rubric, "code")
        
        task_res = TaskResult(
            task_id=entry.task_id,
            struggle_score=struggle,
            passed=passed,
            feedback=feedback
        )
        results.append(task_res)
        
        # C. Save to DB
        result_record = {
            "id": str(uuid.uuid4()),
            "session_id": session_id,
            "user_id": submission.user_id,
            "task_id": entry.task_id,
            "time_spent_seconds": entry.time_spent_seconds,
            "hints_requested": entry.hints_requested,
            "errors_made": entry.errors_made,
            "retry_count": entry.retry_count,
            "task_abandoned": entry.task_abandoned,
            "struggle_score": struggle,
            "passed": passed,
            "submitted_answer": entry.submitted_answer,
            "created_at": datetime.datetime.now().isoformat()
        }
        save_to_store("simulation_results", result_record)
        
    # Update Session Status
    from models.database import update_store
    update_store("onboarding_sessions", session_id, {"status": "analyzing"})
        
    return ObservationResponse(
        session_id=session_id,
        results=results,
        overall_struggle=round(total_struggle, 2)
    )
