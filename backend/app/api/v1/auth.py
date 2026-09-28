"""Authentication Router for SETU AI"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.base import get_db
from app.models.models import User
from app.schemas.schemas import UserCreate, UserLogin, UserOut, Token
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token
from app.core.deps import require_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=Token)
async def signup(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if email/phone exists
    if user_in.email:
        existing = await db.execute(select(User).where(User.email == user_in.email))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Email already registered")
            
    user = User(
        name=user_in.name,
        email=user_in.email,
        phone=user_in.phone,
        role=user_in.role or "citizen",
        region_id=user_in.region_id,
        language_pref=user_in.language_pref,
        password_hash=get_password_hash(user_in.password)
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    access_token = create_access_token(user.id, user.role, user.region_id)
    refresh_token = create_refresh_token(user.id)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    # Look up by email or phone
    query = select(User).where(
        (User.email == credentials.username) | (User.phone == credentials.username)
    )
    result = await db.execute(query)
    user = result.scalar_one_or_none()

    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/phone or password"
        )

    access_token = create_access_token(user.id, user.role, user.region_id)
    refresh_token = create_refresh_token(user.id)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(require_current_user)):
    return current_user

@router.get("/demo-users")
async def get_demo_credentials():
    """Returns demo credentials for judges and quick testing"""
    return [
        {
            "role": "citizen",
            "name": "Aarav Sharma (Citizen)",
            "username": "citizen@setu.ai",
            "password": "password123",
            "description": "Rural citizen in Maharashtra submitting voice & SMS requests"
        },
        {
            "role": "official",
            "name": "Dr. Priya Deshmukh (Regional Planner)",
            "username": "official@setu.ai",
            "password": "password123",
            "region": "Maharashtra (IN-MH)",
            "description": "State Infrastructure Planner reviewing clusters and RAG masterplans"
        },
        {
            "role": "national_admin",
            "name": "Minister Carlos Silva (National Commission)",
            "username": "admin@setu.ai",
            "password": "password123",
            "description": "Federal Commission Minister managing cross-region allocations and impact tracking"
        }
    ]
