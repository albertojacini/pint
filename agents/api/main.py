"""FastAPI application for provision ingestion pipeline."""

import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from api.routes.classify import router as classify_router
from api.routes.research import router as research_router

app = FastAPI(
    title="Provision Ingestion API",
    description="AI-assisted provision research and ingestion",
    version="0.1.0",
)

# CORS middleware for Next.js frontend
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Add production frontend URL if set
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(classify_router, tags=["Classification"])
app.include_router(research_router, tags=["Research"])


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
