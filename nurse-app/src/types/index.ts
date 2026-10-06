export type TriageLevel = 'EMERGENCY' | 'HIGH' | 'MODERATE' | 'LOW';

export interface Patient {
  id: string;
  code: string; // e.g. QM-2026-00104
  firstName: string;
  lastName: string;
  patronymic?: string;
  birthDate: string;
  age: number;
  gender: 'male' | 'female';
  phone: string;
  region?: string;
  district?: string;
  village: string;
  address: string;
  bloodGroup?: string;
  chronicConditions: string[];
  allergies: string[];
}

export interface VitalSigns {
  systolicBP: number; // mmHg (normal: 90 - 140)
  diastolicBP: number; // mmHg (normal: 60 - 90)
  pulseRate: number; // beats/min (normal: 60 - 100)
  temperature: number; // Celsius (normal: 36.0 - 37.2)
  spo2: number; // % (normal: 95 - 100)
  respiratoryRate: number; // breaths/min (normal: 12 - 20)
  weight?: number; // kg
  height?: number; // cm
}

export interface SymptomEntry {
  id: string;
  code: string;
  nameUz: string;
  category: string;
  severity: 'mild' | 'moderate' | 'severe';
  durationValue: number;
  durationUnit: 'soat' | 'kun' | 'hafta' | 'oy';
  onset: 'sudden' | 'gradual';
  details?: string;
}

export interface RedFlagAlert {
  id: string;
  code: string;
  titleUz: string;
  severity: 'EMERGENCY' | 'CRITICAL' | 'WARNING';
  descriptionUz: string;
  protocolUz: string;
}

export interface PotentialCondition {
  condition: string;
  conditionUz: string;
  likelihood: 'yuqori ehtimol' | 'o‘rta ehtimol' | 'past ehtimol';
  icd10?: string;
  clinicalReasoningUz: string;
}

export interface AIAssessment {
  riskLevel: TriageLevel;
  riskScore: number; // 0.0 - 1.0
  confidenceLevel: 'yuqori' | 'o‘rta' | 'past';
  potentialConditions: PotentialCondition[];
  keyRiskFactors: {
    factorUz: string;
    value: string;
    impact: 'yuqori' | 'o‘rta' | 'past';
    explanationUz: string;
  }[];
  missingData: {
    fieldUz: string;
    importance: 'yuqori' | 'o‘rta';
    reasonUz: string;
  }[];
  suggestedSpecialty: string;
  doctorRecommendationUz: string;
  disclaimerUz: string;
}

export interface DoctorReview {
  doctorId: string;
  doctorName: string;
  specialty: string;
  clinicName: string;
  reviewedAt: string;
  clinicalNotes: string;
  diagnosisText: string;
  icd10Code: string;
  treatmentPlan: string;
  prescriptions: {
    medicationName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
  referralRequired: boolean;
  referralDetails?: {
    destinationFacility: string;
    specialty: string;
    urgency: 'routine' | 'urgent' | 'emergency';
    reason: string;
  };
  followUpDate?: string;
  followUpInstructions?: string;
}

export interface ClinicalPhoto {
  id: string;
  url: string; // base64 or server url
  fileName: string;
  category: 'ecg' | 'skin_rash' | 'wound' | 'throat' | 'swelling' | 'other';
  categoryUz: string;
  title?: string;
  notes?: string;
  capturedAt: string;
}

export interface Visit {
  id: string;
  patientId: string;
  patient: Patient;
  nurseId: string;
  clinicId: string;
  clinicName: string;
  region?: string;
  district?: string;
  facility?: string;
  visitDate: string;
  chiefComplaint: string;
  symptoms: SymptomEntry[];
  vitals: VitalSigns;
  anamnesisAnswers: Record<string, string>;
  redFlags: RedFlagAlert[];
  aiAssessment?: AIAssessment;
  attachments?: ClinicalPhoto[];
  triageLevel: TriageLevel;
  targetSpecialty: string;
  targetDoctorId?: string;
  meetLink?: string;
  status: 'draft' | 'triage_ready' | 'submitted_to_doctor' | 'reviewed';
  doctorReview?: DoctorReview;
  createdAt: string;
  updatedAt: string;
}

export interface NurseProfile {
  id: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  region?: string;
  district?: string;
  facility?: string;
  badgeNumber?: string;
  role: string;
  phone: string;
  assignedFacility?: {
    name: string;
    type: string; // FAP / OSHP / QOP
    district: string;
    region: string;
    catchmentVillages: string[];
    populationServed: number;
  };
  assignedReferralHospital: {
    name: string;
    emergencyPhone: string;
    onDutyDoctorGroup: string;
  };
  stats: {
    todayVisits: number;
    monthVisits: number;
    pendingReviews: number;
    emergencyCasesMonth: number;
  };
  isOnline: boolean;
  lastSyncAt: string;
}

export interface PharmacyMedicine {
  id: number;
  name: string;
  dosage: string;
  inStock: boolean;
  priceUzs: number;
  quantityLeft: number;
}

export interface Pharmacy {
  id: number;
  name: string;
  address: string;
  phone: string;
  is24_7: boolean;
  distanceKm: number;
  medicines: PharmacyMedicine[];
}

export interface PrescriptionOrder {
  id: string;
  visitId: string;
  pharmacyId: number;
  pharmacyName: string;
  patientName: string;
  patientPhone: string;
  orderCode: string;
  medications: {
    medicationName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }[];
  status: 'sent_to_pharmacy' | 'ready_for_pickup' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface SyncQueueItem {
  id: string;
  entityType: 'visit' | 'patient' | 'prescription_order';
  operation: 'create' | 'update';
  payload: any;
  createdAt: string;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
}

export interface MedicineItem {
  id: string;
  name: string;
  dosage: string;
  category: string;
  quantityLeft: number;
  unit: string;
  priceUzs: number;
  expiryDate?: string;
  notes?: string;
  inStock: boolean;
  createdAt: string;
}

export interface UsedMedicineRecord {
  id: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  quantityUsed: number;
  unit: string;
  patientName: string;
  patientId?: string;
  reason: string;
  nurseName: string;
  usedAt: string;
}

