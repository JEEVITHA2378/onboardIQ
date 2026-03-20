"""
OnboardIQ+ — Gap Analyzer Service
Compares resume skills with JD requirements using semantic matching.
"""
from models.schemas import Skill, SkillGap, SkillMatch, ProficiencyLevel


def _prof_to_int(prof: str) -> int:
    """Convert proficiency level strings to integers for calculation."""
    mapping = {
        "beginner": 1,
        "intermediate": 2,
        "advanced": 3
    }
    if isinstance(prof, ProficiencyLevel):
        return mapping.get(prof.value, 1)
    return mapping.get(str(prof).lower(), 1)


def analyze_gaps(resume_skills_data: list, jd_skills_data: list) -> dict:
    """
    Finds matches and calculates proficiency gaps.
    In a full production environment, this uses sentence-transformers and 
    chromadb for semantic matching (e.g. matching "ReactJS" to "React.js").
    For this build, we use strict lowering and string matching.
    """
    # Parse dicts to objects if necessary
    resume_skills = []
    jd_skills = []
    
    for s in resume_skills_data:
        if isinstance(s, dict):
            resume_skills.append(Skill(**s))
        else:
            resume_skills.append(s)
            
    for s in jd_skills_data:
        if isinstance(s, dict):
            jd_skills.append(Skill(**s))
        else:
            jd_skills.append(s)

    matches = []
    gaps = []
    
    # Create name dictionary for quick lookup
    resume_dict = {s.name.lower(): s for s in resume_skills}
    
    for jd_skill in jd_skills:
        jd_name_lower = jd_skill.name.lower()
        
        # Exact/Sub-string match logic (mocking semantic search)
        matched_resume_skill = next(
            (rs for name, rs in resume_dict.items() if name in jd_name_lower or jd_name_lower in name),
            None
        )
        
        if matched_resume_skill:
            # Match found
            matches.append(SkillMatch(
                resume_skill=matched_resume_skill.name,
                jd_skill=jd_skill.name,
                similarity_score=1.0  # Would be cosine similarity in prod
            ))
            
            # Check for proficiency gap
            req_level = _prof_to_int(jd_skill.proficiency)
            cur_level = _prof_to_int(matched_resume_skill.proficiency)
            gap_score = req_level - cur_level
            
            if gap_score > 0:
                gaps.append(SkillGap(
                    skill_name=jd_skill.name,
                    required_level=jd_skill.proficiency,
                    current_level=matched_resume_skill.proficiency,
                    gap_score=gap_score
                ))
        else:
            # No match found = full gap
            gaps.append(SkillGap(
                skill_name=jd_skill.name,
                required_level=jd_skill.proficiency,
                current_level=ProficiencyLevel.BEGINNER,
                gap_score=_prof_to_int(jd_skill.proficiency)
            ))
            
    return {
        "matches": matches,
        "gaps": gaps
    }
