"""
OnboardIQ+ — Skill Extractor Service
Uses Claude API to extract structured skills from resumes and JDs.
"""
import os
import json
from anthropic import Anthropic
from models.schemas import Skill, RoleCategory

# Initialize Anthropic client (fallback if key missing for local dev)
anthropic_key = os.getenv("ANTHROPIC_API_KEY", "")
client = Anthropic(api_key=anthropic_key) if anthropic_key else None


def _mock_extract(text: str, is_resume: bool):
    """Fallback mock extraction when API key is not present."""
    if is_resume:
        return {
            "role_title": "Software Engineer",
            "role_category": "technical",
            "skills": [
                {"name": "Python", "category": "technical", "proficiency": "advanced", "years": 4.0},
                {"name": "React", "category": "technical", "proficiency": "intermediate", "years": 2.0},
                {"name": "Teamwork", "category": "soft", "proficiency": "advanced", "years": 4.0}
            ]
        }
    else:
        return {
            "role_title": "Senior Software Engineer",
            "role_category": "technical",
            "skills": [
                {"name": "Python", "category": "technical", "proficiency": "advanced", "years": 5.0},
                {"name": "Docker", "category": "technical", "proficiency": "intermediate", "years": 2.0},
                {"name": "System Design", "category": "technical", "proficiency": "advanced", "years": 3.0}
            ]
        }


def extract_skills_from_text(text: str, is_resume: bool = True) -> dict:
    """
    Calls Claude 3.5 Sonnet to extract skills and role context.
    Returns dict containing role_title, role_category, and skills array.
    """
    if not client:
        print("⚠️  No ANTHROPIC_API_KEY found. Using mock skill extraction.")
        return _mock_extract(text, is_resume)

    prompt = f"""
    You are an expert HR and engineering capability assessor.
    Extract the skills from the following {'resume' if is_resume else 'job description'}.
    
    1. Identify the 'role_title' (e.g., Senior Frontend Engineer, Supply Chain Manager).
    2. Identify the 'role_category' (strictly one of: "technical", "operational", or "knowledge").
    3. Extract a list of 'skills'. For each skill determine:
       - name (normalized string)
       - category ("technical" or "soft")
       - proficiency (strictly "beginner", "intermediate", or "advanced")
       - years (float, estimate 0 if not stated)
       
    Respond ONLY with valid JSON matching exactly this structure:
    {{
      "role_title": "string",
      "role_category": "string",
      "skills": [
        {{
          "name": "string",
          "category": "string",
          "proficiency": "string",
          "years": float
        }}
      ]
    }}
    
    <text>
    {text}
    </text>
    """

    try:
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=2048,
            temperature=0.1,
            system="You are a strict JSON-producing skill extraction AI. Output only raw JSON, no markdown formatting blocks.",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        response_text = response.content[0].text
        # Clean up in case Claude wraps in markdown despite instructions
        if response_text.startswith("```json"):
            response_text = response_text[7:-3]
        elif response_text.startswith("```"):
            response_text = response_text[3:-3]
            
        parsed_data = json.loads(response_text.strip())
        return parsed_data
        
    except Exception as e:
        print(f"Error calling Claude API: {e}")
        return _mock_extract(text, is_resume)
