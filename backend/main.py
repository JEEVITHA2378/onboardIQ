"""
OnboardIQ+ Backend — FastAPI Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="OnboardIQ+ API",
    description="Reverse Onboarding Engine — AI-powered skill gap analysis and personalised learning pathways",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and register routers
from routers import auth, ingest, simulation, observation, pathway, dashboard

app.include_router(auth.router, prefix="/api", tags=["Authentication"])
app.include_router(ingest.router, prefix="/api", tags=["Ingestion"])
app.include_router(simulation.router, prefix="/api", tags=["Simulation"])
app.include_router(observation.router, prefix="/api", tags=["Observation"])
app.include_router(pathway.router, prefix="/api", tags=["Pathway"])
app.include_router(dashboard.router, prefix="/api", tags=["Dashboard"])


@app.get("/")
async def root():
    return {
        "app": "OnboardIQ+",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True,
    )
