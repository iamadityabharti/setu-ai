"""Citizen Requests & Grievances API Router"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.base import get_db
from app.models.models import Request, User
from app.schemas.schemas import RequestCreate, RequestOut
from app.services.ingestion.adapters import ingestion_manager
from app.core.deps import get_current_user, require_current_user, rate_limiter
from app.api.v1.ws import ws_manager

router = APIRouter(prefix="/requests", tags=["Requests"])

@router.post("", response_model=RequestOut, dependencies=[Depends(rate_limiter)])
async def create_request(
    request_in: RequestCreate,
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Submits citizen infrastructure grievance.
    Passes through multilingual translation and NLU classification.
    """
    payload = request_in.model_dump()
    normalized = ingestion_manager.process_web_submission(payload)

    new_request = Request(
        citizen_id=current_user.id if current_user else None,
        raw_text=normalized["raw_text"],
        translated_text=normalized["translated_text"],
        channel=normalized["channel"],
        language=normalized["language"],
        category=normalized["category"],
        urgency_score=normalized["urgency_score"],
        lat=normalized["lat"],
        lon=normalized["lon"],
        region_id=normalized["region_id"],
        status="received"
    )

    db.add(new_request)
    await db.commit()
    await db.refresh(new_request)

    # Broadcast live event to regional dashboard WebSocket
    await ws_manager.broadcast_to_region(
        normalized["region_id"],
        {
            "type": "NEW_GRIEVANCE_INGESTED",
            "request_id": new_request.id,
            "category": new_request.category,
            "urgency_score": new_request.urgency_score,
            "lat": new_request.lat,
            "lon": new_request.lon
        }
    )

    return new_request

@router.get("/my", response_model=List[RequestOut])
async def get_my_requests(
    current_user: User = Depends(require_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Returns requests submitted by the logged-in citizen"""
    query = (
        select(Request)
        .where(Request.citizen_id == current_user.id)
        .order_by(desc(Request.created_at))
    )
    result = await db.execute(query)
    return result.scalars().all()

@router.get("", response_model=List[RequestOut])
async def list_requests(
    region_id: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = Query(50, le=200),
    db: AsyncSession = Depends(get_db)
):
    """List requests with optional regional or category filtering"""
    query = select(Request).order_by(desc(Request.created_at))
    if region_id:
        query = query.where(Request.region_id == region_id)
    if category:
        query = query.where(Request.category == category)
    if status:
        query = query.where(Request.status == status)
    query = query.limit(limit)

    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{request_id}", response_model=RequestOut)
async def get_request_detail(request_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Request).where(Request.id == request_id))
    req = result.scalar_one_or_none()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    return req
