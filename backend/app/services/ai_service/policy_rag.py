"""Policy-Alignment Assistant (RAG) Module — Retrieval-Augmented Decision Support"""
from typing import List, Dict, Any, Optional
import numpy as np
from app.services.ai_service.nlu import nlu_service

class PolicyRAGService:
    """
    RAG Assistant that indexes investment plans and policy gazettes.
    Enables regional officials and national admins to verify if a prioritized
    project aligns with pre-approved state budget lines and five-year plans.
    """

    def cosine_similarity(self, vec_a: List[float], vec_b: List[float]) -> float:
        a = np.array(vec_a, dtype=np.float32)
        b = np.array(vec_b, dtype=np.float32)
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return float(np.dot(a, b) / (norm_a * norm_b))

    def query_policy_corpus(
        self,
        query: str,
        indexed_plans: List[Dict[str, Any]],
        category_hint: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Retrieves top policy chunks matching user inquiry with grounded citation.
        """
        query_vec = nlu_service.get_embedding(query)
        scored_plans = []

        for plan in indexed_plans:
            doc_vec = plan.get("embedding_json")
            if not doc_vec:
                doc_vec = nlu_service.get_embedding(plan.get("document_text", ""))

            sim = self.cosine_similarity(query_vec, doc_vec)

            # Category boost if query matches sector
            if category_hint and plan.get("category") == category_hint:
                sim = min(sim + 0.15, 0.99)

            scored_plans.append({
                "plan": plan,
                "similarity": round(sim, 3)
            })

        scored_plans.sort(key=lambda x: x["similarity"], reverse=True)
        top_hits = scored_plans[:2]

        citations = []
        for hit in top_hits:
            p = hit["plan"]
            citations.append({
                "document_source": p.get("source", "State Masterplan"),
                "article_section": p.get("section", "Article 4.2: Infrastructure Grant"),
                "snippet": p.get("document_text", "")[:280] + "...",
                "similarity_score": hit["similarity"],
                "allocated_budget": p.get("allocated_budget", 0.0),
                "fiscal_year": p.get("fiscal_year", "2025-2027")
            })

        # Synthesize explainable answer
        if citations and citations[0]["similarity_score"] > 0.65:
            alignment = "High"
            best = citations[0]
            answer = (
                f"Project strongly aligns with {best['document_source']} ({best['fiscal_year']}). "
                f"Specifically under {best['article_section']}, capital grants up to "
                f"${best['allocated_budget']:,.0f} are earmarked for habitations suffering from severe supply deficits."
            )
        elif citations:
            alignment = "Moderate"
            answer = (
                f"Project partially fits {citations[0]['document_source']}, but may require "
                f"re-allocation or inter-departmental sanction."
            )
        else:
            alignment = "Low"
            answer = "No direct pre-approved state budget line identified in current fiscal plans."

        return {
            "query": query,
            "answer": answer,
            "alignment_level": alignment,
            "citations": citations
        }

policy_rag_service = PolicyRAGService()
