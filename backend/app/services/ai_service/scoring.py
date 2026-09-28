"""Priority Score Formula — 100% Explainable & Auditable Policymaker Metric"""
from typing import Dict, Any

class ScoringService:
    """
    Implements the core explainable prioritization formula from Section 7:
    
    priority_score =
        0.35 * normalized(demand_volume)
      + 0.20 * normalized(avg_urgency)
      + 0.20 * normalized(demographic_vulnerability_index)
      + 0.15 * normalized(infra_deficit_index)
      + 0.10 * normalized(budget_alignment)
    """

    WEIGHT_DEMAND: float = 0.35
    WEIGHT_URGENCY: float = 0.20
    WEIGHT_VULNERABILITY: float = 0.20
    WEIGHT_DEFICIT: float = 0.15
    WEIGHT_BUDGET: float = 0.10

    # Normalization ceiling for demand volume (e.g. 350 citizen reports = 1.0)
    DEMAND_VOLUME_CEILING: int = 350

    def normalize_demand(self, count: int) -> float:
        """Normalizes request count between 0.0 and 1.0 using asymptotic dampening"""
        if count <= 0:
            return 0.0
        val = count / self.DEMAND_VOLUME_CEILING
        return min(max(val, 0.0), 1.0)

    def compute_priority_score(
        self,
        request_count: int,
        avg_urgency: float,
        demographic_vulnerability: float,
        infra_deficit: float,
        budget_alignment: float
    ) -> Dict[str, Any]:
        """
        Computes 0-100 priority score and detailed mathematical breakdown.
        All inputs are normalized [0.0, 1.0] except request_count which is raw integer.
        """
        norm_demand = self.normalize_demand(request_count)
        norm_urgency = min(max(avg_urgency, 0.0), 1.0)
        norm_vuln = min(max(demographic_vulnerability, 0.0), 1.0)
        norm_deficit = min(max(infra_deficit, 0.0), 1.0)
        norm_budget = min(max(budget_alignment, 0.0), 1.0)

        # Weighted components (scaled to 100 max)
        demand_contrib = round(self.WEIGHT_DEMAND * norm_demand * 100, 2)
        urgency_contrib = round(self.WEIGHT_URGENCY * norm_urgency * 100, 2)
        vuln_contrib = round(self.WEIGHT_VULNERABILITY * norm_vuln * 100, 2)
        deficit_contrib = round(self.WEIGHT_DEFICIT * norm_deficit * 100, 2)
        budget_contrib = round(self.WEIGHT_BUDGET * norm_budget * 100, 2)

        composite = round(
            demand_contrib + urgency_contrib + vuln_contrib + deficit_contrib + budget_contrib,
            1
        )

        return {
            "composite_score": composite,
            "weights": {
                "demand_volume": self.WEIGHT_DEMAND,
                "urgency": self.WEIGHT_URGENCY,
                "vulnerability": self.WEIGHT_VULNERABILITY,
                "infra_deficit": self.WEIGHT_DEFICIT,
                "budget_alignment": self.WEIGHT_BUDGET
            },
            "contributions": {
                "demand_volume": demand_contrib,
                "urgency": urgency_contrib,
                "vulnerability": vuln_contrib,
                "infra_deficit": deficit_contrib,
                "budget_alignment": budget_contrib
            },
            "raw_values": {
                "request_count": request_count,
                "avg_urgency": round(avg_urgency, 3),
                "demographic_vulnerability": round(demographic_vulnerability, 3),
                "infra_deficit": round(infra_deficit, 3),
                "budget_alignment": round(budget_alignment, 3)
            }
        }

scoring_service = ScoringService()
