"""Policy-Alignment Assistant (RAG) API Router"""
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.base import get_db
from app.models.models import InvestmentPlan
from app.schemas.schemas import PolicyQueryRequest, PolicyQueryResponse
from app.services.ai_service.policy_rag import policy_rag_service

router = APIRouter(prefix="/policy", tags=["Policy RAG Assistant"])

@router.post("/query", response_model=PolicyQueryResponse)
async def query_policy_assistant(
    query_in: PolicyQueryRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    RAG Assistant: Grounded semantic search across uploaded government investment plans.
    Retrieves matching policy articles from vector embeddings and returns citations.
    """
    plan_query = select(InvestmentPlan)
    if query_in.region_id:
        plan_query = plan_query.where(InvestmentPlan.region_id == query_in.region_id)
        
    result = await db.execute(plan_query)
    plans = result.scalars().all()

    plan_dicts = [
        {
            "id": p.id,
            "region_id": p.region_id,
            "category": p.category,
            "allocated_budget": p.allocated_budget,
            "fiscal_year": p.fiscal_year,
            "source": p.source,
            "section": "Article 4.2: Capital Infrastructure Grant Scheme",
            "document_text": p.document_text,
            "embedding_json": p.embedding_json
        }
        for p in plans
    ]

    rag_result = policy_rag_service.query_policy_corpus(
        query=query_in.query,
        indexed_plans=plan_dicts,
        category_hint=query_in.category
    )

    return rag_result
