"""
OnboardIQ+ — Dashboard Router
Fetches aggregated data for the final impact dashboard and previous sessions.
"""
from fastapi import APIRouter, HTTPException
from models.schemas import DashboardResponse, SessionsListResponse
from models.database import get_from_store, query_store

router = APIRouter()

@router.get("/dashboard/{session_id}", response_model=DashboardResponse)
async def get_dashboard(session_id: str):
    print(f"Fetching dashboard for session: {session_id}")
    session = get_from_store("onboarding_sessions", session_id)
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    results = query_store("simulation_results", {"session_id": session_id})
    
    return DashboardResponse(
        session_id=session_id,
        job_readiness_score=session.get("job_readiness_score", 0),
        skills_proven=session.get("skills_proven", []),
        skill_gaps=session.get("skill_gaps", []),
        learning_pathway=session.get("learning_pathway", []),
        reasoning_trace=session.get("reasoning_trace", []),
        time_saved_hours=session.get("time_saved_hours", 0),
        total_modules=40,
        modules_skipped=40 - len(session.get("learning_pathway", [])),
        days_to_ready=max(1, len(session.get("learning_pathway", [])) * 2), # Assuming 1 module per 2 days
        simulation_results=results
    )


@router.get("/sessions/{user_id}", response_model=SessionsListResponse)
async def get_user_sessions(user_id: str):
    print(f"Fetching sessions for user: {user_id}")
    sessions = query_store("onboarding_sessions", {"user_id": user_id}, order_by="created_at")
    
    summary_list = []
    for s in sessions:
        summary_list.append({
            "id": s.get("id"),
            "session_id": s.get("id"),
            "role_title": s.get("role_title", "Unknown Role"),
            "role_category": s.get("role_category", "technical"),
            "job_readiness_score": s.get("job_readiness_score"),
            "status": s.get("status", "in_progress"),
            "created_at": s.get("created_at", "2024-01-01T00:00:00Z"),
            "skills_count": len(s.get("extracted_resume_skills", [])),
            "gaps_count": len(s.get("skill_gaps", []))
        })
        
    return SessionsListResponse(
        user_id=user_id,
        sessions=summary_list
    )
