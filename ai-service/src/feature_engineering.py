from typing import Dict, Any

class FeatureEngineer:
    def __init__(self):
        pass

    def extract_features(self, patient_data: Dict[str, Any]) -> Dict[str, float]:
        features = {}
        
        # Demographics
        demographics = patient_data.get('demographics', {})
        features['age'] = float(demographics.get('age')) if demographics.get('age') is not None else None
        features['gender_male'] = 1.0 if demographics.get('gender', '').lower() == 'male' else 0.0

        # Vital Signs
        vitals = patient_data.get('vital_signs', {})
        features['systolic_bp'] = float(vitals.get('systolic_bp')) if vitals.get('systolic_bp') is not None else None
        features['diastolic_bp'] = float(vitals.get('diastolic_bp')) if vitals.get('diastolic_bp') is not None else None
        features['pulse'] = float(vitals.get('pulse')) if vitals.get('pulse') is not None else None
        features['temperature'] = float(vitals.get('temperature')) if vitals.get('temperature') is not None else None
        features['spo2'] = float(vitals.get('spo2')) if vitals.get('spo2') is not None else None
        features['respiratory_rate'] = float(vitals.get('respiratory_rate')) if vitals.get('respiratory_rate') is not None else None
        features['weight'] = float(vitals.get('weight')) if vitals.get('weight') is not None else None
        features['height'] = float(vitals.get('height')) if vitals.get('height') is not None else None

        # Derived Vitals
        if features['systolic_bp'] is not None and features['diastolic_bp'] is not None:
            features['map'] = (features['systolic_bp'] + 2 * features['diastolic_bp']) / 3
            features['pulse_pressure'] = features['systolic_bp'] - features['diastolic_bp']
            if features['systolic_bp'] > 0 and features['pulse'] is not None:
                features['shock_index'] = features['pulse'] / features['systolic_bp']
            else:
                features['shock_index'] = None
        else:
            features['map'] = None
            features['pulse_pressure'] = None
            features['shock_index'] = None

        if features['weight'] is not None and features['height'] is not None and features['height'] > 0:
            features['bmi'] = features['weight'] / ((features['height'] / 100) ** 2)
        else:
            features['bmi'] = None

        # Symptoms
        symptoms = patient_data.get('symptoms', [])
        symptom_flags = ['chest_pain', 'dyspnea', 'fever', 'cough', 'headache', 'syncope', 'hemoptysis', 'abdominal_pain']
        for s in symptom_flags:
            features[f'has_{s}'] = 1.0 if s in symptoms else 0.0

        # severity_score and duration (mock logic as real inputs vary)
        features['severity_score'] = 1.0 if len(symptoms) > 0 else 0.0
        features['duration_hours'] = None # To be extracted from anamnesis if available

        # History
        history = patient_data.get('medical_history', {})
        chronic = history.get('chronic_diseases', [])
        features['chronic_diseases_count'] = float(len(chronic))
        features['has_diabetes'] = 1.0 if 'diabetes' in [c.lower() for c in chronic] else 0.0
        features['has_hypertension'] = 1.0 if 'hypertension' in [c.lower() for c in chronic] else 0.0
        features['has_cardiac_history'] = 1.0 if 'cardiac' in [c.lower() for c in chronic] else 0.0
        features['smoking'] = 1.0 if history.get('smoking', False) else 0.0

        # Missing data count
        missing_count = sum(1 for v in features.values() if v is None)
        features['missing_data_count'] = float(missing_count)

        return features
