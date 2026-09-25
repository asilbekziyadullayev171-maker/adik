from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from .red_flag_rules import RED_FLAG_RULES, RedFlagRule

class RedFlagAlertData(BaseModel):
    rule_code: str
    rule_description: str
    severity: str
    triggered_values: Dict[str, Any]
    action_uz: str
    protocol: str

class RedFlagResult(BaseModel):
    has_red_flags: bool
    alerts: List[RedFlagAlertData]
    highest_severity: Optional[str]

class RedFlagEngine:
    def __init__(self):
        self.rules: List[RedFlagRule] = RED_FLAG_RULES
        self.severity_levels = {
            'emergency': 3,
            'critical': 2,
            'warning': 1
        }

    def _extract_triggered_values(self, data: Dict[str, Any], rule_id: str) -> Dict[str, Any]:
        """A simple extraction logic based on the rule being evaluated."""
        triggered = {}
        vitals = data.get('vital_signs', {})
        anamnesis = data.get('anamnesis', {})
        symptoms = data.get('symptoms', [])
        
        # This is a naive extraction for context reporting
        if rule_id in ('RF-001', 'RF-002'):
            if 'systolic_bp' in vitals: triggered['systolic_bp'] = vitals['systolic_bp']
            if 'diastolic_bp' in vitals: triggered['diastolic_bp'] = vitals['diastolic_bp']
        elif rule_id in ('RF-003', 'RF-004'):
            if 'pulse' in vitals: triggered['pulse'] = vitals['pulse']
        elif rule_id in ('RF-005', 'RF-014'):
            if 'spo2' in vitals: triggered['spo2'] = vitals['spo2']
        elif rule_id in ('RF-006', 'RF-007'):
            if 'temperature' in vitals: triggered['temperature'] = vitals['temperature']
        elif rule_id == 'RF-013':
            if 'respiratory_rate' in vitals: triggered['respiratory_rate'] = vitals['respiratory_rate']
        else:
            triggered['symptoms'] = symptoms
            triggered['anamnesis_hints'] = {k: v for k, v in anamnesis.items() if isinstance(v, str) and v.lower() in ('yes', 'sudden', 'severe', '10')}
            
        return triggered

    def check(self, data: Dict[str, Any]) -> RedFlagResult:
        alerts = []
        highest_score = 0
        highest_severity = None
        
        for rule in self.rules:
            try:
                if rule.condition(data):
                    alerts.append(RedFlagAlertData(
                        rule_code=rule.id,
                        rule_description=rule.message_uz,
                        severity=rule.severity,
                        triggered_values=self._extract_triggered_values(data, rule.id),
                        action_uz=rule.action_uz,
                        protocol=rule.protocol
                    ))
                    score = self.severity_levels.get(rule.severity.lower(), 0)
                    if score > highest_score:
                        highest_score = score
                        highest_severity = rule.severity
            except Exception as e:
                # Log error but continue checking other rules
                continue
                
        return RedFlagResult(
            has_red_flags=len(alerts) > 0,
            alerts=alerts,
            highest_severity=highest_severity
        )
