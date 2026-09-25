from typing import Callable, Dict, Any
from dataclasses import dataclass

@dataclass
class RedFlagRule:
    id: str
    name_uz: str
    condition: Callable[[Dict[str, Any]], bool]
    severity: str
    message_uz: str
    action_uz: str
    protocol: str

def safe_float(val):
    try:
        return float(val) if val is not None else None
    except (ValueError, TypeError):
        return None

def check_anamnesis(data: Dict[str, Any], keys: list, value: str) -> bool:
    anamnesis = data.get('anamnesis', {})
    return any(str(anamnesis.get(k, '')).lower() == value.lower() for k in keys)

def has_symptom(data: Dict[str, Any], symptom: str) -> bool:
    return symptom in data.get('symptoms', [])

# RF-001: Severe hypotension (systolic < 80) -> EMERGENCY
def rf001_condition(data: Dict[str, Any]) -> bool:
    sys = safe_float(data.get('vital_signs', {}).get('systolic_bp'))
    return sys is not None and sys < 80

# RF-002: Hypertensive crisis (systolic > 200 OR diastolic > 130) -> EMERGENCY
def rf002_condition(data: Dict[str, Any]) -> bool:
    sys = safe_float(data.get('vital_signs', {}).get('systolic_bp'))
    dia = safe_float(data.get('vital_signs', {}).get('diastolic_bp'))
    return (sys is not None and sys > 200) or (dia is not None and dia > 130)

# RF-003: Severe bradycardia (pulse < 40) -> EMERGENCY
def rf003_condition(data: Dict[str, Any]) -> bool:
    pulse = safe_float(data.get('vital_signs', {}).get('pulse'))
    return pulse is not None and pulse < 40

# RF-004: Severe tachycardia (pulse > 160) -> EMERGENCY
def rf004_condition(data: Dict[str, Any]) -> bool:
    pulse = safe_float(data.get('vital_signs', {}).get('pulse'))
    return pulse is not None and pulse > 160

# RF-005: Severe hypoxia (SpO2 < 85) -> EMERGENCY
def rf005_condition(data: Dict[str, Any]) -> bool:
    spo2 = safe_float(data.get('vital_signs', {}).get('spo2'))
    return spo2 is not None and spo2 < 85

# RF-006: Hypothermia (temp < 34) -> CRITICAL
def rf006_condition(data: Dict[str, Any]) -> bool:
    temp = safe_float(data.get('vital_signs', {}).get('temperature'))
    return temp is not None and temp < 34

# RF-007: Severe hyperthermia (temp > 41) -> EMERGENCY
def rf007_condition(data: Dict[str, Any]) -> bool:
    temp = safe_float(data.get('vital_signs', {}).get('temperature'))
    return temp is not None and temp > 41

# RF-008: Chest pain + radiation to left arm -> EMERGENCY
def rf008_condition(data: Dict[str, Any]) -> bool:
    if not has_symptom(data, 'chest_pain'):
        return False
    anamnesis = data.get('anamnesis', {})
    radiation = str(anamnesis.get('cp_radiation', '')).lower() == 'yes'
    location = anamnesis.get('cp_radiation_location', [])
    if isinstance(location, str):
        location = [location]
    return radiation and ('left_arm' in location or 'yes' in location or check_anamnesis(data, ['cp_radiation'], 'yes'))

# RF-009: Chest pain + dyspnea + diaphoresis -> EMERGENCY
def rf009_condition(data: Dict[str, Any]) -> bool:
    has_cp = has_symptom(data, 'chest_pain')
    has_dyspnea = has_symptom(data, 'dyspnea') or str(data.get('anamnesis', {}).get('cp_dyspnea', '')).lower() == 'yes'
    has_diaphoresis = str(data.get('anamnesis', {}).get('cp_diaphoresis', '')).lower() == 'yes'
    return has_cp and has_dyspnea and has_diaphoresis

# RF-010: Sudden severe headache -> EMERGENCY
def rf010_condition(data: Dict[str, Any]) -> bool:
    has_ha = has_symptom(data, 'headache')
    is_sudden = str(data.get('anamnesis', {}).get('ha_onset', '')).lower() == 'sudden'
    is_severe = str(data.get('anamnesis', {}).get('ha_severity', '')).lower() in ['severe', '10']
    return has_ha and is_sudden and is_severe

# RF-011: Headache + neck stiffness + fever -> EMERGENCY
def rf011_condition(data: Dict[str, Any]) -> bool:
    has_ha = has_symptom(data, 'headache')
    neck_stiff = str(data.get('anamnesis', {}).get('ha_neck_stiffness', '')).lower() == 'yes'
    has_fever_symptom = has_symptom(data, 'fever') or str(data.get('anamnesis', {}).get('ha_fever', '')).lower() == 'yes'
    temp = safe_float(data.get('vital_signs', {}).get('temperature'))
    has_fever_vitals = temp is not None and temp > 38.0
    return has_ha and neck_stiff and (has_fever_symptom or has_fever_vitals)

# RF-012: Syncope -> CRITICAL
def rf012_condition(data: Dict[str, Any]) -> bool:
    return has_symptom(data, 'syncope') or str(data.get('anamnesis', {}).get('cp_syncope', '')).lower() == 'yes'

# RF-013: RR > 30 -> CRITICAL
def rf013_condition(data: Dict[str, Any]) -> bool:
    rr = safe_float(data.get('vital_signs', {}).get('respiratory_rate'))
    return rr is not None and rr > 30

# RF-014: SpO2 88-92% -> WARNING
def rf014_condition(data: Dict[str, Any]) -> bool:
    spo2 = safe_float(data.get('vital_signs', {}).get('spo2'))
    return spo2 is not None and 88 <= spo2 <= 92

# RF-015: Hemoptysis -> CRITICAL
def rf015_condition(data: Dict[str, Any]) -> bool:
    return has_symptom(data, 'hemoptysis') or str(data.get('anamnesis', {}).get('cough_hemoptysis', '')).lower() == 'yes'

RED_FLAG_RULES = [
    RedFlagRule("RF-001", "Qattiq gipotoniya", rf001_condition, "emergency", "Sistolik qon bosimi xavfli darajada past", "Tez yordam chaqiring va bemorni yotqizib, oyoqlarini ko'taring.", "T_HYPOTENSION_01"),
    RedFlagRule("RF-002", "Gipertonik kriz", rf002_condition, "emergency", "Qon bosimi o'ta yuqori", "Tez yordam chaqiring, bemorni tinchlantiring va shifokor kelguncha kuzating.", "T_HYPERTENSION_01"),
    RedFlagRule("RF-003", "Kuchli bradikardiya", rf003_condition, "emergency", "Yurak urishi xavfli darajada sekin", "Tez yordam chaqiring.", "T_BRADYCARDIA_01"),
    RedFlagRule("RF-004", "Kuchli taxikardiya", rf004_condition, "emergency", "Yurak urishi xavfli darajada tez", "Tez yordam chaqiring, tinchlantiring.", "T_TACHYCARDIA_01"),
    RedFlagRule("RF-005", "Kuchli gipoksiya", rf005_condition, "emergency", "Kislorod darajasi xavfli darajada past", "Tez yordam chaqiring, kislorod niqobi taqing (agar bo'lsa).", "T_HYPOXIA_01"),
    RedFlagRule("RF-006", "Gipotermiya", rf006_condition, "critical", "Tana harorati xavfli darajada past", "Bemorni isiting, issiq ichimlik bering va shifokorga murojaat qiling.", "T_HYPOTHERMIA_01"),
    RedFlagRule("RF-007", "Kuchli gipertermiya", rf007_condition, "emergency", "Tana harorati o'ta yuqori", "Tez yordam chaqiring, sovutish choralarini ko'ring.", "T_HYPERTHERMIA_01"),
    RedFlagRule("RF-008", "Ko'krak og'rig'i + tarqalish", rf008_condition, "emergency", "Yurak xuruji xavfi (chap qo'lga tarqaluvchi og'riq)", "Tez yordam chaqiring, aspirin (agar qarshi ko'rsatma bo'lmasa) bering.", "T_ACS_01"),
    RedFlagRule("RF-009", "Ko'krak og'rig'i + nafas qisishi + terlash", rf009_condition, "emergency", "O'tkir koronar sindrom xavfi", "Tez yordam chaqiring, yarim o'tirgan holatda saqlang.", "T_ACS_02"),
    RedFlagRule("RF-010", "To'satdan kuchli bosh og'rig'i", rf010_condition, "emergency", "Qon quyilishi yoki insult xavfi", "Tez yordam chaqiring, bemorni yotqizib kuzating.", "T_NEURO_01"),
    RedFlagRule("RF-011", "Bosh og'rig'i + bo'yin qotishi + isitma", rf011_condition, "emergency", "Meningit xavfi", "Zudlik bilan tez yordam chaqiring va izolatsiya qiling.", "T_INFECT_01"),
    RedFlagRule("RF-012", "Hushdan ketish", rf012_condition, "critical", "Hushni yo'qotish holati aniqlandi", "Tez yordam chaqiring yoki shoshilinch tekshiruvdan o'tkazing.", "T_SYNCOPE_01"),
    RedFlagRule("RF-013", "Tezlashgan nafas olish", rf013_condition, "critical", "Nafas olish tezligi me'yordan ancha yuqori", "Shifokor nazoratiga zudlik bilan yuboring.", "T_TACHYPNEA_01"),
    RedFlagRule("RF-014", "O'rtacha gipoksiya", rf014_condition, "warning", "Kislorod darajasi pasaygan", "Kislorod darajasini qayta o'lchang, nafas olishini kuzating va shifokorga xabar bering.", "T_HYPOXIA_02"),
    RedFlagRule("RF-015", "Qon tuflash", rf015_condition, "critical", "Yo'talda qon kelishi aniqlandi", "Zudlik bilan shifokorga yoki kasalxonaga murojaat qiling.", "T_HEMOPTYSIS_01"),
]
