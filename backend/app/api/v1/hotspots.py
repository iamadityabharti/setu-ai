"""Demand Hotspots API Router & Public Open Data Endpoint"""
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.base import get_db
from app.models.models import Hotspot, Region
from app.schemas.schemas import HotspotOut

router = APIRouter(tags=["Hotspots"])

@router.get("/hotspots", response_model=List[HotspotOut])
async def list_hotspots(
    region_id: Optional[str] = None,
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(Hotspot).order_by(desc(Hotspot.request_count))
    if region_id:
        query = query.where(Hotspot.region_id == region_id)
    if category:
        query = query.where(Hotspot.category == category)
        
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/public/hotspots")
async def get_public_open_data_hotspots(
    country_code: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    DPG Open Data Endpoint: Returns anonymized, aggregated hotspot data
    as a standardized GeoJSON FeatureCollection under Open Government License.
    """
    query = select(Hotspot)
    result = await db.execute(query)
    hotspots = result.scalars().all()

    features = []
    for h in hotspots:
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [h.centroid_lon, h.centroid_lat]
            },
            "properties": {
                "hotspot_id": h.id,
                "region_id": h.region_id,
                "category": h.category,
                "citizen_request_count": h.request_count,
                "avg_urgency_index": h.avg_urgency,
                "cluster_created_at": h.created_at.isoformat() if h.created_at else None,
                "privacy_notice": "Anonymized aggregation; individual PII excluded per DPG standard"
            }
        })

    return {
        "type": "FeatureCollection",
        "title": "SETU AI BRICS Civic Infrastructure Demand Hotspots",
        "license": "Open Data Commons Open Database License (ODbL)",
        "features_count": len(features),
        "features": features
    }
