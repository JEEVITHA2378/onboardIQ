"""
OnboardIQ+ — Pathway Router
Builds the final retroactive learning pathway based on simulation struggle points.
"""
from fastapi import APIRouter, HTTPException
from models.schemas import PathwayResponse, PathwayModule
from services.pathway_generator import generate_learning_pathway
from services.reasoning_trace import generate_reasoning
from models.database import get_from_store, query_store, update_store

router = APIRouter()

@router.get("/generate-pathway/{session_id}", response_model=PathwayResponse)
async def get_pathway(session_id: str):
    print(f"Generating pathway for session: {session_id}")
    
    # 1. Fetch data
    session = get_from_store("onboarding_sessions", session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    results = query_store("simulation_results", {"session_id": session_id})
    if not results:
        # Generate mock pathway if we bypassed simulation for testing
        print("No simulation results, substituting mocks")
        results = [
            {"task_id": "test", "struggle_score": 5.5, "passed": False}
        ]
        
    target_role = session.get("role_title", "Unknown Role")
    gaps_data = session.get("skill_gaps", [])
    
    # 2. Identify specifically which gaps they struggled on (score > 4.0 threshold)
    # Map tasks back to gap skills. (In a full build, simulation_results would link to the skill_tested)
    # We will use the gaps_data directly and mock the mapping
    skills_struggled = []
    skills_proven = []
    
    # If they passed and struggle score was low, it's proven.
    # Otherwise, it remains a gap we need training for.
    for gap in gaps_data:
        skill_name = gap.get("skill_name", "")
        # Very simplified mock mapping: if they had a gap, they struggled.
        skills_struggled.append(skill_name)
    
    # 3. Generate DAG Pathway
    pathway_modules = generate_learning_pathway(skills_struggled)
    
    # 4. Generate Reasoning Traces (Claude API)
    traces = []
    for mod in pathway_modules:
        trace_text = generate_reasoning(
            module=mod,
            gap_skill=mod.skill_taught,
            observation_score=6.5, # Mock score
            target_role=target_role
        )
        mod.reasoning_trace = trace_text
        traces.append({"module_id": mod.id, "trace": trace_text})
        
    # Calculate Impact (Time Saved)
    # Generic standard pathway = 40 modules * 45 mins = 30 hours
    generic_hours = 30
    custom_hours = sum([m.duration_minutes for m in pathway_modules]) / 60.0
    time_saved = max(0, int(generic_hours - custom_hours))
    
    # Readness score based on gaps delta
    readiness = max(10, 100 - (len(skills_struggled) * 15))
    
    # 5. Save final results to session DB
    update_data = {
        "learning_pathway": [m.model_dump() for m in pathway_modules],
        "reasoning_trace": traces,
        "job_readiness_score": readiness,
        "skills_proven": skills_proven,
        "time_saved_hours": time_saved,
        "status": "completed"
    }
    update_store("onboarding_sessions", session_id, update_data)
        
    return PathwayResponse(
        session_id=session_id,
        job_readiness_score=readiness,
        pathway=pathway_modules,
        reasoning_traces=traces,
        skills_proven=skills_proven,
        skill_gaps=skills_struggled,
        time_saved_hours=time_saved
    )
