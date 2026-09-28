"""Smoke & Integration Tests for All Three Roles and Key Endpoints"""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_health_and_root():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/health")
        assert res.status_code == 200
        assert res.json()["status"] == "healthy"

        res_root = await ac.get("/")
        assert res_root.status_code == 200

@pytest.mark.asyncio
async def test_public_open_data_hotspots():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/api/v1/public/hotspots")
        assert res.status_code == 200
        data = res.json()
        assert data["type"] == "FeatureCollection"
        assert "features" in data
        assert len(data["features"]) > 0

@pytest.mark.asyncio
async def test_role_logins():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Citizen login
        res_cit = await ac.post("/api/v1/auth/login", json={"username": "citizen@setu.ai", "password": "password123"})
        assert res_cit.status_code == 200
        assert res_cit.json()["user"]["role"] == "citizen"

        # 2. Official login
        res_off = await ac.post("/api/v1/auth/login", json={"username": "official@setu.ai", "password": "password123"})
        assert res_off.status_code == 200
        assert res_off.json()["user"]["role"] == "official"

        # 3. National Admin login
        res_adm = await ac.post("/api/v1/auth/login", json={"username": "admin@setu.ai", "password": "password123"})
        assert res_adm.status_code == 200
        assert res_adm.json()["user"]["role"] == "national_admin"

@pytest.mark.asyncio
async def test_projects_ranked_queue():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/api/v1/projects")
        assert res.status_code == 200
        projects = res.json()
        assert len(projects) >= 3
        # Assert ranked order (priority score descending)
        scores = [p["priority_score"] for p in projects]
        assert scores == sorted(scores, reverse=True)

@pytest.mark.asyncio
async def test_policy_rag_query():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        query_payload = {
            "query": "Does this project qualify under the 2025-27 State Water Masterplan?",
            "category": "water"
        }
        res = await ac.post("/api/v1/policy/query", json=query_payload)
        assert res.status_code == 200
        data = res.json()
        assert "citations" in data
        assert len(data["citations"]) > 0
        assert data["alignment_level"] in ["High", "Moderate"]
