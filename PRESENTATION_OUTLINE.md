# OnboardIQ+ — Hackathon Presentation Outline (5 Slides)

---

## Slide 1: The Problem
**Title:** "Onboarding is broken — and it's backwards."

- Companies spend 40+ hours onboarding every new hire with generic training
- 67% of onboarding content is irrelevant to the individual
- Self-reported skill assessments are unreliable (Dunning-Kruger effect)
- Result: wasted time, wasted money, disengaged employees

**Visual:** Side-by-side — Generic 40-module pathway vs. Personalised 12-module pathway

---

## Slide 2: Our Solution — Reverse Onboarding
**Title:** "We don't ask what you know. We observe it."

- **Upload** resume + job description → AI extracts and normalises skills
- **Simulate** real work tasks (not quizzes) targeting identified skill gaps
- **Observe** behavioural telemetry: time, hints, errors, retries, abandonment
- **Build** a retroactive learning pathway from actual struggle signals
- **Explain** every recommendation with a full reasoning trace

**Visual:** Flow diagram: Upload → Simulate → Observe → Personalise

---

## Slide 3: How It Works (Technical)
**Title:** "Claude AI + Knowledge Graphs + Behavioural Science"

- Claude Sonnet extracts skills, generates tasks, grades responses, writes reasoning
- Sentence Transformers create skill embeddings for semantic matching
- ChromaDB provides RAG retrieval against a curated course catalog
- NetworkX builds prerequisite DAGs for topologically sorted pathways
- Struggle Score formula: `errors×2 + hints×1.5 + abandoned×5 + retries - speed_bonus`

**Visual:** Architecture diagram with tech logos

---

## Slide 4: Live Demo
**Title:** "Watch it work."

1. Upload a real resume PDF + paste a job description
2. Complete 2 simulation tasks live
3. Show the analysis transition with real-time signal processing
4. Reveal the personalised roadmap with reasoning traces
5. Show the Impact Dashboard with skill proof vs. claim charts

**Visual:** Live app walkthrough

---

## Slide 5: Impact & Vision
**Title:** "From 40 hours to 12. From generic to personal."

- **Time saved:** Average 28 hours per new hire
- **Cost saved:** ~$2,100 per employee (at $75/hr loaded cost)
- **Accuracy:** Skill-gap identification based on observation, not claims
- **Transparency:** Every module has a full reasoning trace
- **Future:** Team-level analytics, hiring pipeline integration, continuous learning paths

**Visual:** Impact Dashboard screenshot with metrics

---

## Closing Line
> "The best onboarding doesn't teach everything. It teaches exactly what's missing."
