"""FastAPI application for provision ingestion pipeline."""

import sys
import os
from contextlib import asynccontextmanager

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from apps.provisions.routes import router as provision_router
from api.routes.event_ingestion import router as event_ingestion_router
from agents.utils.ei_db_tools import get_ei_db_tools


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager - startup and shutdown events."""
    # Startup: nothing to do (pool created on first use)
    yield
    # Shutdown: close database connection pool
    db_tools = get_ei_db_tools()
    await db_tools.close()


app = FastAPI(
    title="Provision Ingestion API",
    description="AI-assisted provision research and ingestion",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS middleware for Next.js frontend
# Allow all origins for now (early stage project)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,  # Must be False when using allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(provision_router, tags=["Provision"])
app.include_router(event_ingestion_router, tags=["Event Ingestion"])


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
