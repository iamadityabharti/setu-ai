"""Multi-Channel Webhook Ingestion Router (WhatsApp & SMS)"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.base import get_db
from app.models.models import Request, Region
from app.schemas.schemas import WhatsAppWebhookPayload, SMSPayload, RequestOut
from app.services.ingestion.adapters import ingestion_manager
from app.api.v1.ws import ws_manager

router = APIRouter(prefix="/ingest", tags=["Multi-Channel Ingestion"])

@router.post("/whatsapp", response_model=RequestOut)
async def ingest_whatsapp(payload: WhatsAppWebhookPayload, db: AsyncSession = Depends(get_db)):
    """
    Mock WhatsApp Business API Webhook receiver.
    Accepts text or base64 audio note, transcribes with Whisper, and stores in requests.
    """
    # Fallback to default region if not specified
    region_id = payload.region_id
    if not region_id:
        reg_res = await db.execute(select(Region).limit(1))
        reg = reg_res.scalar_one_or_none()
        region_id = reg.id if reg else "default-region"

    data = payload.model_dump()
    data["region_id"] = region_id
    normalized = ingestion_manager.process_whatsapp_webhook(data)

    new_req = Request(
        raw_text=normalized["raw_text"],
        translated_text=normalized["translated_text"],
        channel=normalized["channel"],
        language=normalized["language"],
        category=normalized["category"],
        urgency_score=normalized["urgency_score"],
        lat=normalized["lat"],
        lon=normalized["lon"],
        region_id=region_id,
        status="received"
    )
    db.add(new_req)
    await db.commit()
    await db.refresh(new_req)

    await ws_manager.broadcast_to_region(
        region_id,
        {
            "type": "NEW_GRIEVANCE_INGESTED",
            "request_id": new_req.id,
            "channel": new_req.channel,
            "category": new_req.category
        }
    )

    return new_req

@router.post("/sms", response_model=RequestOut)
async def ingest_sms(payload: SMSPayload, db: AsyncSession = Depends(get_db)):
    """
    2-Way SMS Gateway receiver for offline/rural citizens without smartphones.
    """
    reg_res = await db.execute(select(Region).limit(1))
    reg = reg_res.scalar_one_or_none()
    region_id = reg.id if reg else "default-region"

    data = payload.model_dump()
    data["region_id"] = region_id
    normalized = ingestion_manager.process_sms_gateway(data)

    new_req = Request(
        raw_text=normalized["raw_text"],
        translated_text=normalized["translated_text"],
        channel="sms",
        language=normalized["language"],
        category=normalized["category"],
        urgency_score=normalized["urgency_score"],
        lat=normalized["lat"],
        lon=normalized["lon"],
        region_id=region_id,
        status="received"
    )
    db.add(new_req)
    await db.commit()
    await db.refresh(new_req)

    await ws_manager.broadcast_to_region(
        region_id,
        {
            "type": "NEW_GRIEVANCE_INGESTED",
            "request_id": new_req.id,
            "channel": "sms",
            "category": new_req.category
        }
    )

    return new_req
