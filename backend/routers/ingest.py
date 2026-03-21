"""
OnboardIQ+ — Ingest Router
Accepts Resume PDF and JD text, extracts skills, normalizes, finds gaps.
"""
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from services.resume_parser import parse_resume
from services.jd_parser import parse_jd
from services.skill_extractor import extract_skills_from_text
from services.gap_analyzer import analyze_gaps
from models.schemas import IngestResponse
from models.database import save_to_store
import uuid

router = APIRouter()

@router.post("/ingest", response_model=IngestResponse)
async def ingest_documents(
    user_id: str = Form(...),
    job_description: UploadFile = File(...),
    resume: UploadFile = File(...)
):
    print(f"Ingesting docs for user: {user_id}")
    try:
        # 1. Parse documents
        print("Parsing resume PDF...")
        resume_bytes = await resume.read()
        parsed_resume = parse_resume(resume_bytes)
        
        print("Parsing JD file...")
        jd_bytes = await job_description.read()
        try:
            parsed_jd = parse_resume(jd_bytes) # Try PDF parse first
            if not parsed_jd.strip():
                parsed_jd = jd_bytes.decode()
        except:
            parsed_jd = jd_bytes.decode('utf-8', errors='ignore')
            
        parsed_jd = parse_jd(parsed_jd)
        
        # 2. Extract Skills (Claude API)
        print("Extracting skills via AI...")
        resume_extraction = extract_skills_from_text(parsed_resume, is_resume=True)
        jd_extraction = extract_skills_from_text(parsed_jd, is_resume=False)
        
        # Validate critical fields
        role_cat = jd_extraction.get("role_category", "technical")
        role_tit = jd_extraction.get("role_title", "Unknown Role")
        r_skills = resume_extraction.get("skills", [])
        j_skills = jd_extraction.get("skills", [])
        
        # 3. Analyze Gaps
        print("Analyzing skill gaps...")
        analysis = analyze_gaps(r_skills, j_skills)
        
        session_id = str(uuid.uuid4())
        
        # Save to DB
        session_data = {
            "id": session_id,
            "user_id": user_id,
            "role_category": role_cat,
            "role_title": role_tit,
            "extracted_resume_skills": [s for s in r_skills],
            "jd_required_skills": [s for s in j_skills],
            "skill_gaps": [gap.model_dump() for gap in analysis["gaps"]],
            "status": "in_progress"
        }
        print("Saving session to database...")
        save_to_store("onboarding_sessions", session_data)
        
        return IngestResponse(
            session_id=session_id,
            resume_skills=r_skills,
            jd_required_skills=j_skills,
            role_category=role_cat,
            role_title=role_tit,
            gaps=analysis["gaps"],
            matches=analysis["matches"]
        )
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
