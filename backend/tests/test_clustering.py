"""Unit Tests for HDBSCAN/DBSCAN Clustering & Deduplication Logic"""
import pytest
from app.services.ai_service.clustering import clustering_service

def test_clustering_empty():
    """Empty requests list should return empty hotspots"""
    res = clustering_service.cluster_requests([])
    assert res == []

def test_clustering_spatial_proximity():
    """Nearby points within 5km should group into a single demand hotspot"""
    # 4 complaints in Badnapur ward within 1 km
    complaints = [
        {"id": "c1", "category": "water", "lat": 19.8760, "lon": 75.3430, "urgency_score": 0.8},
        {"id": "c2", "category": "water", "lat": 19.8765, "lon": 75.3435, "urgency_score": 0.9},
        {"id": "c3", "category": "water", "lat": 19.8758, "lon": 75.3428, "urgency_score": 0.85},
        {"id": "c4", "category": "water", "lat": 19.8762, "lon": 75.3432, "urgency_score": 0.95},
    ]

    hotspots = clustering_service.cluster_requests(complaints)
    assert len(hotspots) == 1
    h = hotspots[0]
    assert h["category"] == "water"
    assert h["request_count"] == 4
    assert round(h["centroid_lat"], 3) == 19.876
    assert round(h["centroid_lon"], 3) == 75.343
    assert set(h["request_ids"]) == {"c1", "c2", "c3", "c4"}

def test_clustering_category_isolation():
    """Complaints in the same location but different sectors must NOT cluster together"""
    complaints = [
        {"id": "w1", "category": "water", "lat": 19.8760, "lon": 75.3430, "urgency_score": 0.8},
        {"id": "w2", "category": "water", "lat": 19.8765, "lon": 75.3435, "urgency_score": 0.9},
        {"id": "r1", "category": "roads", "lat": 19.8762, "lon": 75.3432, "urgency_score": 0.7},
        {"id": "r2", "category": "roads", "lat": 19.8764, "lon": 75.3431, "urgency_score": 0.75}
    ]

    hotspots = clustering_service.cluster_requests(complaints)
    # Must yield two distinct hotspots: one water, one roads
    assert len(hotspots) == 2
    categories = {h["category"] for h in hotspots}
    assert categories == {"water", "roads"}
