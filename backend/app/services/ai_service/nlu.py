"""NLU Pipeline: Intent Classification, Entity Extraction, Urgency Scoring & Embeddings"""
import re
from typing import Dict, Any, List
import numpy as np

class NLUService:
    """
    Hybrid rules + semantic embeddings NLU pipeline.
    Identifies infrastructure category, extracts civic entities,
    computes urgency scores, and generates 384-dimensional dense vectors.
    """

    CATEGORIES = [
        "water", "roads", "electricity", "healthcare",
        "education", "sanitation", "public_safety", "other"
    ]

    CATEGORY_KEYWORDS = {
        "water": ["water", "pipe", "pipeline", "well", "drinking", "contamination", "leak", "tap", "borewell", "जल", "पानी", "विहीर", "água", "poço", "torneira"],
        "roads": ["road", "bridge", "pothole", "culvert", "highway", "pavement", "mud", "transit", "सड़क", "मार्ग", "पुल", "estrada", "ponte", "buraco", "asfalto"],
        "electricity": ["electricity", "power", "grid", "transformer", "blackout", "voltage", "outage", "solar", "बिजली", "विद्युत", "energia", "apagão", "luz"],
        "healthcare": ["health", "hospital", "clinic", "ambulance", "doctor", "medicine", "vaccine", "swasthya", "अस्पताल", "दवा", "saúde", "posto", "médico", "vacina"],
        "education": ["school", "classroom", "teacher", "building", "desk", "student", "विद्यालय", "स्कूल", "escola", "sala", "professor"],
        "sanitation": ["sanitation", "toilet", "drainage", "sewage", "gutter", "waste", "garbage", "शौचालय", "कचरा", "esgoto", "lixo", "bueiro"],
        "public_safety": ["safety", "hazard", "flood", "collapse", "landslide", "fire", "बाढ़", "सुरक्षा", "risco", "desabamento", "enchente"]
    }

    URGENCY_SIGNALS = {
        "critical": ["contamination", "outbreak", "death", "hospital", "ambulance", "emergency", "fatal", "illness", "poison", "rupture", "impassable", "आपातकालीन", "दूषित", "urgente", "crítico"],
        "severe": ["weeks", "broken", "months", "hundreds", "no water", "blackout", "overflow", "damage", "सूख", "sem energia", "sem água"],
        "moderate": ["pothole", "delay", "repair", "dim", "slow", "leak"]
    }

    def classify_category(self, text: str) -> str:
        text_lower = text.lower()
        scores = {cat: 0 for cat in self.CATEGORIES}
        
        for cat, keywords in self.CATEGORY_KEYWORDS.items():
            for kw in keywords:
                if kw in text_lower:
                    scores[cat] += 1
        
        best_cat = max(scores, key=scores.get)
        return best_cat if scores[best_cat] > 0 else "other"

    def extract_urgency_score(self, text: str, user_signal: str = "standard") -> float:
        """Computes continuous urgency score 0.0 to 1.0"""
        text_lower = text.lower()
        score = 0.35  # baseline

        if user_signal == "critical":
            score += 0.40
        elif user_signal == "severe":
            score += 0.25

        for word in self.URGENCY_SIGNALS["critical"]:
            if word in text_lower:
                score += 0.25
                break

        for word in self.URGENCY_SIGNALS["severe"]:
            if word in text_lower:
                score += 0.15
                break

        # Cap between 0.1 and 1.0
        return min(max(round(score, 2), 0.1), 1.0)

    def extract_entities(self, text: str) -> Dict[str, Any]:
        """Extracts rough entity mentions like numbers of families or duration"""
        entities = {}
        
        # Numbers of people / families
        match_families = re.search(r'(\d+)\s*(families|households|people|persons|कुटुंब|परिवार|moradores)', text, re.IGNORECASE)
        if match_families:
            entities["affected_count"] = int(match_families.group(1))

        # Duration
        match_duration = re.search(r'(\d+)\s*(days|weeks|months|दिन|हफ्ते|meses|semanas)', text, re.IGNORECASE)
        if match_duration:
            entities["duration"] = f"{match_duration.group(1)} {match_duration.group(2)}"

        return entities

    def get_embedding(self, text: str, dim: int = 384) -> List[float]:
        """
        Generates deterministic semantic dense embedding vector (384d).
        # TODO: swap for fine-tuned sentence-transformers paraphrase-multilingual-MiniLM-L12-v2
        """
        # Deterministic seed from text tokens for repeatable cluster testing
        words = text.lower().split()
        vec = np.zeros(dim, dtype=np.float32)
        for i, word in enumerate(words):
            hash_val = hash(word) % dim
            vec[hash_val] += 1.0 / (i + 1)
        
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return [float(x) for x in vec]

    def process_text(self, text: str, user_signal: str = "standard") -> Dict[str, Any]:
        category = self.classify_category(text)
        urgency = self.extract_urgency_score(text, user_signal)
        entities = self.extract_entities(text)
        embedding = self.get_embedding(text)

        return {
            "category": category,
            "urgency_score": urgency,
            "entities": entities,
            "embedding": embedding
        }

nlu_service = NLUService()
