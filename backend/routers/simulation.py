"""
OnboardIQ+ — Simulation Tasks Router
Retrieves generated simulation tasks targeting a specific session's skill gaps.
"""
from fastapi import APIRouter, HTTPException
import json
from models.schemas import SimulationTasksResponse, RoleCategory, SkillGap, TaskResult, HintRequest
from services.task_generator import generate_tasks
from models.database import get_from_store
from anthropic import Anthropic
import os

router = APIRouter()
client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY", "mock_key"))

@router.get("/simulation-tasks/{session_id}", response_model=SimulationTasksResponse)
async def get_simulation_tasks(session_id: str):
    print(f"Generating simulation tasks for session: {session_id}")
    
    # 1. Fetch Session
    session = get_from_store("onboarding_sessions", session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    gaps_data = session.get("skill_gaps", [])
    if not gaps_data:
        print("No gaps found, generating empty task list")
        return SimulationTasksResponse(
            session_id=session_id,
            role_category=session.get("role_category", "technical"),
            role_title=session.get("role_title", "Unknown Role"),
            tasks=[]
        )
        
    # Convert gap dicts back to models
    try:
        skill_gaps = [SkillGap(**gap_dict) for gap_dict in gaps_data]
    except Exception as e:
        print(f"Error parsing gaps data: {e}. Data: {gaps_data}")
        # Fallback to mock gaps if DB parsing fails
        skill_gaps = [SkillGap(skill_name="Python", required_level="advanced", current_level="beginner", gap_score=2)]
        
    cat_str = session.get("role_category", "technical")
    role_cat = getattr(RoleCategory, cat_str.upper(), RoleCategory.TECHNICAL)
    role_title = session.get("role_title", "Unknown Role")
    
    # 2. Generate Tasks via Claude
    tasks = generate_tasks(skill_gaps, role_cat, role_title)
    
    return SimulationTasksResponse(
        session_id=session_id,
        role_category=role_cat,
        role_title=role_title,
        tasks=tasks
    )

@router.post("/hint")
async def get_hint(request: HintRequest):
    try:
        response = client.messages.create(
            model=os.getenv("MODEL_NAME", "claude-3-5-sonnet-20241022"),
            max_tokens=200,
            system="You are a helpful coding mentor. Give a short, useful hint for the task without revealing the full answer. Maximum 2 sentences.",
            messages=[{
                "role": "user",
                "content": f"Task: {request.task_title}\n\nDescription: {request.task_description}\n\nGive a helpful hint."
            }]
        )
        return {"hint": response.content[0].text}
    except Exception as e:
        return {"hint": "Break the problem into smaller steps and focus on the core concept being tested."}
