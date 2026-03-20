"""
OnboardIQ+ — Task Generator Service
Uses Claude to dynamically generate simulation tasks targeting identified skill gaps.
"""
import os
import json
from anthropic import Anthropic
from models.schemas import SimulationTask, RoleCategory

anthropic_key = os.getenv("ANTHROPIC_API_KEY", "")
client = Anthropic(api_key=anthropic_key) if anthropic_key else None


def _mock_generate_tasks(gaps: list, role_category: RoleCategory):
    """Fallback when no Anthropic API key is provided."""
    tasks = []
    
    # Generate 1-2 code tasks for technical, otherwise scenario/written
    if role_category == RoleCategory.TECHNICAL:
        tasks.append(
            SimulationTask(
                id="task_mock_python_01",
                title="Fix the Race Condition",
                description="The following Python async function occasionally drops data under load. Implement a thread-safe pattern.\n\n```python\nimport asyncio\nresults = []\n\nasync def process_item(item):\n    # Imagine a DB call here\n    await asyncio.sleep(0.1)\n    results.append(item)\n```",
                task_type="code",
                input_type="monaco",
                skill_tested="Python Concurrency",
                difficulty="advanced",
                grading_rubric={
                    "criteria": ["Identifies race condition on list append", "Uses asyncio.Lock or Queue"],
                    "passing_threshold": 0.8,
                    "expert_answer": "Use an asyncio.Queue to serialize updates or an asyncio.Lock around the append."
                }
            )
        )
        tasks.append(
            SimulationTask(
                id="task_mock_sql_01",
                title="Optimize this Query",
                description="The `users` table has 10M rows. This query is taking 5 seconds. How would you optimize it?\n\n```sql\nSELECT * FROM users WHERE LOWER(email) = 'test@example.com';\n```",
                task_type="code",
                input_type="monaco",
                skill_tested="SQL Optimization",
                difficulty="intermediate",
                grading_rubric={
                    "criteria": ["Suggests abandoning LOWER() or using expression index", "Suggests indexing email column"],
                    "passing_threshold": 0.6,
                    "expert_answer": "Create an expression index: CREATE INDEX idx_users_email_lower ON users (LOWER(email)); Or enforce lowercase on insert and use a standard B-tree index."
                }
            )
        )
    else:
         tasks.append(
            SimulationTask(
                id="task_mock_op_01",
                title="Escalation SLA Breach",
                description="A Tier-1 supplier just missed their delivery SLA by 24 hours, threatening our production line tomorrow morning. Write an escalation email to their Account Manager outlining the impact and demanding an immediate mitigation plan.",
                task_type="written",
                input_type="textarea",
                skill_tested="Vendor Communication",
                difficulty="intermediate",
                grading_rubric={
                    "criteria": ["Clearly states the SLA breach and impact", "Maintains professional urgency without aggression", "Demands a specific action/mitigation plan"],
                    "passing_threshold": 0.7,
                    "expert_answer": "Subject: URGENT: SLA Breach on PO #12345 - Mitigation Required\n\nHi [Name],\n\nThe delivery for PO #12345 is now 24 hours past the SLA. This threatens our production line schedule for tomorrow morning.\n\nPlease provide an immediate update on the shipment status and your mitigation plan to expedite delivery within the next 4 hours.\n\nRegards,"
                }
            )
        )
         
    return tasks


def generate_tasks(skill_gaps: list, role_category: RoleCategory, role_title: str) -> list[SimulationTask]:
    """
    Dynamically generates 3-5 assessment tasks targeting exactly the skill gaps identified.
    """
    if not skill_gaps:
        return []
        
    if not client:
        return _mock_generate_tasks(skill_gaps, role_category)
        
    # Serialize gaps for the prompt
    gaps_json = json.dumps([g.model_dump() for g in skill_gaps])
    
    prompt = f"""
    You are an expert technical assessor and behavioral evaluator.
    Design an interactive simulation assessment for a "{role_title}" ({role_category.value} role).
    
    You must design tasks to specifically evaluate these identified skill gaps:
    {gaps_json}
    
    Rules for Task Types:
    - If {role_category.value} == "technical": strictly use "code" tasks (debugging, architecture, query writing). Input type: "monaco".
    - If {role_category.value} == "operational": use "scenario" tasks (resource allocation, inventory decisions). Input type: "textarea".
    - If {role_category.value} == "knowledge": use "written" tasks (prioritization, policy interpretation). Input type: "textarea".
    
    Generate 2 to 4 tasks. Do not generate tasks for skills outside the gaps list.
    
    Respond ONLY with valid JSON matching exactly this structure:
    [
      {{
        "id": "unique-task-id",
        "title": "Short Task Title",
        "description": "Detailed scenario setup. Include code blocks if technical.",
        "task_type": "code|scenario|written",
        "input_type": "monaco|textarea",
        "skill_tested": "The specific skill from the gaps list",
        "difficulty": "beginner|intermediate|advanced",
        "grading_rubric": {{
          "criteria": ["Check 1", "Check 2", "Check 3"],
          "passing_threshold": 0.7,
          "expert_answer": "The ideal solution or response"
        }}
      }}
    ]
    """

    try:
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=3000,
            temperature=0.2,
            system="You are a strict JSON-producing assessment engine. Output only raw JSON array, no markdown.",
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
        
        tasks = []
        for item in parsed_data:
            tasks.append(SimulationTask(**item))
            
        return tasks
        
    except Exception as e:
        print(f"Error generating tasks via Claude: {e}")
        return _mock_generate_tasks(skill_gaps, role_category)
