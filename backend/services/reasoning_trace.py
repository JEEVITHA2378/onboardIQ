"""
OnboardIQ+ — Reasoning Trace Service
Generates natural language explanations linking telemetry → gap → module.
"""
import os
from anthropic import Anthropic
from models.schemas import PathwayModule

anthropic_key = os.getenv("ANTHROPIC_API_KEY", "")
client = Anthropic(api_key=anthropic_key) if anthropic_key else None


def _mock_trace(module: PathwayModule, target_role: str):
    return f"This module was added because the user showed specific observed behaviour indicating a gap in {module.skill_taught} which is a prerequisite for target competency required in the {target_role} role."


def generate_reasoning(module: PathwayModule, gap_skill: str, observation_score: float, target_role: str) -> str:
    """
    Generates the explanation trace linking observation to recommendation.
    """
    if not client:
        return _mock_trace(module, target_role)
        
    prompt = f"""
    Write a 1-2 sentence "reasoning trace" explaining why a specific training module was assigned.
    
    Format EXACTLY like this (fill in the blanks with the context below, adapt wording to sound natural):
    "This module was added because the user showed [describe struggle based on score] during a simulation task, indicating a gap in [gap skill], which is a prerequisite for [target role]."
    
    Context:
    - Module assigned: {module.title} (teaches {module.skill_taught})
    - Underlying skill gap identified: {gap_skill}
    - User Struggle Score: {observation_score} (Scale 0-10, where >4 is a struggle)
    - Target Role: {target_role}
    
    Return ONLY the raw sentence, no quotes, no markdown.
    """

    try:
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=150,
            temperature=0.3,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        return response.content[0].text.strip()
    except Exception as e:
        print(f"Error generating trace: {e}")
        return _mock_trace(module, target_role)
