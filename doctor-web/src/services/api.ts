import type { 
  Visit, 
  ClinicalAttachment, 
  Pharmacy, 
  PrescriptionItem,
  DoctorProfile,
  DoctorAssessment
} from '../types';
import { detectRegionFromText } from '../data/uzbekistanRegions';

const API_BASE = '/api/v1';

// Sample clinical photo assets with high-definition medical imagery
export const SAMPLE_CLINICAL_PHOTOS = {
  ecg_st_elevation: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=85',
  skin_rash: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=85',
  throat_infection: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=85',
  wound_diabetic: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=85',
};

// Initial doctor profile default (unconfigured region triggers first-time setup)
export const DEFAULT_DOCTOR_PROFILE: DoctorProfile = {
  id: 'doc-170',
  fullName: 'Dr. Umid Dilmurodov',
  specialty: 'Umumiy amaliyot shifokori (Bosh terapevt)',
  specialtyCode: 'general_physician',
  region: '',
  district: '',
  organization: '',
  phone: '+998 90 999-99-99',
  email: 'dilmurodovumid170@gmail.com',
  licenseNumber: 'UZ-MD-44812',
};

// Initial seeded visits with full clinical details, photos, vitals and diagnoses
const INITIAL_SEED_VISITS: Visit[] = [
  {
    id: 'vis-seed-001',
    patient_id: 'pat-001',
    nurse_id: 'nurse-01',
    clinic_id: 1,
    visit_date: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    chief_complaint: "Ko'krak qafasida qisuvchi, chap yelkaga tarqaluvchi og'riq, nafas qisishi va sovuq ter bosishi",
    status: 'pending_doctor',
    risk_level: 'critical',
    urgency: 3,
    targetSpecialty: 'Kardiolog (Yurak qon-tomir mutaxassisi)',
    patient_first_name: 'Rustam',
    patient_last_name: 'Karimov',
    region: 'Samarqand viloyati',
    district: 'Urgut tumani',
    facility: 'Urgut tumani 14-sonli OSHP',
    patient: {
      id: 'pat-001',
      patient_code: 'P-00192',
      first_name: 'Rustam',
      last_name: 'Karimov',
      date_of_birth: '1966-03-14',
      gender: 'male',
      phone: '+998 90 234-56-78',
      national_id: 'AB 5542190',
      blood_type: 'II (A) Rh+',
      region: 'Samarqand viloyati',
      district: 'Urgut tumani',
      address: 'Ibn Sino ko\'chasi, 14-uy',
      village: { id: 1, name: "Urgut tumani, Bog'iston QFY" }
    },
    vital_signs: {
      systolic_bp: 170,
      diastolic_bp: 105,
      pulse: 96,
      spo2: 93,
      temperature: 36.8,
      respiratory_rate: 22,
      measured_at: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    },
    vitals: {
      systolic_bp: 170,
      diastolic_bp: 105,
      pulse: 96,
      spo2: 93,
      temperature: 36.8,
      respiratory_rate: 22,
      measured_at: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    },
    ai_assessment: {
      risk_level: 'critical',
      risk_score: 92,
      confidence: 0.94,
      potential_conditions: [
        {
          name: "O'tkir koronar sindrom / Miokard infarkti ehtimoli",
          code: 'I21.9',
          probability: 88,
          explanation: "EKG dagi ST segmenti o'zgarishi, ko'krak qafasidagi retrosternal og'riq va gipoksiya"
        },
        {
          name: 'Nostabil stenokardiya',
          code: 'I20.0',
          probability: 72,
          explanation: "Arterial gipertoniya kriz holati bilan birga kelgan ishemiya"
        }
      ],
      risk_factors: [
        'Qon bosimi 170/105 mmHg (II-III daraja gipertoniya)',
        'SpO2 93% (Gipoksiya)',
        'Taxikardiya (96 bpm)'
      ],
      recommendations: [
        'Zudlik bilan EKG tahlilini tekshiring',
        'Nitroglitserin 0.5mg til ostiga va Aspirin 300mg chaynashga buyurilsin',
        'Tuman markaziy shifoxonasi kardiologiyasiga 103 shoshilinch yuborilsin'
      ],
      model_name: 'gemini-3.1-flash-lite'
    },
    attachments: [
      {
        id: 'att-001',
        visit_id: 'vis-seed-001',
        file_name: 'ekg_lead_12.jpg',
        file_url: SAMPLE_CLINICAL_PHOTOS.ecg_st_elevation,
        file_type: 'image/jpeg',
        category: 'ecg',
        title: '12 tarmoqli EKG tasmasi',
        notes: "V2-V4 tarmoqlarda ST ko'tarilishi kuzatilmoqda",
        created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'vis-seed-002',
    patient_id: 'pat-002',
    nurse_id: 'nurse-01',
    clinic_id: 1,
    visit_date: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    chief_complaint: "Qo'l panjalari va bilak sohasida kuchli qichishish, qizarish va pufakchali toshmalar",
    status: 'pending_doctor',
    risk_level: 'moderate',
    urgency: 1,
    targetSpecialty: 'Dermatolog (Teri-tanosil shifokori)',
    patient_first_name: 'Malika',
    patient_last_name: 'Rahimova',
    region: 'Samarqand viloyati',
    district: 'Samarqand shahri',
    facility: 'Samarqand shahar 1-son Markaziy poliklinikasi',
    patient: {
      id: 'pat-002',
      patient_code: 'P-00244',
      first_name: 'Malika',
      last_name: 'Rahimova',
      date_of_birth: '1992-07-21',
      gender: 'female',
      phone: '+998 93 456-78-90',
      national_id: 'AC 8871234',
      blood_type: 'I (0) Rh+',
      region: 'Samarqand viloyati',
      district: 'Samarqand shahri',
      address: 'Tinchlik ko\'chasi, 8-uy',
      village: { id: 3, name: "Samarqand shahar, Chorbog' mahallasi" }
    },
    vital_signs: {
      systolic_bp: 118,
      diastolic_bp: 75,
      pulse: 74,
      spo2: 99,
      temperature: 36.6,
      respiratory_rate: 16,
      measured_at: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    },
    vitals: {
      systolic_bp: 118,
      diastolic_bp: 75,
      pulse: 74,
      spo2: 99,
      temperature: 36.6,
      respiratory_rate: 16,
      measured_at: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    },
    ai_assessment: {
      risk_level: 'moderate',
      risk_score: 42,
      confidence: 0.91,
      potential_conditions: [
        {
          name: 'Allergik kontakt dermatit',
          code: 'L23.9',
          probability: 79,
          explanation: "Yangi yuvish vositasi bilan kontakt natijasida teri giperemiyasi va pufakchali toshmalar"
        },
        {
          name: 'O\'tkir eshakemi (Urtikariya)',
          code: 'L50.0',
          probability: 45,
          explanation: "Allergen ta'sirida tez rivojlangan qichimali dermatoz"
        }
      ],
      risk_factors: [
        'Teri qoplamlarida tarqalgan allergik elementlar',
        'Kuchli mahalliy qichishish'
      ],
      recommendations: [
        'Antigistamin vositalari (Suprastin yoki Setirizin) tavsiya etilsin',
        'Allergen bilan kontaktni to\'xtatish'
      ],
      model_name: 'gemini-3.1-flash-lite'
    },
    attachments: [
      {
        id: 'att-002',
        visit_id: 'vis-seed-002',
        file_name: 'skin_rash_wrist.jpg',
        file_url: SAMPLE_CLINICAL_PHOTOS.skin_rash,
        file_type: 'image/jpeg',
        category: 'skin_rash',
        title: 'Qo\'l panjalari va bilak terisi fotosurati',
        notes: "Eritematoz toshmalar, qichish izlari",
        created_at: new Date(Date.now() - 50 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'vis-seed-003',
    patient_id: 'pat-003',
    nurse_id: 'nurse-02',
    clinic_id: 1,
    visit_date: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    chief_complaint: "Bosh ensa sohasida og'riq, quloqlarda shovqin, ko'z oldi xiralashishi",
    status: 'completed',
    risk_level: 'moderate',
    urgency: 1,
    targetSpecialty: 'Umumiy amaliyot shifokori (Bosh terapevt)',
    patient_first_name: 'Anvar',
    patient_last_name: 'Toshmatov',
    region: 'Samarqand viloyati',
    district: 'Pastdarg‘om tumani',
    facility: "Pastdarg'om Markaziy ko'p tarmoqli poliklinika",
    icd10_code: 'I10',
    diagnosis_name: 'Birlamchi (essensial) arterial gipertenziya II bosqich',
    doctor_recommendation: "Kundalik qon bosimini 2 mahal o'lchash va kundalikka qayd etish. Tuz miqdorini sutkasiga 4-5 grammgacha cheklash. 14 kundan so'ng qayta nazorat ko'rigi.",
    serviced_at: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    prescriptions: [
      {
        id: 'rx-01',
        medicine_name: 'Enalapril 10mg',
        dosage: '1 tabletkadan kuniga 1 mahal ertalab',
        frequency: '1 mahal',
        duration_days: 30,
        instructions: 'Nonushtadan keyin suv bilan qabul qilish',
        pharmacy_id: 1
      },
      {
        id: 'rx-02',
        medicine_name: 'Aspirin Kardio 100mg',
        dosage: '1 tabletkadan kechki ovqatdan keyin',
        frequency: '1 mahal kechqurun',
        duration_days: 30,
        instructions: 'Kechki ovqatdan keyin',
        pharmacy_id: 1
      }
    ],
    patient: {
      id: 'pat-003',
      patient_code: 'P-00108',
      first_name: 'Anvar',
      last_name: 'Toshmatov',
      date_of_birth: '1962-11-05',
      gender: 'male',
      phone: '+998 91 333-22-11',
      national_id: 'AA 9012345',
      blood_type: 'III (B) Rh+',
      region: 'Samarqand viloyati',
      district: 'Pastdarg‘om tumani',
      address: 'Mustaqillik ko\'chasi, 23-uy',
      village: { id: 2, name: 'Pastdarg\'om, Oltinsoy markazi' }
    },
    vital_signs: {
      systolic_bp: 155,
      diastolic_bp: 95,
      pulse: 80,
      spo2: 97,
      temperature: 36.5,
      respiratory_rate: 18,
      measured_at: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    },
    vitals: {
      systolic_bp: 155,
      diastolic_bp: 95,
      pulse: 80,
      spo2: 97,
      temperature: 36.5,
      respiratory_rate: 18,
      measured_at: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    },
    doctor_assessment: {
      doctor_id: 'doc-170',
      doctor_name: 'Dr. Umid Dilmurodov',
      doctor_specialty: 'Umumiy amaliyot shifokori (Bosh terapevt)',
      icd10_code: 'I10',
      diagnosis_name: 'Birlamchi (essensial) arterial gipertenziya II bosqich',
      clinical_notes: 'Bemor hayotiy ko\'rsatkichlari baholandi. Qon bosimi ko\'tarilishi xurujlari qayd etilgan.',
      treatment_plan: 'Gipotenziv rejim, tana vaznini nazorat qilish, jismoniy faollik.',
      recommendations: 'Kundalik qon bosimini 2 mahal o\'lchash va kundalikka qayd etish. Tuz miqdorini sutkasiga 4-5 grammgacha cheklash.',
      prescriptions: [
        {
          id: 'rx-01',
          medicine_name: 'Enalapril 10mg',
          dosage: '1 tabletkadan kuniga 1 mahal ertalab',
          frequency: '1 mahal',
          duration_days: 30,
          instructions: 'Nonushtadan keyin suv bilan qabul qilish',
          pharmacy_id: 1
        }
      ],
      completed_at: new Date(Date.now() - 120 * 60 * 1000).toISOString()
    }
  },
  {
    id: 'vis-seed-004',
    patient_id: 'pat-004',
    nurse_id: 'nurse-01',
    clinic_id: 1,
    visit_date: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    chief_complaint: "Yuz assimetriyasi, nutq tushunarsizligi va o'ng qo'l-oyoqda to'satdan holsizlik (Insult gumoni)",
    status: 'pending_doctor',
    risk_level: 'critical',
    urgency: 3,
    targetSpecialty: 'Nevropatolog (Asab tizimi kasalliklari)',
    patient_first_name: 'Asad',
    patient_last_name: 'Boymirzayev',
    region: 'Toshkent viloyati',
    district: 'Bo‘stonliq tumani',
    facility: 'Burchmulla QOP / FAP №4',
    patient: {
      id: 'pat-004',
      patient_code: 'P-00189',
      first_name: 'Asad',
      last_name: 'Boymirzayev',
      date_of_birth: '1983-10-05',
      gender: 'male',
      phone: '+998 90 999-12-34',
      national_id: 'AB 1791159',
      blood_type: 'II (A) Rh+',
      region: 'Toshkent viloyati',
      district: 'Bo‘stonliq tumani',
      address: 'Burchmulla qishlog\'i, 4-uy',
      village: { id: 1, name: 'Burchmulla FAP №4' }
    },
    vital_signs: {
      systolic_bp: 185,
      diastolic_bp: 110,
      pulse: 88,
      spo2: 95,
      temperature: 36.7,
      respiratory_rate: 19,
      measured_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    vitals: {
      systolic_bp: 185,
      diastolic_bp: 110,
      pulse: 88,
      spo2: 95,
      temperature: 36.7,
      respiratory_rate: 19,
      measured_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    ai_assessment: {
      risk_level: 'critical',
      risk_score: 94,
      confidence: 0.95,
      potential_conditions: [
        {
          name: 'Bosh miya qon aylanishining o‘tkir buzilishi (O‘tkir ishemik insult)',
          code: 'I63.9',
          probability: 93,
          explanation: 'Yuz assimetriyasi, motor afaziya va gemiparez belgilari o‘tkir insult klinik manzarasiga to‘liq mos keladi.'
        }
      ],
      risk_factors: [
        'FAST testi musbat (Face drooping, Arm weakness, Speech difficulty)',
        'Arterial gipertoniya III daraja (185/110 mmHg)'
      ],
      recommendations: [
        'Zudlik bilan KT (kompyuter tomografiya) ga yuborish',
        'Terapevtik darcha ichida (4.5 soat) trombolitik terapiya uchun shoshilinch neyro-statsionarga yo\'naltirish'
      ],
      model_name: 'gemini-3.1-flash-lite'
    }
  },
  {
    id: 'vis-seed-005',
    patient_id: 'pat-005',
    nurse_id: 'nurse-03',
    clinic_id: 1,
    visit_date: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    chief_complaint: "Kuchli ekspirator nafas qisishi, xirillash, quruq yo'tal va havo yetishmasligi",
    status: 'pending_doctor',
    risk_level: 'high',
    urgency: 2,
    targetSpecialty: 'Pulmonolog (O‘pka kasalliklari mutaxassisi)',
    patient_first_name: 'Fotima',
    patient_last_name: 'Karimova',
    region: 'Andijon viloyati',
    district: 'Asaka tumani',
    facility: 'Asaka tuman Shoshilinch tibbiy yordam bo‘limi',
    patient: {
      id: 'pat-005',
      patient_code: 'P-00305',
      first_name: 'Fotima',
      last_name: 'Karimova',
      date_of_birth: '1998-04-12',
      gender: 'female',
      phone: '+998 97 123-45-67',
      national_id: 'AC 3321456',
      blood_type: 'III (B) Rh+',
      region: 'Andijon viloyati',
      district: 'Asaka tumani',
      address: 'Navoiy shoh ko\'chasi, 45-uy',
      village: { id: 5, name: 'Asaka, Qadimiy Bozor MFY' }
    },
    vital_signs: {
      systolic_bp: 125,
      diastolic_bp: 80,
      pulse: 108,
      spo2: 91,
      temperature: 37.1,
      respiratory_rate: 26,
      measured_at: new Date(Date.now() - 38 * 60 * 1000).toISOString(),
    },
    vitals: {
      systolic_bp: 125,
      diastolic_bp: 80,
      pulse: 108,
      spo2: 91,
      temperature: 37.1,
      respiratory_rate: 26,
      measured_at: new Date(Date.now() - 38 * 60 * 1000).toISOString(),
    },
    ai_assessment: {
      risk_level: 'high',
      risk_score: 82,
      confidence: 0.92,
      potential_conditions: [
        {
          name: 'Bronxial astma o‘tkir xuruji (o‘rtacha og‘ir daraja)',
          code: 'J45.9',
          probability: 88,
          explanation: 'Nafas chastotasi 26/min, taxikardiya 108 bpm, SpO2 91% gipoksiya bilan kechayotgan bronxospazm.'
        }
      ],
      risk_factors: [
        'SpO2 pasayishi (91%)',
        'Taxipnoe (26 nafas/daqiqa)'
      ],
      recommendations: [
        'Kislorod ingalyatsiyasi (2-4 L/min)',
        'Salbutamol nebulayzer orqali 2.5mg ingalyatsiya',
        'Zarurat bo\'lsa Deksametazon 8mg v/i'
      ],
      model_name: 'gemini-3.1-flash-lite'
    }
  },
  {
    id: 'vis-seed-006',
    patient_id: 'pat-006',
    nurse_id: 'nurse-04',
    clinic_id: 1,
    visit_date: new Date(Date.now() - 70 * 60 * 1000).toISOString(),
    chief_complaint: "Kuchli chanqash, tez-tez siyish, ko'rishning xiralashishi va oyoqlar uvishishi",
    status: 'pending_doctor',
    risk_level: 'moderate',
    urgency: 1,
    targetSpecialty: 'Endokrinolog (Qandli diabet mutaxassisi)',
    patient_first_name: 'Rustam',
    patient_last_name: 'Olimov',
    region: 'Farg‘ona viloyati',
    district: 'Marg‘ilon shahri',
    facility: 'Marg‘ilon shahar 2-son oilaviy poliklinikasi',
    patient: {
      id: 'pat-006',
      patient_code: 'P-00412',
      first_name: 'Rustam',
      last_name: 'Olimov',
      date_of_birth: '1971-09-18',
      gender: 'male',
      phone: '+998 94 567-89-01',
      national_id: 'AA 7788990',
      blood_type: 'I (0) Rh+',
      region: 'Farg‘ona viloyati',
      district: 'Marg‘ilon shahri',
      address: 'Ipakchilar ko\'chasi, 19-uy',
      village: { id: 6, name: 'Marg‘ilon shahar, Oltin Vodiy MFY' }
    },
    vital_signs: {
      systolic_bp: 145,
      diastolic_bp: 90,
      pulse: 82,
      spo2: 97,
      temperature: 36.6,
      respiratory_rate: 18,
      measured_at: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    },
    vitals: {
      systolic_bp: 145,
      diastolic_bp: 90,
      pulse: 82,
      spo2: 97,
      temperature: 36.6,
      respiratory_rate: 18,
      measured_at: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    },
    ai_assessment: {
      risk_level: 'moderate',
      risk_score: 58,
      confidence: 0.89,
      potential_conditions: [
        {
          name: '2-tur qandli diabet dekompensatsiya bosqichi, polineyropatiya',
          code: 'E11.9',
          probability: 87,
          explanation: 'Polidipsiya, poliuriya va periferik sezuvchanlik buzilishi giperglikemiya asoratini bildiradi.'
        }
      ],
      risk_factors: [
        'Glyukoza ko\'rsatkichi ekspress tekshiruvda 15.4 mmol/l',
        'Arterial gipertoniya I daraja'
      ],
      recommendations: [
        'Glikirlangan gemoglobin (HbA1c) tahlili',
        'Metformin dozasi korreksiyasi yoki insulin terapiyasi konsultatsiyasi'
      ],
      model_name: 'gemini-3.1-flash-lite'
    }
  },
  {
    id: 'vis-seed-007',
    patient_id: 'pat-007',
    nurse_id: 'nurse-05',
    clinic_id: 1,
    visit_date: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
    chief_complaint: "O'ng qovurg'a ostida kuchli to'satdan og'riq, ko'ngil aynishi, og'izda taxirlik va tana harorati ko'tarilishi",
    status: 'pending_doctor',
    risk_level: 'high',
    urgency: 2,
    targetSpecialty: 'Umumiy amaliyot shifokori (Bosh terapevt)',
    patient_first_name: 'Gulnora',
    patient_last_name: 'Mirzayeva',
    region: 'Qashqadaryo viloyati',
    district: 'Qarshi shahri',
    facility: 'Qashqadaryo viloyat ko‘p tarmoqli tibbiyot markazi',
    patient: {
      id: 'pat-007',
      patient_code: 'P-00519',
      first_name: 'Gulnora',
      last_name: 'Mirzayeva',
      date_of_birth: '1977-02-03',
      gender: 'female',
      phone: '+998 99 876-54-32',
      national_id: 'AB 6655443',
      blood_type: 'II (A) Rh+',
      region: 'Qashqadaryo viloyati',
      district: 'Qarshi shahri',
      address: 'Nasaf ko\'chasi, 88-uy',
      village: { id: 7, name: 'Qarshi shahar, Paxtazor MFY' }
    },
    vital_signs: {
      systolic_bp: 135,
      diastolic_bp: 88,
      pulse: 94,
      spo2: 97,
      temperature: 38.3,
      respiratory_rate: 20,
      measured_at: new Date(Date.now() - 100 * 60 * 1000).toISOString(),
    },
    vitals: {
      systolic_bp: 135,
      diastolic_bp: 88,
      pulse: 94,
      spo2: 97,
      temperature: 38.3,
      respiratory_rate: 20,
      measured_at: new Date(Date.now() - 100 * 60 * 1000).toISOString(),
    },
    ai_assessment: {
      risk_level: 'high',
      risk_score: 79,
      confidence: 0.91,
      potential_conditions: [
        {
          name: 'O‘tkir kalkulyoz xolesistit xuruji',
          code: 'K80.0',
          probability: 86,
          explanation: 'O‘ng qovurg‘a osti sohasidagi og‘riq, febril harorat 38.3°C va Merfi simptomi ijobiyligi.'
        }
      ],
      risk_factors: [
        'Yuqori harorat (38.3°C)',
        'O\'t pufagi sohasida peritoneal belgilar'
      ],
      recommendations: [
        'Qorin bo\'shlig\'i UTT (UZI) tekshiruvi shoshilinch',
        'Spazmolitik va analgetik preparatlar (Drotaverin 2.0m m/o)',
        'Xirurgik ko\'rik'
      ],
      model_name: 'gemini-3.1-flash-lite'
    }
  },
  {
    id: 'vis-seed-008',
    patient_id: 'pat-008',
    nurse_id: 'nurse-06',
    clinic_id: 1,
    visit_date: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    chief_complaint: "Chap bel sohasida o'tkir, to'lqinsimon chidab bo'lmas sanchiq, siydik rangi qizg'ishligi",
    status: 'pending_doctor',
    risk_level: 'high',
    urgency: 2,
    targetSpecialty: 'Umumiy amaliyot shifokori (Bosh terapevt)',
    patient_first_name: 'Jasur',
    patient_last_name: 'Bekmurodov',
    region: 'Buxoro viloyati',
    district: 'G‘ijduvon tumani',
    facility: 'G‘ijduvon tuman tibbiyot birlashmasi',
    patient: {
      id: 'pat-008',
      patient_code: 'P-00624',
      first_name: 'Jasur',
      last_name: 'Bekmurodov',
      date_of_birth: '1988-12-14',
      gender: 'male',
      phone: '+998 93 111-22-33',
      national_id: 'AC 9988771',
      blood_type: 'IV (AB) Rh+',
      region: 'Buxoro viloyati',
      district: 'G‘ijduvon tumani',
      address: 'Kulollar ko\'chasi, 12-uy',
      village: { id: 8, name: 'G‘ijduvon, Zarafshon MFY' }
    },
    vital_signs: {
      systolic_bp: 150,
      diastolic_bp: 95,
      pulse: 98,
      spo2: 98,
      temperature: 37.0,
      respiratory_rate: 19,
      measured_at: new Date(Date.now() - 115 * 60 * 1000).toISOString(),
    },
    vitals: {
      systolic_bp: 150,
      diastolic_bp: 95,
      pulse: 98,
      spo2: 98,
      temperature: 37.0,
      respiratory_rate: 19,
      measured_at: new Date(Date.now() - 115 * 60 * 1000).toISOString(),
    },
    ai_assessment: {
      risk_level: 'high',
      risk_score: 80,
      confidence: 0.93,
      potential_conditions: [
        {
          name: 'Buyrak sanchig‘i / Chap buyrak va siydik yo‘li tosh kasalligi (Nefrolitiaz)',
          code: 'N20.0',
          probability: 91,
          explanation: 'O‘tkir nurlanuvchi bel og‘rig‘i, arterial bosim reaktiv ko‘tarilishi va gematuriya alomatlari.'
        }
      ],
      risk_factors: [
        'Og\'riqli shok xavfi',
        'Gematuriya'
      ],
      recommendations: [
        'Spazmoanalgetik terapiya (Baralgin / Ketorolak)',
        'Buyrak va siydik qopi UTT tekshiruvi',
        'Urologik statsionarga yo\'naltirish'
      ],
      model_name: 'gemini-3.1-flash-lite'
    }
  }
];

class ApiService {
  private token: string | null = localStorage.getItem('doctor_token');

  // Local storage keys
  private STORAGE_KEY_VISITS = 'qishloqmed_visits_v14';
  private STORAGE_KEY_DOCTOR = 'qishloqmed_doctor_profile_v14';

  constructor() {
    this.initLocalStorage();
  }

  private initLocalStorage() {
    if (!localStorage.getItem(this.STORAGE_KEY_VISITS)) {
      localStorage.setItem(this.STORAGE_KEY_VISITS, JSON.stringify(INITIAL_SEED_VISITS));
    }
    if (!localStorage.getItem(this.STORAGE_KEY_DOCTOR)) {
      localStorage.setItem(this.STORAGE_KEY_DOCTOR, JSON.stringify(DEFAULT_DOCTOR_PROFILE));
    }
  }

  // Doctor Profile Management
  getDoctorProfile(): DoctorProfile {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY_DOCTOR);
      return stored ? JSON.parse(stored) : DEFAULT_DOCTOR_PROFILE;
    } catch {
      return DEFAULT_DOCTOR_PROFILE;
    }
  }

  saveDoctorProfile(profile: DoctorProfile) {
    localStorage.setItem(this.STORAGE_KEY_DOCTOR, JSON.stringify(profile));
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('doctor_token', token);
  }

  getToken(): string | null {
    return this.token;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('doctor_token');
  }

  // Local state helper with cross-app nurse data ingestion
  private getLocalVisits(): Visit[] {
    let visits: Visit[] = [];
    try {
      const data = localStorage.getItem(this.STORAGE_KEY_VISITS);
      visits = data ? JSON.parse(data) : [...INITIAL_SEED_VISITS];
    } catch {
      visits = [...INITIAL_SEED_VISITS];
    }

    // Cross-sync: check if nurse-app created visits in local browser storage
    try {
      const nurseData = localStorage.getItem('qm_nurse_visits_v2');
      if (nurseData) {
        const nurseVisits = JSON.parse(nurseData);
        if (Array.isArray(nurseVisits)) {
          const existingIds = new Set(visits.map((v) => v.id));
          for (const nv of nurseVisits) {
            if (!existingIds.has(nv.id)) {
              const detected = detectRegionFromText(
                `${nv.patient?.address || ''} ${nv.patient?.village || ''}`
              );
              const patientReg =
                nv.region ||
                nv.patient?.region ||
                detected.region ||
                'Toshkent viloyati';
              const patientDist =
                nv.district ||
                nv.patient?.district ||
                detected.district ||
                'Bo‘stonliq tumani';

              const mappedVisit: Visit = {
                id: nv.id,
                patient_id: nv.patientId || nv.patient?.id || `pat-${Date.now()}`,
                nurse_id: nv.nurseId || 'nurse-01',
                clinic_id: 1,
                visit_date: nv.visitDate || nv.createdAt || new Date().toISOString(),
                chief_complaint:
                  nv.chiefComplaint ||
                  nv.symptoms?.[0]?.nameUz ||
                  'Birlamchi ko‘rik',
                status: nv.status === 'reviewed' ? 'completed' : 'pending_doctor',
                risk_level:
                  (nv.triageLevel?.toLowerCase() === 'emergency'
                    ? 'critical'
                    : nv.triageLevel?.toLowerCase()) || 'moderate',
                urgency:
                  nv.triageLevel === 'EMERGENCY'
                    ? 3
                    : nv.triageLevel === 'HIGH'
                    ? 2
                    : 1,
                targetSpecialty:
                  nv.targetSpecialty ||
                  'Umumiy amaliyot shifokori (Bosh terapevt)',
                patient_first_name: nv.patient?.firstName || 'Bemor',
                patient_last_name: nv.patient?.lastName || '',
                region: patientReg,
                district: patientDist,
                facility: nv.clinicName || nv.facility || 'Burchmulla FAP №4',
                patient: {
                  id: nv.patient?.id || nv.patientId || `pat-${Date.now()}`,
                  patient_code: nv.patient?.code || 'QM-2026-N',
                  first_name: nv.patient?.firstName || 'Bemor',
                  last_name: nv.patient?.lastName || '',
                  date_of_birth: nv.patient?.birthDate || '1990-01-01',
                  gender: nv.patient?.gender || 'male',
                  phone: nv.patient?.phone || '',
                  region: patientReg,
                  district: patientDist,
                  address: nv.patient?.address || '',
                  village: { id: 1, name: nv.patient?.village || patientDist }
                },
                vital_signs: {
                  systolic_bp: nv.vitals?.systolicBP ?? 120,
                  diastolic_bp: nv.vitals?.diastolicBP ?? 80,
                  pulse: nv.vitals?.pulseRate ?? 72,
                  spo2: nv.vitals?.spo2 ?? 98,
                  temperature: nv.vitals?.temperature ?? 36.6,
                  respiratory_rate: nv.vitals?.respiratoryRate ?? 18,
                  measured_at: nv.createdAt || new Date().toISOString()
                },
                vitals: {
                  systolic_bp: nv.vitals?.systolicBP ?? 120,
                  diastolic_bp: nv.vitals?.diastolicBP ?? 80,
                  pulse: nv.vitals?.pulseRate ?? 72,
                  spo2: nv.vitals?.spo2 ?? 98,
                  temperature: nv.vitals?.temperature ?? 36.6,
                  respiratory_rate: nv.vitals?.respiratoryRate ?? 18,
                  measured_at: nv.createdAt || new Date().toISOString()
                },
                attachments:
                  nv.attachments?.map((a: any) => ({
                    id: a.id,
                    visit_id: nv.id,
                    file_name: a.fileName || 'rasm.jpg',
                    file_url: a.url,
                    file_type: 'image/jpeg',
                    category: a.category || 'other',
                    title: a.title || a.categoryUz || 'Klinik rasm',
                    notes: a.notes || '',
                    created_at: a.capturedAt || new Date().toISOString()
                  })) || []
              };
              visits.unshift(mappedVisit);
            }
          }
        }
      }
    } catch (e) {
      console.warn('Nurse cross-sync check skipped', e);
    }

    return visits;
  }

  private saveLocalVisits(visits: Visit[]) {
    localStorage.setItem(this.STORAGE_KEY_VISITS, JSON.stringify(visits));
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = new Headers(options.headers || {});
    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }
    headers.set('Accept', 'application/json');

    let res = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      const loggedIn = await this.autoLogin();
      if (loggedIn) {
        headers.set('Authorization', `Bearer ${this.token}`);
        res = await fetch(`${API_BASE}${url}`, {
          ...options,
          headers,
        });
      }
    }

    return res;
  }

  async autoLogin(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: '+998909999999',
          password: 'qwert123',
        }),
      });

      if (!res.ok) return false;
      const data = await res.json();
      if (data.access_token) {
        this.setToken(data.access_token);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // Get active queue visits
  async getQueue(): Promise<Visit[]> {
    try {
      const res = await this.fetchWithAuth('/doctor/queue');
      if (res.ok) {
        const backendVisits: Visit[] = await res.json();
        // Merge with local visits so user never loses their locally confirmed actions
        const localVisits = this.getLocalVisits();
        const mergedMap = new Map<string, Visit>();
        localVisits.forEach((v) => mergedMap.set(v.id, v));
        backendVisits.forEach((v) => {
          if (!mergedMap.has(v.id) || mergedMap.get(v.id)?.status === 'submitted') {
            mergedMap.set(v.id, v);
          }
        });
        const all = Array.from(mergedMap.values());
        this.saveLocalVisits(all);
        return all;
      }
    } catch {
      // Backend not available (e.g. static Netlify preview)
    }

    return this.getLocalVisits();
  }

  // Get visit detail
  async getVisitDetail(id: string): Promise<Visit | null> {
    try {
      const res = await this.fetchWithAuth(`/visits/${id}`);
      if (res.ok) {
        const visit: Visit = await res.json();
        if (!visit.attachments || visit.attachments.length === 0) {
          visit.attachments = await this.getAttachments(id);
        }
        return visit;
      }
    } catch {
      // fallback to local
    }

    const local = this.getLocalVisits().find((v) => v.id === id);
    return local || null;
  }

  async getAttachments(visitId: string): Promise<ClinicalAttachment[]> {
    try {
      const res = await this.fetchWithAuth(`/visits/${visitId}/attachments`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    const local = this.getLocalVisits().find((v) => v.id === visitId);
    return local?.attachments || [];
  }

  // Complete consultation, diagnosis and recommendation
  async saveConsultation(
    visitId: string,
    data: {
      icd10_code: string;
      diagnosis_name: string;
      clinical_notes: string;
      treatment_plan: string;
      recommendations: string;
      nurse_instruction?: string;
      prescription_items: PrescriptionItem[];
      referral_facility?: string;
      referral_reason?: string;
    }
  ): Promise<boolean> {
    const doctor = this.getDoctorProfile();

    // 1. Try sending to backend if live
    try {
      const assessmentRes = await this.fetchWithAuth(`/doctor/visits/${visitId}/doctor-assessment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinical_notes: data.clinical_notes,
          treatment_plan: data.treatment_plan,
          recommendations: data.recommendations,
          ai_agreement: true,
        }),
      });

      if (assessmentRes.ok) {
        const assessment = await assessmentRes.json();
        const assessmentId = assessment?.id || visitId;

        // Diagnosis (backend expects diagnosis_text)
        await this.fetchWithAuth(`/doctor/visits/${visitId}/diagnoses?assessment_id=${assessmentId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            icd10_code: data.icd10_code,
            diagnosis_text: data.diagnosis_name,
            diagnosis_type: 'final',
          }),
        });

        // Prescriptions (backend expects medication_name, duration)
        for (const rx of data.prescription_items) {
          await this.fetchWithAuth(`/doctor/visits/${visitId}/prescriptions?assessment_id=${assessmentId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              medication_name: rx.medicine_name,
              dosage: rx.dosage,
              frequency: rx.frequency || rx.dosage,
              duration: rx.duration_days,
              instructions: rx.instructions || rx.dosage,
            }),
          });
        }

        // Nurse instruction
        if (data.nurse_instruction) {
          await this.fetchWithAuth(`/doctor/visits/${visitId}/message-nurse`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: data.nurse_instruction }),
          });
        }

        // Hospital referral if requested
        if (data.referral_facility) {
          await this.fetchWithAuth(`/doctor/visits/${visitId}/referral?assessment_id=${assessmentId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              referred_to: data.referral_facility,
              referral_reason: data.referral_reason || 'Ixtisoslashgan statsionar ko\'rik',
              urgency: 'high',
              referral_date: new Date().toISOString().split('T')[0],
            }),
          });
        }

        // Complete status
        await this.fetchWithAuth(`/visits/${visitId}/status?visit_status=completed`, { method: 'PUT' });
      }
    } catch {
      // Backend not running, proceed to local persistence
    }

    // 2. Persist in local storage for instant offline/Netlify update
    const visits = this.getLocalVisits();
    const targetIdx = visits.findIndex((v) => v.id === visitId);

    const docAssessment: DoctorAssessment = {
      doctor_id: doctor.id,
      doctor_name: doctor.fullName,
      doctor_specialty: doctor.specialty,
      icd10_code: data.icd10_code,
      diagnosis_name: data.diagnosis_name,
      clinical_notes: data.clinical_notes,
      treatment_plan: data.treatment_plan,
      recommendations: data.recommendations,
      nurse_instructions: data.nurse_instruction,
      prescriptions: data.prescription_items,
      completed_at: new Date().toISOString(),
    };

    if (targetIdx !== -1) {
      visits[targetIdx] = {
        ...visits[targetIdx],
        status: 'completed',
        icd10_code: data.icd10_code,
        diagnosis_name: data.diagnosis_name,
        doctor_recommendation: data.recommendations,
        prescriptions: data.prescription_items,
        doctor_assessment: docAssessment,
        serviced_at: new Date().toISOString(),
      };
      this.saveLocalVisits(visits);
    }

    return true;
  }

  // Pre-seeded rural pharmacies
  async getPharmacies(): Promise<Pharmacy[]> {
    return [
      {
        id: 1,
        name: "Bog'iston Markaziy Aptekasi",
        village_name: "Bog'iston QFY",
        address: "Ibn Sino ko'chasi, 12-uy",
        phone: "+998 90 123-45-67",
        is_duty_24_7: true,
        distance_km: 1.2,
        medicines: [
          { id: 1, medicine_name: "Paratsetamol 500mg", stock: 120, price: 4500, unit: "quti" },
          { id: 2, medicine_name: "Amoksitsillin 500mg", stock: 45, price: 18000, unit: "quti" },
          { id: 3, medicine_name: "Enalapril 10mg", stock: 80, price: 12500, unit: "quti" },
          { id: 4, medicine_name: "Aspirin Kardio 100mg", stock: 95, price: 16000, unit: "quti" },
          { id: 5, medicine_name: "Magnisiy sulfat 25% 10ml", stock: 60, price: 9000, unit: "ampula" },
          { id: 6, medicine_name: "Deksametazon 4mg", stock: 35, price: 14000, unit: "ampula" },
        ]
      },
      {
        id: 2,
        name: "Oltinsoy Tuman Navbatchi Dorixonasi",
        village_name: "Oltinsoy markazi",
        address: "Mustaqillik shoh ko'chasi, 45",
        phone: "+998 93 456-78-90",
        is_duty_24_7: true,
        distance_km: 4.8,
        medicines: [
          { id: 7, medicine_name: "Nitroglitserin 0.5mg", stock: 25, price: 8000, unit: "quti" },
          { id: 8, medicine_name: "Azitromitsin 500mg", stock: 50, price: 26000, unit: "quti" },
          { id: 9, medicine_name: "Kaptopril 25mg", stock: 110, price: 9500, unit: "quti" },
          { id: 10, medicine_name: "Salbutamol aerozol", stock: 18, price: 32000, unit: "flakon" },
        ]
      },
      {
        id: 3,
        name: "Chorbog' Qishloq Shoxobchasi",
        village_name: "Chorbog' qishlog'i",
        address: "Tinchlik ko'chasi, 3",
        phone: "+998 97 789-01-23",
        is_duty_24_7: false,
        distance_km: 6.5,
        medicines: [
          { id: 11, medicine_name: "Ibuprofen 400mg", stock: 70, price: 11000, unit: "quti" },
          { id: 12, medicine_name: "Suprastin 25mg", stock: 40, price: 15000, unit: "quti" },
        ]
      }
    ];
  }
}

export const api = new ApiService();



