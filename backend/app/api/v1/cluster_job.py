"""Background Clustering & Explainable Priority Recalculation Job Router"""
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models.base import get_db, AsyncSessionLocal
from app.models.models import Request, Hotspot, Project, Region, InvestmentPlan
from app.services.ai_service.clustering import clustering_service
from app.services.ai_service.scoring import scoring_service
from app.api.v1.ws import ws_manager

router = APIRouter(prefix="/clustering", tags=["Clustering Job"])

async def run_clustering_pipeline(region_id: Optional[str] = None):
    """
    Core AI background job:
    1. Loads unprocessed requests
    2. Runs spatial HDBSCAN clustering into hotspots
    3. Fuses with demographic + infra deficit indices
    4. Computes explainable priority score formula
    5. Pushes WebSocket update to connected dashboards
    """
    async with AsyncSessionLocal() as session:
        # Load region
        reg_query = select(Region)
        if region_id:
            reg_query = reg_query.where(Region.id == region_id)
        regions_res = await session.execute(reg_query)
        regions = regions_res.scalars().all()

        for reg in regions:
            # Load requests
            req_res = await session.execute(
                select(Request).where(Request.region_id == reg.id)
            )
            requests = req_res.scalars().all()
            if not requests:
                continue

            req_dicts = [
                {
                    "id": r.id,
                    "category": r.category,
                    "lat": r.lat,
                    "lon": r.lon,
                    "urgency_score": r.urgency_score
                }
                for r in requests
            ]

            # Execute clustering
            clusters = clustering_service.cluster_requests(req_dicts)

            # Check investment plans for budget alignment
            plan_res = await session.execute(
                select(InvestmentPlan).where(InvestmentPlan.region_id == reg.id)
            )
            plans = plan_res.scalars().all()
            plan_categories = {p.category for p in plans}

            # Demographics and infra indices from region
            demo_vuln = reg.demographic_json.get("vulnerability_index", 0.75) if reg.demographic_json else 0.75
            infra_def = reg.infra_index_json.get("deficit_index", 0.70) if reg.infra_index_json else 0.70

            for cl in clusters:
                # Find or create hotspot
                cat = cl["category"]
                h_res = await session.execute(
                    select(Hotspot).where(Hotspot.region_id == reg.id, Hotspot.category == cat)
                )
                hotspot = h_res.scalar_one_or_none()

                if not hotspot:
                    hotspot = Hotspot(
                        region_id=reg.id,
                        category=cat,
                        centroid_lat=cl["centroid_lat"],
                        centroid_lon=cl["centroid_lon"],
                        request_count=cl["request_count"],
                        avg_urgency=cl["avg_urgency"],
                        cluster_geom_json=cl["cluster_geom"]
                    )
                    session.add(hotspot)
                    await session.flush()
                else:
                    hotspot.request_count = cl["request_count"]
                    hotspot.avg_urgency = cl["avg_urgency"]
                    hotspot.centroid_lat = cl["centroid_lat"]
                    hotspot.centroid_lon = cl["centroid_lon"]

                # Link requests to hotspot
                for rid in cl["request_ids"]:
                    await session.execute(
                        update(Request).where(Request.id == rid).values(hotspot_id=hotspot.id, status="clustered")
                    )

                # Compute explainable priority score
                budget_align = 0.90 if cat in plan_categories else 0.40
                score_data = scoring_service.compute_priority_score(
                    request_count=hotspot.request_count,
                    avg_urgency=hotspot.avg_urgency,
                    demographic_vulnerability=demo_vuln,
                    infra_deficit=infra_def,
                    budget_alignment=budget_align
                )

                # Update or create project
                p_res = await session.execute(
                    select(Project).where(Project.hotspot_id == hotspot.id)
                )
                proj = p_res.scalar_one_or_none()

                title = f"{reg.name} {cat.replace('_', ' ').title()} Infrastructure Renewal"
                if not proj:
                    proj = Project(
                        hotspot_id=hotspot.id,
                        region_id=reg.id,
                        title=title,
                        category=cat,
                        priority_score=score_data["composite_score"],
                        priority_breakdown_json=score_data,
                        status="recommended",
                        estimated_cost=round(hotspot.request_count * 12500.0, 2),
                        estimated_beneficiaries=hotspot.request_count * 45
                    )
                    session.add(proj)
                else:
                    proj.priority_score = score_data["composite_score"]
                    proj.priority_breakdown_json = score_data
                    proj.estimated_beneficiaries = hotspot.request_count * 45

            await session.commit()

            # Push live update to dashboard WebSocket
            await ws_manager.broadcast_to_region(
                reg.id,
                {
                    "type": "CLUSTERING_RUN_COMPLETED",
                    "region_id": reg.id,
                    "hotspots_count": len(clusters),
                    "message": "AI clustering complete. Project queue re-ranked."
                }
            )

@router.post("/run")
async def trigger_clustering_job(
    region_id: Optional[str] = None,
    background_tasks: BackgroundTasks = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Triggers clustering run manually via admin button or background task.
    """
    await run_clustering_pipeline(region_id)
    return {
        "status": "success",
        "message": "Clustering pipeline executed successfully. Projects recomputed and broadcasted via WebSocket."
    }
