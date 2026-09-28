"""Analytics, Cross-Region Leaderboard & Impact Tracking API Router"""
from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from app.models.base import get_db
from app.models.models import Region, Hotspot, Project, Request, ImpactSnapshot, AuditLog
from app.schemas.schemas import RegionComparisonOut, ImpactSnapshotOut

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/leaderboard", response_model=List[RegionComparisonOut])
async def get_cross_region_leaderboard(
    country_code: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Cross-region comparison across BRICS nations:
    Demand volume, active hotspots, average urgency, and capital deployment rate.
    """
    region_query = select(Region)
    if country_code:
        region_query = region_query.where(Region.country_code == country_code)
        
    result = await db.execute(region_query)
    regions = result.scalars().all()

    leaderboard = []
    for reg in regions:
        # Hotspot count
        h_res = await db.execute(select(func.count(Hotspot.id)).where(Hotspot.region_id == reg.id))
        h_count = h_res.scalar() or 0

        # Request count & avg urgency
        r_res = await db.execute(
            select(func.count(Request.id), func.avg(Request.urgency_score))
            .where(Request.region_id == reg.id)
        )
        r_count, avg_urg = r_res.first()
        r_count = r_count or 0
        avg_urg = round(float(avg_urg or 0.65), 2)

        # Projects funded
        p_res = await db.execute(
            select(func.count(Project.id), func.sum(Project.estimated_cost))
            .where(Project.region_id == reg.id, Project.status.in_(["funded", "in_progress", "completed"]))
        )
        funded_count, total_cost = p_res.first()
        funded_count = funded_count or 0
        total_cost = float(total_cost or 0.0)

        # Top demand sector
        top_sec_res = await db.execute(
            select(Request.category, func.count(Request.id).label("cnt"))
            .where(Request.region_id == reg.id)
            .group_by(Request.category)
            .order_by(desc("cnt"))
            .limit(1)
        )
        top_sec = top_sec_res.first()
        top_sector_name = top_sec[0] if top_sec else "Water Supply"

        leaderboard.append({
            "region_id": reg.id,
            "region_name": reg.name,
            "country_code": reg.country_code,
            "total_population": reg.population,
            "top_demand_sector": top_sector_name,
            "active_hotspots_count": h_count,
            "total_citizen_reports": r_count,
            "avg_urgency": avg_urg,
            "allocated_capex_usd": total_cost,
            "funded_projects_count": funded_count
        })

    return leaderboard

@router.get("/impact-snapshots", response_model=List[ImpactSnapshotOut])
async def get_impact_snapshots(
    project_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Returns verifiable Before/After ground physical metrics"""
    query = select(ImpactSnapshot)
    if project_id:
        query = query.where(ImpactSnapshot.project_id == project_id)
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/audit-logs")
async def get_audit_trail(limit: int = 50, db: AsyncSession = Depends(get_db)):
    """Returns immutable governance audit trail for project transitions"""
    query = select(AuditLog).order_by(desc(AuditLog.created_at)).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()
