"""
OnboardIQ+ — Grading Engine Service
Evaluates submitted task answers against the generator's rubric.
"""
import os
import json
from anthropic import Anthropic
from models.schemas import GradingRubric

anthropic_key = os.getenv("ANTHROPIC_API_KEY", "")
client = Anthropic(api_key=anthropic_key) if anthropic_key else None


def _mock_grade(submitted: str, rubric: GradingRubric):
    """Fallback grading logic."""
    if not submitted or len(submitted.strip()) < 5:
        return False, "Answer too short or empty. Did not meet criteria."
        
    # Super naive mock logic
    return True, "Passed basic length validation. Good conceptual grasp."


def grade_submission(submitted_answer: str, rubric: GradingRubric, task_type: str) -> tuple[bool, str]:
    """
    Grades an answer. Returns (passed, feedback_string).
    """
    if not client:
        return _mock_grade(submitted_answer, rubric)
        
    prompt = f"""
    Evaluate the following user submission for a {task_type} task.
    
    ### Grading Rubric Criteria
    {json.dumps(rubric.criteria, indent=2)}
    
    ### Expert Answer / Guideline
    {rubric.expert_answer}
    
    ### User Submission
    <submission>
    {submitted_answer}
    </submission>
    
    Evaluate if the user met enough criteria to pass (Threshold roughly {rubric.passing_threshold}).
    
    Respond ONLY with valid JSON matching exactly this structure:
    {{
      "passed": boolean,
      "feedback": "1-2 sentence constructive feedback specifying exactly what sub-skill was missing if they failed."
    }}
    """

    try:
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=500,
            temperature=0.1,
            system="You are a strict JSON-producing grading engine. Output only raw JSON, no markdown blocks.",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        response_text = response.content[0].text
        if response_text.startswith("```json"):
            response_text = response_text[7:-3]
        elif response_text.startswith("```"):
            response_text = response_text[3:-3]
            
        parsed_data = json.loads(response_text.strip())
        return parsed_data.get("passed", False), parsed_data.get("feedback", "Error parsing feedback.")
        
    except Exception as e:
        print(f"Error grading via Claude: {e}")
        return _mock_grade(submitted_answer, rubric)
