"""
OnboardIQ+ — Pydantic Schemas
All request/response models for the API.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


# --- Enums ---

class ProficiencyLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class RoleCategory(str, Enum):
    TECHNICAL = "technical"
    OPERATIONAL = "operational"
    KNOWLEDGE = "knowledge"


class TaskType(str, Enum):
    CODE = "code"
    SCENARIO = "scenario"
    WRITTEN = "written"


class SessionStatus(str, Enum):
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


# --- Skill Models ---

class Skill(BaseModel):
    name: str
    category: str = Field(description="technical or soft")
    proficiency: ProficiencyLevel = ProficiencyLevel.BEGINNER
    years: Optional[float] = 0


class SkillGap(BaseModel):
    skill_name: str
    required_level: ProficiencyLevel
    current_level: ProficiencyLevel
    gap_score: int = Field(description="required_level_int - current_level_int")


class SkillMatch(BaseModel):
    resume_skill: str
    jd_skill: str
    similarity_score: float


class ReasonedPathway(BaseModel):
    modules: List['PathwayModule']
    gap_skills: List[str]
    reasoning: List[str]

class HintRequest(BaseModel):
    task_id: str
    task_title: str
    task_description: str


# --- Ingestion ---

class IngestResponse(BaseModel):
    session_id: str
    resume_skills: List[Skill]
    jd_required_skills: List[Skill]
    role_category: RoleCategory
    role_title: str
    gaps: List[SkillGap]
    matches: List[SkillMatch]


# --- Simulation Tasks ---

class GradingRubric(BaseModel):
    criteria: List[str]
    passing_threshold: float = 0.6
    expert_answer: Optional[str] = None


class SimulationTask(BaseModel):
    id: str
    title: str
    description: str
    task_type: TaskType
    input_type: str = Field(description="monaco or textarea")
    grading_rubric: GradingRubric
    skill_tested: str
    difficulty: str = "intermediate"


class SimulationTasksResponse(BaseModel):
    session_id: str
    role_category: RoleCategory
    role_title: str
    tasks: List[SimulationTask]


# --- Telemetry / Observation ---

class TelemetryEntry(BaseModel):
    task_id: str
    time_spent_seconds: int
    hints_requested: int = 0
    errors_made: int = 0
    retry_count: int = 0
    task_abandoned: bool = False
    submitted_answer: str = ""
    keystroke_count: Optional[int] = 0


class ObservationSubmission(BaseModel):
    session_id: str
    user_id: Optional[str] = "anonymous"
    telemetry: List[TelemetryEntry]


class TaskResult(BaseModel):
    task_id: str
    struggle_score: float
    passed: bool
    feedback: str = ""


class ObservationResponse(BaseModel):
    session_id: str
    results: List[TaskResult]
    overall_struggle: float


# --- Pathway ---

class PathwayModule(BaseModel):
    id: str
    title: str
    skill_taught: str
    level: str
    duration_minutes: int
    domain: str
    reasoning_trace: str = ""
    order: int = 0
    prerequisite_ids: List[str] = []


class PathwayResponse(BaseModel):
    session_id: str
    job_readiness_score: int
    pathway: List[PathwayModule]
    reasoning_traces: List[Dict[str, str]]
    skills_proven: List[str]
    skill_gaps: List[str]
    time_saved_hours: int


# --- Dashboard ---

class DashboardResponse(BaseModel):
    session_id: str
    job_readiness_score: int
    skills_proven: List[Dict[str, Any]]
    skill_gaps: List[Dict[str, Any]]
    learning_pathway: List[PathwayModule]
    reasoning_trace: List[Dict[str, str]]
    time_saved_hours: int
    total_modules: int
    modules_skipped: int
    days_to_ready: int
    simulation_results: List[Dict[str, Any]]


# --- Sessions ---

class SessionSummary(BaseModel):
    id: str
    session_id: str
    role_title: str
    role_category: str
    job_readiness_score: Optional[int] = None
    status: SessionStatus = SessionStatus.IN_PROGRESS
    created_at: str
    skills_count: int = 0
    gaps_count: int = 0


class SessionsListResponse(BaseModel):
    user_id: str
    sessions: List[SessionSummary]


# --- Auth ---

class SignupRequest(BaseModel):
    email: str
    password: str
    full_name: str


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    user_id: str
    email: str
    full_name: str
    access_token: str
    refresh_token: Optional[str] = None


# --- Course Catalog ---

class Course(BaseModel):
    id: str
    title: str
    skill_taught: str
    level: str
    duration_minutes: int
    prerequisites: List[str] = []
    domain: str
