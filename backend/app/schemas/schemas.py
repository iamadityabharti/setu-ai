"""Pydantic v2 Schemas for SETU AI"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

# --- Auth Schemas ---
class UserBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    role: str = "citizen"
    region_id: Optional[str] = None
    language_pref: str = "en"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str  # email or phone
    password: str

class UserOut(UserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    region_id: Optional[str] = None

# --- Region Schemas ---
class RegionOut(BaseModel):
    id: str
    country_code: str
    name: str
    level: str
    population: int
    infra_index_json: Dict[str, Any]
    demographic_json: Dict[str, Any]

    class Config:
        from_attributes = True

# --- Request / Grievance Schemas ---
class RequestCreate(BaseModel):
    raw_text: str
    channel: str = "web"  # web, voice, whatsapp, sms
    language: str = "en"
    category: str
    urgency_signal: Optional[str] = "standard"  # standard, severe, critical
    lat: float
    lon: float
    region_id: str

class RequestOut(BaseModel):
    id: str
    citizen_id: Optional[str] = None
    raw_text: str
    translated_text: Optional[str] = None
    channel: str
    language: str
    category: str
    urgency_score: float
    lat: float
    lon: float
    region_id: str
    status: str
    hotspot_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Hotspot Schemas ---
class HotspotOut(BaseModel):
    id: str
    region_id: str
    category: str
    centroid_lat: float
    centroid_lon: float
    request_count: int
    avg_urgency: float
    cluster_geom_json: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Priority Breakdown & Project Schemas ---
class PriorityBreakdown(BaseModel):
    demand_volume_score: float  # weight: 0.35
    urgency_score: float        # weight: 0.20
    vulnerability_score: float  # weight: 0.20
    infra_deficit_score: float  # weight: 0.15
    budget_alignment_score: float # weight: 0.10
    composite_score: float
    raw_demand_count: int
    raw_avg_urgency: float

class ProjectOut(BaseModel):
    id: str
    hotspot_id: Optional[str] = None
    region_id: str
    title: str
    description: Optional[str] = None
    category: str
    priority_score: float
    priority_breakdown_json: Dict[str, Any]
    status: str
    estimated_cost: float
    estimated_beneficiaries: int
    updated_at: datetime
    hotspot: Optional[HotspotOut] = None

    class Config:
        from_attributes = True

class ProjectStatusUpdate(BaseModel):
    status: str  # recommended, funded, in_progress, completed
    note: Optional[str] = None

# --- Policy RAG Assistant Schemas ---
class PolicyQueryRequest(BaseModel):
    query: str
    region_id: Optional[str] = None
    category: Optional[str] = None

class PolicyCitation(BaseModel):
    document_source: str
    article_section: str
    snippet: str
    similarity_score: float
    allocated_budget: Optional[float] = None
    fiscal_year: Optional[str] = None

class PolicyQueryResponse(BaseModel):
    query: str
    answer: str
    alignment_level: str  # High, Moderate, Low
    citations: List[PolicyCitation]

# --- Ingestion Webhooks ---
class WhatsAppWebhookPayload(BaseModel):
    from_phone: str
    message_text: Optional[str] = None
    audio_url: Optional[str] = None
    media_content_base64: Optional[str] = None
    lat: Optional[float] = 19.8762
    lon: Optional[float] = 75.3433
    region_id: Optional[str] = None

class SMSPayload(BaseModel):
    sender_phone: str
    body: str
    region_code: Optional[str] = "IN-MH"

# --- Impact Snapshot ---
class ImpactSnapshotOut(BaseModel):
    id: str
    project_id: str
    metric_name: str
    unit: str
    value_before: float
    value_after: float
    citizen_satisfaction_pct: float
    measured_at: datetime

    class Config:
        from_attributes = True

# --- Cross-Region Comparison ---
class RegionComparisonOut(BaseModel):
    region_id: str
    region_name: str
    country_code: str
    total_population: int
    top_demand_sector: str
    active_hotspots_count: int
    total_citizen_reports: int
    avg_urgency: float
    allocated_capex_usd: float
    funded_projects_count: int
