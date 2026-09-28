"""WebSocket Manager & Endpoint for Real-time Dashboard Updates"""
from typing import Dict, List
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        # Maps region_id -> list of active WebSockets
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, region_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.setdefault(region_id, []).append(websocket)

    def disconnect(self, region_id: str, websocket: WebSocket):
        if region_id in self.active_connections:
            if websocket in self.active_connections[region_id]:
                self.active_connections[region_id].remove(websocket)

    async def broadcast_to_region(self, region_id: str, message: dict):
        if region_id in self.active_connections:
            for connection in self.active_connections[region_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception:
                    pass

    async def broadcast_all(self, message: dict):
        for region_id, conns in self.active_connections.items():
            for connection in conns:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception:
                    pass

ws_manager = ConnectionManager()

@router.websocket("/ws/dashboard/{region_id}")
async def websocket_dashboard(websocket: WebSocket, region_id: str):
    await ws_manager.connect(region_id, websocket)
    try:
        # Send initial confirmation
        await websocket.send_text(json.dumps({
            "type": "CONNECTION_ESTABLISHED",
            "region_id": region_id,
            "status": "connected"
        }))
        while True:
            data = await websocket.receive_text()
            # Echo ping/pong
            await websocket.send_text(json.dumps({"type": "PONG", "received": data}))
    except WebSocketDisconnect:
        ws_manager.disconnect(region_id, websocket)
