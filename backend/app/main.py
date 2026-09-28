"""SETU AI — FastAPI Application Entrypoint"""
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.core.config import settings
from app.models.base import engine, Base, get_db

# Import API routers
from app.api.v1.auth import router as auth_router
from app.api.v1.requests import router as requests_router
from app.api.v1.hotspots import router as hotspots_router
from app.api.v1.projects import router as projects_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.policy_qa import router as policy_router
from app.api.v1.ingest import router as ingest_router
from app.api.v1.cluster_job import router as cluster_router
from app.api.v1.ws import router as ws_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables automatically on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Digital Public Good (DPG) connecting citizen voices with national infrastructure capital allocation across BRICS nations.",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(requests_router, prefix=settings.API_V1_STR)
app.include_router(hotspots_router, prefix=settings.API_V1_STR)
app.include_router(projects_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)
app.include_router(policy_router, prefix=settings.API_V1_STR)
app.include_router(ingest_router, prefix=settings.API_V1_STR)
app.include_router(cluster_router, prefix=settings.API_V1_STR)
app.include_router(ws_router)

# Health & Observability Endpoints
@app.get("/health", tags=["Observability"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION
    }

@app.get("/ready", tags=["Observability"])
async def ready_check(db: AsyncSession = Depends(get_db)):
    try:
        await db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    return {
        "status": "ready",
        "database": db_status
    }

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to SETU AI — Digital Public Good Platform",
        "docs_url": "/docs",
        "public_open_data": f"{settings.API_V1_STR}/public/hotspots"
    }
