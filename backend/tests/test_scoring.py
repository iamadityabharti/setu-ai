"""Unit Tests for Explainable Priority Score Formula (Section 7)"""
import pytest
from app.services.ai_service.scoring import scoring_service

def test_priority_score_formula_weights():
    """Verify that formula weights sum to 1.0 (100%)"""
    weights = scoring_service.WEIGHT_DEMAND + \
              scoring_service.WEIGHT_URGENCY + \
              scoring_service.WEIGHT_VULNERABILITY + \
              scoring_service.WEIGHT_DEFICIT + \
              scoring_service.WEIGHT_BUDGET
    assert round(weights, 2) == 1.00

def test_priority_score_max_ceiling():
    """When all signals are at maximum, priority score must be 100.0"""
    result = scoring_service.compute_priority_score(
        request_count=350,
        avg_urgency=1.0,
        demographic_vulnerability=1.0,
        infra_deficit=1.0,
        budget_alignment=1.0
    )
    assert result["composite_score"] == 100.0
    assert result["contributions"]["demand_volume"] == 35.0
    assert result["contributions"]["urgency"] == 20.0
    assert result["contributions"]["vulnerability"] == 20.0
    assert result["contributions"]["infra_deficit"] == 15.0
    assert result["contributions"]["budget_alignment"] == 10.0

def test_priority_score_min_floor():
    """When all signals are zero, priority score must be 0.0"""
    result = scoring_service.compute_priority_score(
        request_count=0,
        avg_urgency=0.0,
        demographic_vulnerability=0.0,
        infra_deficit=0.0,
        budget_alignment=0.0
    )
    assert result["composite_score"] == 0.0

def test_priority_score_realistic_case():
    """Test realistic regional hotspot calculation (Badnapur Water Case)"""
    result = scoring_service.compute_priority_score(
        request_count=342,
        avg_urgency=0.89,
        demographic_vulnerability=0.82,
        infra_deficit=0.78,
        budget_alignment=0.90
    )
    # Check that score falls in the 90-95 high priority zone
    assert 88.0 <= result["composite_score"] <= 95.0
    assert "contributions" in result
    assert "raw_values" in result
