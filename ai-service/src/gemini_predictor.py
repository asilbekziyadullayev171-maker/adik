"""
Gemini-powered medical risk assessment for QishloqMed AI.

MUHIM TIBBIY TAMOYIL:
- AI hech qachon yakuniy tashxis qo'ymaydi
- AI faqat risk assessment, triage va ehtimoliy holatlarni ko'rsatadi
- Yakuniy qaror FAQAT shifokor tomonidan qabul qilinadi
- Red Flag Engine AI dan mustaqil ishlaydi va birinchi tekshiriladi
"""

import json
import time
import logging
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

from .gemini_client import GeminiClient
from .predictor import RiskPredictor, PredictionResult
from .feature_engineering import FeatureEngineer

logger = logging.getLogger(__name__)

# =============================================================================
# SYSTEM PROMPT - Gemini uchun tibbiy AI ko'rsatmalari
# =============================================================================

MEDICAL_SYSTEM_PROMPT = """Sen QishloqMed AI tizimining tibbiy baholash moduli sifatida ishlaysan.

## SENING ROLIN
Sen O'zbekistonning chekka qishloqlarida ishlaydigan hamshiralar va shifokorlarga yordam beradigan tibbiy saralash (triage) AI yordamchisisan.
Sen yakuniy tashxis qo'yuvchi EMASSAN. Sen faqat xavf darajasini baholaysan va shifokorga qaror qabul qilishda yordam berasan.

## QAT'IY QOIDALAR
1. HECH QACHON "Sizda [kasallik nomi] bor" deb aytma
2. HECH QACHON yakuniy tashxis qo'yma
3. HECH QACHON dori tayinlama yoki davolash rejasi berma
4. HAR DOIM "ehtimoliy klinik holat", "shubha", "xavf" kabi so'zlarni ishlat
5. HAR DOIM shifokor ko'rib chiqishi kerakligini ta'kidla
6. Yetishmayotgan ma'lumotlarni aniq ko'rsat
7. O'z ishonch darajangni halol ko'rsat — bilmagan narsani bilaman dema
8. Javobingni O'ZBEK TILIDA ber

## SEN BAHOLASHI KERAK BO'LGAN NARSALAR
1. **Risk darajasi**: LOW, MODERATE, HIGH, EMERGENCY
2. **Ehtimoliy klinik holatlar**: Nima bo'lishi MUMKINLIGINI ko'rsat (tashxis EMAS)
3. **Asosiy xavf omillari**: Qaysi ko'rsatkichlar xavfni oshirmoqda
4. **Yetishmayotgan ma'lumotlar**: Qanday qo'shimcha tekshiruvlar foydali bo'lishi mumkin
5. **Tavsiya**: Shifokor uchun qisqa tavsiya

## JAVOB FORMATI
Javobni quyidagi JSON formatida ber:
{
  "risk_level": "LOW | MODERATE | HIGH | EMERGENCY",
  "risk_score": 0.0-1.0,
  "confidence_level": "past | o'rta | yuqori",
  "confidence_note": "Nima uchun bu darajada ishonch bor/yo'q",
  "potential_conditions": [
    {
      "condition": "Kasallik nomi (ingliz)",
      "condition_uz": "Ehtimoliy holat nomi (o'zbek)",
      "likelihood": "yuqori ehtimol | o'rta ehtimol | past ehtimol",
      "reasoning_uz": "Nima uchun bu holat ehtimoliy"
    }
  ],
  "risk_factors": [
    {
      "factor": "Ko'rsatkich nomi",
      "value": "Qiymati",
      "impact": "yuqori | o'rta | past",
      "explanation_uz": "Tushuntirish o'zbek tilida"
    }
  ],
  "missing_data": [
    {
      "field": "Kerakli ma'lumot",
      "importance": "yuqori | o'rta",
      "reason_uz": "Nima uchun bu ma'lumot kerak"
    }
  ],
  "doctor_recommendation_uz": "Shifokor uchun qisqa tavsiya o'zbek tilida",
  "disclaimer_uz": "Bu AI baholashidir. Yakuniy tashxis va davolash qarorini faqat shifokor qabul qiladi."
}"""


def _build_patient_prompt(patient_data: Dict[str, Any]) -> str:
    """Build a structured patient data prompt for Gemini."""

    sections = []

    # Demographics
    demo = patient_data.get("demographics", {})
    if demo:
        age = demo.get("age", "noma'lum")
        gender = demo.get("gender", "noma'lum")
        gender_uz = "Erkak" if gender == "male" else "Ayol" if gender == "female" else gender
        sections.append(f"## BEMOR MA'LUMOTLARI\n- Yoshi: {age}\n- Jinsi: {gender_uz}")

    # Chief complaint
    chief = patient_data.get("chief_complaint", "")
    if chief:
        sections.append(f"## ASOSIY SHIKOYAT\n{chief}")

    # Vital signs
    vitals = patient_data.get("vital_signs", {})
    if vitals:
        vitals_lines = []
        vital_labels = {
            "systolic_bp": ("Sistolik bosim", "mmHg"),
            "diastolic_bp": ("Diastolik bosim", "mmHg"),
            "pulse": ("Puls", "/min"),
            "temperature": ("Harorat", "°C"),
            "spo2": ("SpO2", "%"),
            "respiratory_rate": ("Nafas tezligi", "/min"),
            "weight": ("Vazn", "kg"),
            "height": ("Bo'y", "cm"),
        }
        for key, (label, unit) in vital_labels.items():
            val = vitals.get(key)
            if val is not None:
                vitals_lines.append(f"- {label}: {val} {unit}")
        if vitals_lines:
            sections.append("## HAYOTIY KO'RSATKICHLAR\n" + "\n".join(vitals_lines))

    # Symptoms
    symptoms = patient_data.get("symptoms", [])
    if symptoms:
        symp_lines = []
        for s in symptoms:
            if isinstance(s, dict):
                name = s.get("name_uz", s.get("name", ""))
                severity = s.get("severity", "")
                duration = ""
                if s.get("duration_value") and s.get("duration_unit"):
                    duration = f", {s['duration_value']} {s['duration_unit']}"
                onset = f", boshlanishi: {s['onset']}" if s.get("onset") else ""
                symp_lines.append(f"- {name} (darajasi: {severity}{duration}{onset})")
            else:
                symp_lines.append(f"- {s}")
        sections.append("## SIMPTOMLAR\n" + "\n".join(symp_lines))

    # Anamnesis responses
    anamnesis = patient_data.get("anamnesis", {})
    if anamnesis:
        anam_lines = []
        for q_id, answer in anamnesis.items():
            if isinstance(answer, dict):
                anam_lines.append(f"- {answer.get('question', q_id)}: {answer.get('value', '')}")
            else:
                anam_lines.append(f"- {q_id}: {answer}")
        if anam_lines:
            sections.append("## ANAMNEZ JAVOBLARI\n" + "\n".join(anam_lines))

    # Medical history
    history = patient_data.get("medical_history", {})
    if history:
        hist_lines = []
        if history.get("chronic_diseases"):
            hist_lines.append(f"Surunkali kasalliklar: {', '.join(history['chronic_diseases'])}")
        if history.get("allergies"):
            hist_lines.append(f"Allergiyalar: {', '.join(history['allergies'])}")
        if history.get("current_medications"):
            hist_lines.append(f"Hozirgi dorilar: {', '.join(history['current_medications'])}")
        if history.get("previous_surgeries"):
            hist_lines.append(f"Oldingi operatsiyalar: {', '.join(history['previous_surgeries'])}")
        if history.get("smoking"):
            hist_lines.append("Chekadi: Ha")
        if history.get("family_history"):
            hist_lines.append(f"Oilaviy tarix: {', '.join(history['family_history'])}")
        if hist_lines:
            sections.append("## TIBBIY TARIX\n" + "\n".join(f"- {l}" for l in hist_lines))

    # Previous visits summary
    prev_visits = patient_data.get("previous_visits", [])
    if prev_visits:
        visit_lines = []
        for v in prev_visits[-5:]:  # Last 5 visits max
            date = v.get("date", "")
            complaint = v.get("chief_complaint", "")
            diagnosis = v.get("diagnosis", "")
            visit_lines.append(f"- {date}: {complaint} → {diagnosis}")
        sections.append("## OLDINGI TASHRIFLAR\n" + "\n".join(visit_lines))

    # Lab results
    labs = patient_data.get("lab_results", [])
    if labs:
        lab_lines = [f"- {l.get('test_name', '')}: {l.get('result_value', '')} {l.get('result_unit', '')}" for l in labs]
        sections.append("## LABORATOR NATIJALAR\n" + "\n".join(lab_lines))

    prompt = "\n\n".join(sections)
    prompt += "\n\n## VAZIFA\nYuqoridagi ma'lumotlar asosida bemorning xavf darajasini baholab, JSON formatida javob ber."

    return prompt


class GeminiPredictor:
    """
    Gemini-powered risk assessment with rule-based fallback.

    Flow:
    1. Red Flag Engine tekshiradi (bu classdan OLDIN, alohida)
    2. Gemini API ga so'rov yuboriladi
    3. Gemini javob bermasa → rule-based fallback ishlatiladi
    """

    def __init__(
        self,
        api_key: str,
        model_name: str = "gemini-3.5-flash",
    ):
        self.gemini_client = GeminiClient(
            api_key=api_key,
            model_name=model_name,
        )
        self.fallback_predictor = RiskPredictor()
        self.feature_engineer = FeatureEngineer()

    def predict(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run Gemini-powered risk assessment.
        Falls back to rule-based scoring if Gemini fails.

        Args:
            patient_data: Dict with keys:
                - demographics: {age, gender}
                - chief_complaint: str
                - vital_signs: {systolic_bp, diastolic_bp, pulse, ...}
                - symptoms: [{name, severity, duration_value, duration_unit, onset}]
                - anamnesis: {question_id: answer}
                - medical_history: {chronic_diseases, allergies, ...}
                - previous_visits: [{date, chief_complaint, diagnosis}]
                - lab_results: [{test_name, result_value, result_unit}]

        Returns:
            Dict with risk_level, potential_conditions, risk_factors, etc.
        """
        start_time = time.time()

        # Try Gemini first
        result = self._predict_with_gemini(patient_data)

        if result is not None:
            result["model_name"] = "gemini"
            result["model_version"] = self.gemini_client.model_name
            result["inference_time_ms"] = int((time.time() - start_time) * 1000)
            return result

        # Fallback to rule-based scoring
        logger.warning("Gemini failed, falling back to rule-based scoring")
        return self._predict_with_fallback(patient_data, start_time)

    def _predict_with_gemini(self, patient_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Get prediction from Gemini API."""
        try:
            prompt = _build_patient_prompt(patient_data)

            response_text = self.gemini_client.generate(
                prompt=prompt,
                system_instruction=MEDICAL_SYSTEM_PROMPT,
                temperature=0.2,
            )

            if not response_text:
                return None

            parsed = self.gemini_client.parse_json_response(response_text)
            if not parsed:
                return None

            # Validate required fields
            if "risk_level" not in parsed:
                logger.error("Gemini response missing risk_level")
                return None

            # Ensure risk_level is valid
            valid_levels = {"LOW", "MODERATE", "HIGH", "EMERGENCY"}
            if parsed["risk_level"].upper() not in valid_levels:
                parsed["risk_level"] = "MODERATE"  # Safe default

            parsed["risk_level"] = parsed["risk_level"].upper()

            # Ensure disclaimer is always present
            parsed["disclaimer_uz"] = (
                "Bu AI baholashidir. Yakuniy tashxis va davolash qarorini "
                "faqat shifokor qabul qiladi."
            )

            return parsed

        except Exception as e:
            logger.error(f"Gemini prediction error: {e}")
            return None

    def _predict_with_fallback(
        self, patient_data: Dict[str, Any], start_time: float
    ) -> Dict[str, Any]:
        """Fall back to rule-based predictor."""
        features = self.feature_engineer.extract_features(patient_data)
        rule_result: PredictionResult = self.fallback_predictor.predict(features)

        return {
            "risk_level": rule_result.risk_level,
            "risk_score": rule_result.risk_score,
            "confidence_level": "past",
            "confidence_note": "Gemini AI javob bermadi, oddiy qoida asosida baholandi. Ishonch darajasi past.",
            "potential_conditions": [
                {
                    "condition": c.condition,
                    "condition_uz": c.condition_uz,
                    "likelihood": "o'rta ehtimol" if c.likelihood > 0.5 else "past ehtimol",
                    "reasoning_uz": c.condition_uz,
                }
                for c in rule_result.potential_conditions
            ],
            "risk_factors": [
                {
                    "factor": f.factor,
                    "value": str(f.value),
                    "impact": "yuqori" if f.impact > 20 else "o'rta" if f.impact > 10 else "past",
                    "explanation_uz": f.explanation_uz,
                }
                for f in rule_result.risk_factors
            ],
            "missing_data": [
                {
                    "field": m.field,
                    "importance": m.importance,
                    "reason_uz": m.reason_uz,
                }
                for m in rule_result.missing_data
            ],
            "doctor_recommendation_uz": "Shifokor ko'rib chiqishi tavsiya etiladi.",
            "disclaimer_uz": (
                "Bu AI baholashidir. Yakuniy tashxis va davolash qarorini "
                "faqat shifokor qabul qiladi."
            ),
            "model_name": "rule-based-fallback",
            "model_version": "1.0",
            "inference_time_ms": int((time.time() - start_time) * 1000),
        }
