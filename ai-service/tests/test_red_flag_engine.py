import pytest
from src.red_flag_engine import RedFlagEngine

@pytest.fixture
def engine():
    return RedFlagEngine()

def test_normal_vitals_no_red_flag(engine):
    data = {
        'vital_signs': {
            'systolic_bp': 120,
            'diastolic_bp': 80,
            'pulse': 75,
            'spo2': 98,
            'temperature': 36.6,
            'respiratory_rate': 16
        },
        'symptoms': [],
        'anamnesis': {}
    }
    result = engine.check(data)
    assert not result.has_red_flags
    assert len(result.alerts) == 0
    assert result.highest_severity is None

def test_rf001_severe_hypotension(engine):
    data = {
        'vital_signs': {'systolic_bp': 70}
    }
    result = engine.check(data)
    assert result.has_red_flags
    assert result.highest_severity == 'emergency'
    assert any(a.rule_code == 'RF-001' for a in result.alerts)

def test_rf002_hypertensive_crisis(engine):
    data = {
        'vital_signs': {'systolic_bp': 210, 'diastolic_bp': 110}
    }
    result = engine.check(data)
    assert result.has_red_flags
    assert result.highest_severity == 'emergency'
    assert any(a.rule_code == 'RF-002' for a in result.alerts)

def test_rf005_severe_hypoxia(engine):
    data = {
        'vital_signs': {'spo2': 80}
    }
    result = engine.check(data)
    assert result.has_red_flags
    assert result.highest_severity == 'emergency'
    assert any(a.rule_code == 'RF-005' for a in result.alerts)

def test_rf008_chest_pain_radiation(engine):
    data = {
        'symptoms': ['chest_pain'],
        'anamnesis': {
            'cp_radiation': 'yes',
            'cp_radiation_location': ['left_arm']
        }
    }
    result = engine.check(data)
    assert result.has_red_flags
    assert result.highest_severity == 'emergency'
    assert any(a.rule_code == 'RF-008' for a in result.alerts)

def test_rf009_acs_triple(engine):
    data = {
        'symptoms': ['chest_pain', 'dyspnea'],
        'anamnesis': {
            'cp_diaphoresis': 'yes'
        }
    }
    result = engine.check(data)
    assert result.has_red_flags
    assert result.highest_severity == 'emergency'
    assert any(a.rule_code == 'RF-009' for a in result.alerts)

def test_rf011_meningitis_signs(engine):
    data = {
        'symptoms': ['headache', 'fever'],
        'anamnesis': {
            'ha_neck_stiffness': 'yes'
        }
    }
    result = engine.check(data)
    assert result.has_red_flags
    assert result.highest_severity == 'emergency'
    assert any(a.rule_code == 'RF-011' for a in result.alerts)

def test_rf014_moderate_hypoxia(engine):
    data = {
        'vital_signs': {'spo2': 90}
    }
    result = engine.check(data)
    assert result.has_red_flags
    assert result.highest_severity == 'warning'
    assert any(a.rule_code == 'RF-014' for a in result.alerts)

def test_multiple_red_flags(engine):
    data = {
        'vital_signs': {'spo2': 82, 'pulse': 170},
        'symptoms': ['syncope']
    }
    result = engine.check(data)
    assert result.has_red_flags
    assert result.highest_severity == 'emergency'
    assert len(result.alerts) >= 3  # RF-005 (spo2), RF-004 (pulse), RF-012 (syncope)
    rule_codes = [a.rule_code for a in result.alerts]
    assert 'RF-004' in rule_codes
    assert 'RF-005' in rule_codes
    assert 'RF-012' in rule_codes

def test_missing_vitals_no_crash(engine):
    data = {
        'vital_signs': {},
        'symptoms': [],
        'anamnesis': {}
    }
    result = engine.check(data)
    assert not result.has_red_flags

def test_borderline_values(engine):
    data = {
        'vital_signs': {'systolic_bp': 80} # 80 is not < 80, should not trigger RF-001
    }
    result = engine.check(data)
    assert not any(a.rule_code == 'RF-001' for a in result.alerts)
