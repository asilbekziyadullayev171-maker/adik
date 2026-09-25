CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Roles
CREATE TABLE roles (
    id SMALLINT PRIMARY KEY,
    name VARCHAR(20) UNIQUE NOT NULL,
    description VARCHAR(255)
);
COMMENT ON TABLE roles IS 'Rollar (NURSE, DOCTOR, ADMIN, PATIENT)';

-- 2. Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON COLUMN users.phone IS 'Login uchun';
COMMENT ON COLUMN users.password_hash IS 'bcrypt hash';
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_active ON users(is_active);

-- 3. User Roles
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id SMALLINT REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (user_id, role_id)
);

-- 4. Districts
CREATE TABLE districts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL
);
COMMENT ON COLUMN districts.region IS 'Viloyat';

-- 5. Villages
CREATE TABLE villages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    district_id INTEGER REFERENCES districts(id) ON DELETE CASCADE,
    population INTEGER,
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7)
);
CREATE INDEX idx_villages_district ON villages(district_id);

-- 6. Clinics
CREATE TABLE clinics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    clinic_type VARCHAR(50) NOT NULL,
    district_id INTEGER REFERENCES districts(id) ON DELETE RESTRICT,
    address TEXT,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true
);
COMMENT ON COLUMN clinics.clinic_type IS 'FAP, SVP, oilaviy poliklinika';

-- 7. Clinic Villages
CREATE TABLE clinic_villages (
    clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
    village_id INTEGER REFERENCES villages(id) ON DELETE CASCADE,
    PRIMARY KEY (clinic_id, village_id)
);

-- 8. Nurse Assignments
CREATE TABLE nurse_assignments (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
    assigned_from DATE NOT NULL,
    assigned_to DATE
);
COMMENT ON COLUMN nurse_assignments.user_id IS 'Hamshira';
COMMENT ON COLUMN nurse_assignments.assigned_to IS 'NULL = hozirgi';

-- 9. Patients
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_code VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) NOT NULL,
    phone VARCHAR(20),
    village_id INTEGER REFERENCES villages(id) ON DELETE RESTRICT,
    address TEXT,
    national_id VARCHAR(20) UNIQUE,
    blood_type VARCHAR(5),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON COLUMN patients.patient_code IS 'QM-2026-XXXXX';
COMMENT ON COLUMN patients.national_id IS 'Pasport/ID raqami (agar mavjud)';
COMMENT ON COLUMN patients.created_by IS 'Ro''yxatga olgan hamshira';
CREATE INDEX idx_patients_code ON patients(patient_code);
CREATE INDEX idx_patients_name ON patients(first_name, last_name);
CREATE INDEX idx_patients_village ON patients(village_id);
CREATE INDEX idx_patients_dob ON patients(date_of_birth);

-- 10. Medical History
CREATE TABLE medical_history (
    id SERIAL PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    onset_date DATE,
    is_current BOOLEAN DEFAULT true,
    recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    recorded_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON COLUMN medical_history.category IS 'chronic_disease, surgery, hospitalization, family_history, lifestyle';
COMMENT ON COLUMN medical_history.onset_date IS 'Qachondan beri';
COMMENT ON COLUMN medical_history.is_current IS 'Hozir ham davom etyaptimi';
CREATE INDEX idx_medhist_patient ON medical_history(patient_id);
CREATE INDEX idx_medhist_category ON medical_history(category);

-- 11. Medications
CREATE TABLE medications (
    id SERIAL PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    start_date DATE,
    end_date DATE,
    prescribed_by VARCHAR(200),
    is_current BOOLEAN DEFAULT true,
    recorded_by UUID REFERENCES users(id) ON DELETE SET NULL
);
COMMENT ON COLUMN medications.end_date IS 'NULL = davom etmoqda';

-- 12. Allergies
CREATE TABLE allergies (
    id SERIAL PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    allergen VARCHAR(200) NOT NULL,
    allergy_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20),
    reaction TEXT,
    recorded_by UUID REFERENCES users(id) ON DELETE SET NULL
);
COMMENT ON COLUMN allergies.allergy_type IS 'drug, food, environmental, other';
COMMENT ON COLUMN allergies.severity IS 'mild, moderate, severe';
COMMENT ON COLUMN allergies.reaction IS 'Qanday reaktsiya';

-- 13. Visits
CREATE TABLE visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    nurse_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    clinic_id INTEGER REFERENCES clinics(id) ON DELETE RESTRICT,
    visit_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    chief_complaint TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'in_progress',
    risk_level VARCHAR(15),
    urgency SMALLINT DEFAULT 0,
    notes TEXT,
    is_synced BOOLEAN DEFAULT false,
    local_id VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON COLUMN visits.chief_complaint IS 'Asosiy shikoyat';
COMMENT ON COLUMN visits.status IS 'in_progress, submitted, under_review, completed, emergency';
COMMENT ON COLUMN visits.urgency IS '0-3, notification uchun';
COMMENT ON COLUMN visits.notes IS 'Hamshira qo''shimcha izoh';
COMMENT ON COLUMN visits.is_synced IS 'Offline sync uchun';
COMMENT ON COLUMN visits.local_id IS 'Offline yaratilgan ID';
CREATE INDEX idx_visits_patient ON visits(patient_id);
CREATE INDEX idx_visits_nurse ON visits(nurse_id);
CREATE INDEX idx_visits_status ON visits(status);
CREATE INDEX idx_visits_date ON visits(visit_date);
CREATE INDEX idx_visits_risk ON visits(risk_level);

-- 14. Symptoms
CREATE TABLE symptoms (
    id SERIAL PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL,
    name_uz VARCHAR(200) NOT NULL,
    name_ru VARCHAR(200),
    name_en VARCHAR(200),
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT true
);

-- 15. Visit Symptoms
CREATE TABLE visit_symptoms (
    id SERIAL PRIMARY KEY,
    visit_id UUID REFERENCES visits(id) ON DELETE CASCADE,
    symptom_id INTEGER REFERENCES symptoms(id) ON DELETE RESTRICT,
    severity VARCHAR(20) NOT NULL,
    duration_value INTEGER,
    duration_unit VARCHAR(20),
    onset VARCHAR(30),
    frequency VARCHAR(30),
    additional_details TEXT
);
COMMENT ON COLUMN visit_symptoms.severity IS 'mild, moderate, severe';
CREATE INDEX idx_vsymptoms_visit ON visit_symptoms(visit_id);

-- 16. Vital Signs
CREATE TABLE vital_signs (
    id SERIAL PRIMARY KEY,
    visit_id UUID UNIQUE REFERENCES visits(id) ON DELETE CASCADE,
    systolic_bp SMALLINT,
    diastolic_bp SMALLINT,
    pulse SMALLINT,
    temperature DECIMAL(4,1),
    spo2 SMALLINT,
    respiratory_rate SMALLINT,
    weight DECIMAL(5,1),
    height DECIMAL(4,1),
    measured_at TIMESTAMPTZ DEFAULT now(),
    measurement_method VARCHAR(20) DEFAULT 'manual'
);
CREATE INDEX idx_vitals_visit ON vital_signs(visit_id);

-- 17. Anamnesis Responses
CREATE TABLE anamnesis_responses (
    id SERIAL PRIMARY KEY,
    visit_id UUID REFERENCES visits(id) ON DELETE CASCADE,
    symptom_code VARCHAR(30) NOT NULL,
    question_id VARCHAR(50) NOT NULL,
    question_text TEXT NOT NULL,
    answer_type VARCHAR(20) NOT NULL,
    answer_value TEXT NOT NULL
);
CREATE INDEX idx_anamnesis_visit ON anamnesis_responses(visit_id);

-- 18. Lab Results
CREATE TABLE lab_results (
    id SERIAL PRIMARY KEY,
    visit_id UUID REFERENCES visits(id) ON DELETE CASCADE,
    test_name VARCHAR(200) NOT NULL,
    test_code VARCHAR(50),
    result_value VARCHAR(100) NOT NULL,
    result_unit VARCHAR(50),
    reference_range VARCHAR(100),
    is_abnormal BOOLEAN,
    performed_at TIMESTAMPTZ,
    recorded_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- 19. Red Flag Alerts
CREATE TABLE red_flag_alerts (
    id SERIAL PRIMARY KEY,
    visit_id UUID REFERENCES visits(id) ON DELETE CASCADE,
    rule_code VARCHAR(50) NOT NULL,
    rule_description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL,
    triggered_values JSONB NOT NULL,
    action_taken TEXT,
    acknowledged_by UUID REFERENCES users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_redflag_visit ON red_flag_alerts(visit_id);
CREATE INDEX idx_redflag_severity ON red_flag_alerts(severity);

-- 20. AI Assessments
CREATE TABLE ai_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visit_id UUID UNIQUE REFERENCES visits(id) ON DELETE CASCADE,
    risk_level VARCHAR(15) NOT NULL,
    risk_score DECIMAL(5,4) NOT NULL,
    confidence DECIMAL(5,4),
    potential_conditions JSONB NOT NULL,
    risk_factors JSONB NOT NULL,
    missing_data JSONB,
    model_name VARCHAR(50) NOT NULL,
    model_version VARCHAR(20) NOT NULL,
    input_features JSONB,
    inference_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_ai_visit ON ai_assessments(visit_id);
CREATE INDEX idx_ai_risk ON ai_assessments(risk_level);

-- 21. Doctor Assessments
CREATE TABLE doctor_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visit_id UUID UNIQUE REFERENCES visits(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    clinical_notes TEXT,
    ai_agreement VARCHAR(20),
    ai_disagreement_reason TEXT,
    treatment_plan TEXT,
    recommendations TEXT,
    reviewed_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);
CREATE INDEX idx_docassess_visit ON doctor_assessments(visit_id);
CREATE INDEX idx_docassess_doctor ON doctor_assessments(doctor_id);

-- 22. Diagnoses
CREATE TABLE diagnoses (
    id SERIAL PRIMARY KEY,
    doctor_assessment_id UUID REFERENCES doctor_assessments(id) ON DELETE CASCADE,
    icd10_code VARCHAR(10),
    diagnosis_text TEXT NOT NULL,
    diagnosis_type VARCHAR(20) NOT NULL,
    certainty VARCHAR(20)
);
COMMENT ON COLUMN diagnoses.diagnosis_type IS 'primary, secondary, differential';

-- 23. Referrals
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_assessment_id UUID REFERENCES doctor_assessments(id) ON DELETE CASCADE,
    referred_to VARCHAR(200) NOT NULL,
    referral_reason TEXT NOT NULL,
    urgency VARCHAR(20) NOT NULL,
    specialty VARCHAR(100),
    referral_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    outcome TEXT
);
COMMENT ON COLUMN referrals.urgency IS 'routine, urgent, emergency';
COMMENT ON COLUMN referrals.status IS 'pending, accepted, completed, cancelled';

-- 24. Follow Ups
CREATE TABLE follow_ups (
    id SERIAL PRIMARY KEY,
    doctor_assessment_id UUID REFERENCES doctor_assessments(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    reason TEXT NOT NULL,
    instructions TEXT,
    status VARCHAR(20) DEFAULT 'scheduled',
    completed_visit_id UUID REFERENCES visits(id) ON DELETE SET NULL
);
COMMENT ON COLUMN follow_ups.status IS 'scheduled, completed, missed, cancelled';

-- 25. Prescriptions
CREATE TABLE prescriptions (
    id SERIAL PRIMARY KEY,
    doctor_assessment_id UUID REFERENCES doctor_assessments(id) ON DELETE CASCADE,
    medication_name VARCHAR(200) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration VARCHAR(100),
    instructions TEXT
);

-- 26. Notifications
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    body TEXT,
    reference_type VARCHAR(50),
    reference_id UUID,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_notif_user ON notifications(user_id);
CREATE INDEX idx_notif_unread ON notifications(user_id) WHERE is_read = false;

-- 27. Audit Logs
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(50) NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_date ON audit_logs(created_at);

-- 28. Sync Queue
CREATE TABLE sync_queue (
    id BIGSERIAL PRIMARY KEY,
    device_id VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_local_id VARCHAR(50) NOT NULL,
    entity_server_id UUID,
    operation VARCHAR(10) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    conflict_details JSONB,
    created_at TIMESTAMPTZ NOT NULL,
    synced_at TIMESTAMPTZ
);
CREATE INDEX idx_sync_status ON sync_queue(status);
CREATE INDEX idx_sync_device ON sync_queue(device_id);
CREATE INDEX idx_sync_user ON sync_queue(user_id);
