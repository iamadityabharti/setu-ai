"""Ranked Capital Projects API Router & Audit Logger"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from app.models.base import get_db
from app.models.models import Project, Hotspot, AuditLog, User
from app.schemas.schemas import ProjectOut, ProjectStatusUpdate
from app.core.deps import require_role, require_current_user
from app.api.v1.ws import ws_manager

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("", response_model=List[ProjectOut])
async def list_ranked_projects(
    region_id: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Returns projects ranked by explainable priority score descending"""
    query = select(Project).options(selectinload(Project.hotspot)).order_by(desc(Project.priority_score))
    if region_id:
        query = query.where(Project.region_id == region_id)
    if category:
        query = query.where(Project.category == category)
    if status:
        query = query.where(Project.status == status)

    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{project_id}", response_model=ProjectOut)
async def get_project_detail(project_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Project).options(selectinload(Project.hotspot)).where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.patch("/{project_id}/status", response_model=ProjectOut)
async def update_project_status(
    project_id: str,
    update_in: ProjectStatusUpdate,
    current_user: User = Depends(require_role(["official", "national_admin"])),
    db: AsyncSession = Depends(get_db)
):
    """
    Transitions project status through lifecycle (recommended -> funded -> in_progress -> completed).
    Enforces row-level audit logging.
    """
    result = await db.execute(
        select(Project).options(selectinload(Project.hotspot)).where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    old_status = project.status
    new_status = update_in.status
    project.status = new_status

    # Write immutable audit log
    audit_entry = AuditLog(
        actor_id=current_user.id,
        actor_name=current_user.name,
        actor_role=current_user.role,
        entity_type="project",
        entity_id=project.id,
        action="status_transition",
        diff_json={
            "old_status": old_status,
            "new_status": new_status,
            "project_title": project.title,
            "note": update_in.note
        }
    )
    db.add(audit_entry)
    await db.commit()
    await db.refresh(project)

    # Broadcast WebSocket update
    await ws_manager.broadcast_to_region(
        project.region_id,
        {
            "type": "PROJECT_STATUS_UPDATED",
            "project_id": project.id,
            "title": project.title,
            "old_status": old_status,
            "new_status": new_status,
            "actor": current_user.name
        }
    )

    return project
