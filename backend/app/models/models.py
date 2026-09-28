"""Core SQLAlchemy Models for SETU AI"""
from datetime import datetime, timezone
import uuid
from sqlalchemy import (
    Column, String, Text, Float, Integer, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from app.models.base import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    role = Column(String(30), nullable=False, default="citizen")  # citizen, official, national_admin
    name = Column(String(100), nullable=False)
    phone = Column(String(30), nullable=True, index=True)
    email = Column(String(120), unique=True, nullable=True, index=True)
    password_hash = Column(String(255), nullable=False)
    region_id = Column(String(36), ForeignKey("regions.id"), nullable=True)
    language_pref = Column(String(10), default="en")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    region = relationship("Region", back_populates="users")
    requests = relationship("Request", back_populates="citizen")

class Region(Base):
    __tablename__ = "regions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    country_code = Column(String(5), nullable=False, index=True)  # IN, BR, RU, CN, ZA
    name = Column(String(100), nullable=False, index=True)
    level = Column(String(30), default="state")  # national, state, district
    geom_json = Column(JSON, nullable=True)  # GeoJSON polygon or centroid
    population = Column(Integer, default=1000000)
    infra_index_json = Column(JSON, default=dict)  # deficit ratings per sector
    demographic_json = Column(JSON, default=dict)  # vulnerability, poverty index
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    users = relationship("User", back_populates="region")
    requests = relationship("Request", back_populates="region")
    hotspots = relationship("Hotspot", back_populates="region")
    investment_plans = relationship("InvestmentPlan", back_populates="region")

class Request(Base):
    __tablename__ = "requests"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    citizen_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    raw_text = Column(Text, nullable=False)
    translated_text = Column(Text, nullable=True)
    channel = Column(String(20), default="web")  # web, voice, whatsapp, sms
    language = Column(String(10), default="en")
    category = Column(String(50), nullable=False, index=True)  # water, roads, electricity, healthcare, etc.
    urgency_score = Column(Float, default=0.5)  # 0.0 to 1.0 from NLU
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    region_id = Column(String(36), ForeignKey("regions.id"), nullable=False, index=True)
    status = Column(String(30), default="received")  # received, clustered, under_review, prioritized, funded, completed
    hotspot_id = Column(String(36), ForeignKey("hotspots.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)

    # Relationships
    citizen = relationship("User", back_populates="requests")
    region = relationship("Region", back_populates="requests")
    hotspot = relationship("Hotspot", back_populates="requests")

class Hotspot(Base):
    __tablename__ = "hotspots"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    region_id = Column(String(36), ForeignKey("regions.id"), nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)
    centroid_lat = Column(Float, nullable=False)
    centroid_lon = Column(Float, nullable=False)
    request_count = Column(Integer, default=1)
    avg_urgency = Column(Float, default=0.5)
    cluster_geom_json = Column(JSON, nullable=True)  # Convex hull or bounding box
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    region = relationship("Region", back_populates="hotspots")
    requests = relationship("Request", back_populates="hotspot")
    project = relationship("Project", back_populates="hotspot", uselist=False)

class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    hotspot_id = Column(String(36), ForeignKey("hotspots.id"), nullable=True, unique=True)
    region_id = Column(String(36), ForeignKey("regions.id"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), nullable=False)
    priority_score = Column(Float, default=50.0, index=True)
    priority_breakdown_json = Column(JSON, default=dict)  # The 5 components
    status = Column(String(30), default="recommended")  # recommended, funded, in_progress, completed
    estimated_cost = Column(Float, default=100000.0)  # in USD or localized
    estimated_beneficiaries = Column(Integer, default=1000)
    created_by = Column(String(36), nullable=True)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    hotspot = relationship("Hotspot", back_populates="project")
    impact_snapshots = relationship("ImpactSnapshot", back_populates="project")

class InvestmentPlan(Base):
    __tablename__ = "investment_plans"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    region_id = Column(String(36), ForeignKey("regions.id"), nullable=False, index=True)
    category = Column(String(50), nullable=False)
    allocated_budget = Column(Float, default=0.0)
    fiscal_year = Column(String(10), default="2025-2026")
    source = Column(String(150), nullable=False)  # Document name / Gazette
    document_text = Column(Text, nullable=False)
    embedding_json = Column(JSON, nullable=True)  # 384-dimensional vector stored as JSON array

    # Relationships
    region = relationship("Region", back_populates="investment_plans")

class ImpactSnapshot(Base):
    __tablename__ = "impact_snapshots"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False, index=True)
    metric_name = Column(String(100), nullable=False)
    unit = Column(String(30), default="")
    value_before = Column(Float, nullable=False)
    value_after = Column(Float, nullable=False)
    citizen_satisfaction_pct = Column(Float, default=90.0)
    measured_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    project = relationship("Project", back_populates="impact_snapshots")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    actor_id = Column(String(36), nullable=False, index=True)
    actor_name = Column(String(100), default="System")
    actor_role = Column(String(30), default="national_admin")
    entity_type = Column(String(50), nullable=False)  # project, request, hotspot
    entity_id = Column(String(36), nullable=False, index=True)
    action = Column(String(50), nullable=False)  # status_change, priority_override, cluster_run
    diff_json = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
