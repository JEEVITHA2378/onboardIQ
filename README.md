# OnboardIQ+ — Reverse Onboarding Engine

> **Prove what you know. Skip what you don't need.**

OnboardIQ+ is a full-stack AI-powered reverse onboarding platform that ingests a candidate's resume and a job description, simulates real-world tasks to observe actual skill demonstration, and constructs a personalised retroactive learning pathway based on observed struggle signals — not self-reported claims.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend (Vite)                 │
│  Signup → Upload → Simulation → Analysis → Roadmap/Dash │
└──────────────────────┬──────────────────────────────────┘
                       │ Axios / REST
┌──────────────────────▼──────────────────────────────────┐
│                  FastAPI Backend                         │
│  /ingest  /simulation  /observation  /pathway  /dashboard│
├──────────┬──────────┬──────────┬────────────────────────┤
│ Claude   │ Sentence │ ChromaDB │ NetworkX               │
│ Sonnet   │ Trans.   │ (RAG)    │ (DAG)                  │
└──────────┴──────────┴──────────┴────────────────────────┘
                       │
               ┌───────▼───────┐
               │   Supabase    │
               │  (Auth + DB)  │
               └───────────────┘
```

## Tech Stack

### Backend
- **FastAPI** — ASGI web framework
- **Claude API** (claude-sonnet-4-20250514) — AI skill extraction, task generation, grading, reasoning
- **Sentence Transformers** (all-MiniLM-L6-v2) — Skill embeddings & semantic matching
- **ChromaDB** — Vector storage and RAG retrieval
- **NetworkX** — Knowledge graph & prerequisite DAG
- **PyMuPDF / python-docx** — Document parsing
- **Supabase** — Auth, database, row-level security

### Frontend
- **React 18** + **Vite** — Fast dev & build
- **React Router v6** — Client-side routing
- **Framer Motion** — Route transitions & micro-animations
- **React Flow** — DAG visualisation
- **Recharts** — Charts & data viz
- **Monaco Editor** — Code task input
- **Tailwind CSS** — Utility-first styling
- **Supabase JS v2** — Auth client

## Design System

| Token | Value |
|-------|-------|
| Background | `#0e0c0a` |
| Surface | `#151210` |
| Card | `#1c1814` |
| Border | `#2a2420` |
| Gold Primary | `#c9a96e` |
| Gold Light | `#e8d5a3` |
| Cream | `#f5f0e8` |
| Headline Font | Playfair Display |
| Body Font | DM Sans |
| Mono Font | JetBrains Mono |

---

## Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+
- Supabase project (free tier works)
- Anthropic API key

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys
python main.py
```

Server runs at `http://localhost:8000`. API docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
npm run dev
```

App runs at `http://localhost:5173`.

### Docker

```bash
docker-compose up --build
```

---

## Supabase Schema

### Tables (with RLS enabled)

1. **profiles** — `id` (uuid, FK auth.users), `full_name`, `email`, `avatar_url`, `target_role`, `created_at`, `updated_at`
2. **onboarding_sessions** — `id`, `user_id`, `resume_url`, `jd_text`, `extracted_resume_skills` (jsonb), `jd_required_skills` (jsonb), `role_category`, `role_title`, `job_readiness_score`, `skills_proven` (jsonb), `skill_gaps` (jsonb), `learning_pathway` (jsonb), `reasoning_trace` (jsonb), `telemetry_log` (jsonb), `time_saved_hours`, `status` (default 'in_progress')
3. **simulation_results** — `id`, `session_id`, `user_id`, `task_id`, `task_title`, `task_type`, `time_spent_seconds`, `hints_requested`, `errors_made`, `retry_count`, `task_abandoned`, `struggle_score`, `passed`, `submitted_answer`, `created_at`
4. **sessions_history** — `id`, `user_id`, `session_id`, `viewed_at`, `resume_snapshot`

---

## Skill Gap Logic

1. **Extract** skills from resume (PDF) and JD (text) using Claude API
2. **Normalise** against O\*NET taxonomy via embedding similarity
3. **Compute gaps**: `gap_score = required_level - current_level` (beginner=1, intermediate=2, advanced=3)
4. **Simulate**: Generate role-appropriate tasks targeting identified gaps
5. **Observe**: Collect telemetry (time, hints, errors, retries, abandonment)
6. **Score**: `struggle_score = errors×2 + hints×1.5 + abandoned×5 + retries×1 - speed_bonus`
7. **Build pathway**: Traverse prerequisite DAG, topological sort, RAG-verify against course catalog
8. **Explain**: Generate reasoning trace per module linking observation → gap → module → role requirement

---

## Dataset Citations

1. **Resume Dataset** — [Kaggle: Resume Dataset](https://www.kaggle.com/datasets/snehaanbhawal/resume-dataset/data) — 2400+ resumes across 25 job categories
2. **Job Description Dataset** — [Kaggle: Jobs and Job Description](https://www.kaggle.com/datasets/kshitizregmi/jobs-and-job-description) — Thousands of real job postings
3. **O\*NET Database** — [O\*NET Resource Center](https://www.onetcenter.org/db_releases.html) — 1000+ occupations with standardised skills

---

## License

MIT
