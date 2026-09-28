"""Multi-Channel Ingestion Adapters: WhatsApp, SMS, Web"""
from typing import Dict, Any
from app.services.ai_service.translate import translate_service
from app.services.ai_service.nlu import nlu_service
from app.services.ai_service.stt import stt_service

class IngestionManager:
    """
    Normalizes inputs from WhatsApp Webhooks, SMS Gateways, and Web submissions
    into unified citizen grievance records.
    """

    def process_web_submission(self, data: Dict[str, Any]) -> Dict[str, Any]:
        raw_text = data.get("raw_text", "")
        translated, detected_lang = translate_service.translate(raw_text, data.get("language", "auto"))
        nlu_res = nlu_service.process_text(translated, data.get("urgency_signal", "standard"))

        # Category from form overrides or falls back to NLU
        category = data.get("category") or nlu_res["category"]

        return {
            "raw_text": raw_text,
            "translated_text": translated,
            "channel": data.get("channel", "web"),
            "language": detected_lang,
            "category": category,
            "urgency_score": nlu_res["urgency_score"],
            "lat": float(data.get("lat", 19.8762)),
            "lon": float(data.get("lon", 75.3433)),
            "region_id": data.get("region_id"),
            "status": "received"
        }

    def process_whatsapp_webhook(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Normalizes inbound WhatsApp Webhook payload"""
        # If audio note was sent
        if payload.get("media_content_base64"):
            stt_res = stt_service.transcribe(b"voice", lang_hint="auto")
            raw_text = stt_res["text"]
            channel = "whatsapp_voice"
        else:
            raw_text = payload.get("message_text", "Grievance received via WhatsApp")
            channel = "whatsapp_text"

        translated, detected_lang = translate_service.translate(raw_text)
        nlu_res = nlu_service.process_text(translated, "standard")

        return {
            "raw_text": raw_text,
            "translated_text": translated,
            "channel": channel,
            "language": detected_lang,
            "category": nlu_res["category"],
            "urgency_score": nlu_res["urgency_score"],
            "lat": float(payload.get("lat", 19.8762)),
            "lon": float(payload.get("lon", 75.3433)),
            "region_id": payload.get("region_id"),
            "status": "received"
        }

    def process_sms_gateway(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Normalizes inbound 2-way SMS Gateway payload"""
        body = payload.get("body", "")
        translated, detected_lang = translate_service.translate(body)
        nlu_res = nlu_service.process_text(translated, "standard")

        return {
            "raw_text": body,
            "translated_text": translated,
            "channel": "sms",
            "language": detected_lang,
            "category": nlu_res["category"],
            "urgency_score": nlu_res["urgency_score"],
            "lat": 19.8762,  # Default to district centroid or tower triangulation
            "lon": 75.3433,
            "region_id": payload.get("region_id"),
            "status": "received"
        }

ingestion_manager = IngestionManager()
