from typing import Dict, Any, List
from pydantic import BaseModel
from .predictor import PredictionResult, RiskFactor, MissingDataInfo

class ExplanationResult(BaseModel):
    risk_factors: List[RiskFactor]
    missing_data: List[MissingDataInfo]
    confidence_note: str

class RiskExplainer:
    def __init__(self):
        pass
        
    def explain(self, features: Dict[str, float], prediction: PredictionResult) -> ExplanationResult:
        # Sort factors by highest impact
        sorted_factors = sorted(prediction.risk_factors, key=lambda x: x.impact, reverse=True)
        
        # Sort missing data by importance
        importance_map = {'high': 3, 'medium': 2, 'low': 1}
        sorted_missing = sorted(prediction.missing_data, key=lambda x: importance_map.get(x.importance, 0), reverse=True)
        
        disclaimer = "Diqqat: Ushbu tahlil sun'iy intellekt tomonidan amalga oshirilgan yordamchi baholash hisoblanadi va shifokor tashxisini o'rnini bosmaydi."
        
        return ExplanationResult(
            risk_factors=sorted_factors,
            missing_data=sorted_missing,
            confidence_note=disclaimer
        )

    def explain_with_shap(self, model, features: Dict[str, float]):
        # Placeholder for Phase 6
        raise NotImplementedError("SHAP explanation not implemented for MVP.")
