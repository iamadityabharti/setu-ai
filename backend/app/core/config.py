"""SETU AI Core Configuration"""
import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SETU AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "setu-ai-brics-super-secret-jwt-key-2026-production-ready")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours for demo convenience
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Database
    # Defaults to SQLite async for zero-friction local run, or PostgreSQL with asyncpg
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./setu_ai.db")
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8090",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8090"
    ]
    
    # AI Service Settings
    EMBEDDING_DIM: int = 384
    HDBSCAN_MIN_CLUSTER_SIZE: int = 3
    HDBSCAN_MIN_SAMPLES: int = 2
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
