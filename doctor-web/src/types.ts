export interface Patient {
  id: string;
  patient_code: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  region?: string;
  district?: string;
  phone?: string;
  address?: string;
  national_id?: string;
  blood_type?: string;
  village?: {
    id: number;
    name: string;
  };
}

export interface VitalSign {
  id?: number;
  systolic_bp?: number;
  diastolic_bp?: number;
  pulse?: number;
  temperature?: number;
  spo2?: number;
  respiratory_rate?: number;
  weight?: number;
  height?: number;
  measured_at?: string;
}

export interface VisitSymptom {
  id?: number;
  symptom_id: number;
  severity: string;
  duration_value?: number;
  duration_unit?: string;
  onset?: string;
  additional_details?: string;
  symptom?: {
    id: number;
    code: string;
    name_uz: string;
  };
}

export interface ClinicalAttachment {
  id: string;
  visit_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  category: 'ecg' | 'skin_rash' | 'wound' | 'throat' | 'swelling' | 'other' | string;
  title?: string;
  notes?: string;
  created_at: string;
}

export interface AIAssessment {
  id?: string;
  risk_level: 'low' | 'moderate' | 'high' | 'critical' | string;
  risk_score?: number;
  confidence?: number;
  potential_conditions?: Array<{
    name: string;
    code?: string;
    probability: number;
    explanation?: string;
  }> | any;
  risk_factors?: string[];
  recommendations?: string[];
  model_name?: string;
  inference_time_ms?: number;
  created_at?: string;
}

export interface PrescriptionItem {
  id?: string;
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration_days: number;
  instructions: string;
  pharmacy_id?: number;
}

export interface DoctorAssessment {
  id?: string;
  doctor_id?: string;
  doctor_name?: string;
  doctor_specialty?: string;
  clinical_notes?: string;
  icd10_code?: string;
  diagnosis_name?: string;
  treatment_plan?: string;
  recommendations?: string; // Shifokorning shaxsiy tavsiyalari
  nurse_instructions?: string;
  ai_agreement?: boolean;
  ai_disagreement_reason?: string;
  prescriptions?: PrescriptionItem[];
  reviewed_at?: string;
  completed_at?: string;
}

export interface Visit {
  id: string;
  patient_id: string;
  nurse_id: string;
  clinic_id: number;
  visit_date: string;
  chief_complaint: string;
  status: 'draft' | 'submitted' | 'pending_doctor' | 'in_review' | 'completed' | string;
  risk_level?: 'low' | 'moderate' | 'high' | 'critical' | string;
  urgency?: number;
  notes?: string;
  patient_first_name?: string;
  patient_last_name?: string;
  symptom_count?: number;
  patient?: Patient;
  symptoms?: VisitSymptom[];
  vitals?: VitalSign;
  vital_signs?: VitalSign;
  ai_assessment?: AIAssessment;
  doctor_assessment?: DoctorAssessment;
  attachments?: ClinicalAttachment[];
  red_flags?: any[];
  meet_link?: string;
  targetSpecialty?: string;
  target_specialty?: string;
  region?: string;
  district?: string;
  facility?: string;
  // Direct summary fields for completed consultations
  icd10_code?: string;
  diagnosis_name?: string;
  doctor_recommendation?: string;
  prescriptions?: PrescriptionItem[];
  serviced_at?: string;
}

export interface Pharmacy {
  id: number;
  name: string;
  address: string;
  phone: string;
  village_name: string;
  is_duty_24_7: boolean;
  distance_km: number;
  medicines?: Array<{
    id: number;
    medicine_name: string;
    stock: number;
    price: number;
    unit: string;
  }>;
}

export interface DoctorProfile {
  id: string;
  fullName: string;
  specialty: string;
  specialtyCode: string;
  region?: string;
  district?: string;
  organization: string;
  phone: string;
  email: string;
  licenseNumber: string;
  avatarUrl?: string;
}
