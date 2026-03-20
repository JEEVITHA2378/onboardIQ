"""
OnboardIQ+ — RAG Retriever Service
Retrieves relevant course modules from ChronmaDB/JSON.
"""
import json
import os

# Fallback for hackathon demo environments where ChromaDB C++ build fails on Windows
def get_courses_for_skills(skills: list[str]) -> list[dict]:
    """
    Mock RAG implementation that searches the local course_catalog.json
    instead of using an external vector database.
    """
    print(f"Mock RAG searching for skills: {skills}")
    
    courses = []
    
    try:
        # Load the mock data
        catalog_path = os.path.join(os.path.dirname(__file__), "..", "data", "course_catalog.json")
        with open(catalog_path, 'r') as f:
            catalog = json.load(f)
            
        # Very simple text matching fallback for demo
        for course in catalog:
            for skill in skills:
                # If skill name is vaguely in course title or description
                if skill.lower() in course["title"].lower() or \
                   skill.lower() in course["description"].lower() or \
                   skill.lower() in [t.lower() for t in course.get("tags", [])]:
                    if course not in courses:
                        courses.append(course)
                        
        # If we couldn't find matches, return a generic one to keep the pathway building
        if not courses:
            courses.append({
                "id": "generic-technical-01",
                "title": f"Fundamentals of {skills[0] if skills else 'Technical Skills'}",
                "description": "Comprehensive overview covering core concepts.",
                "duration_minutes": 45,
                "level": "beginner",
                "prerequisites": [],
                "tags": [skills[0] if skills else "Technical"]
            })
            
    except Exception as e:
        print(f"Error reading local catalog for mock RAG: {e}")
        
    return courses[:5] # Return top 5 matches
