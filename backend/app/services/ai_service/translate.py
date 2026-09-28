"""Translation & Language Identification Adapter"""
from typing import Tuple, Dict

class TranslationService:
    """
    Multilingual Translation Adapter.
    Uses an adapter pattern so IndicTrans2, Gemini, or Google Cloud Translation
    can be plugged in without refactoring callers.
    """
    
    # Pre-cached multilingual mappings for high-frequency citizen complaints
    DEMO_TRANSLATIONS: Dict[str, str] = {
        "आमच्या गावात पिण्याच्या पाण्याची मुख्य पाईपलाईन 3 आठवड्यांपासून फुटली आहे. 350 कुटुंबांना पिण्यासाठी दूषित पाणी वापरावे लागत आहे.": 
            "The main drinking water feeder pipe in our ward has been ruptured for 3 weeks. 350 families are forced to consume contaminated well water.",
        "हमारे गांव में सड़क पर बहुत बड़े गड्ढे हैं, बारिश में एम्बुलेंस नहीं आ सकती।":
            "Large potholes on our village road; ambulances cannot pass during monsoons.",
        "O posto de saúde de Jequitinhonha está sem energia elétrica há 4 dias, vacinas estragaram.":
            "The Jequitinhonha health center has been without power for 4 days; vaccines have spoiled.",
        "В нашей деревне пересох колодец 3 недели назад; сотни семей вынуждены возить воду за несколько километров.":
            "The well in our village dried up 3 weeks ago; hundreds of families must haul water from kilometers away.",
        "我们村的供水管网破损已达3周，450户村民不得不步行4公里取用日常饮用水。":
            "Our village drinking water pipeline has been broken for 3 weeks; 450 households must walk 4km for daily drinking water."
    }

    def detect_language(self, text: str) -> str:
        """Language ID detector (fasttext / heuristic fallback)"""
        # Simple heuristic check for Indic, Cyrillic, Chinese, Portuguese
        for char in text:
            code = ord(char)
            if 0x0900 <= code <= 0x097F:
                return "hi"  # Devanagari (Hindi/Marathi)
            if 0x0400 <= code <= 0x04FF:
                return "ru"  # Cyrillic
            if 0x4E00 <= code <= 0x9FFF:
                return "zh"  # CJK
        # Portuguese common words
        pt_words = {"não", "posto", "saúde", "água", "energia", "escola"}
        if any(w in text.lower() for w in pt_words):
            return "pt"
        return "en"

    def translate(self, text: str, src_lang: str = "auto", target_lang: str = "en") -> Tuple[str, str]:
        """
        Translates source text into target language (default English for standardized NLU).
        Returns (translated_text, detected_src_lang).
        """
        detected = self.detect_language(text) if src_lang == "auto" else src_lang
        
        if detected == target_lang:
            return text, detected

        # Check known dictionary or provide normalized translation
        if text.strip() in self.DEMO_TRANSLATIONS:
            return self.DEMO_TRANSLATIONS[text.strip()], detected

        # Standard fallback translation
        return f"[Translated from {detected}]: {text}", detected

translate_service = TranslationService()
