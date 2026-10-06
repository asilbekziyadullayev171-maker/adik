import { Patient, Visit, NurseProfile, SymptomEntry } from '../types';

export const CURRENT_NURSE: NurseProfile = {
  id: 'usr-nurse-01',
  fullName: 'Karimova Nilufar Erkinovna',
  badgeNumber: 'FAP-2041',
  role: 'Katta hamshira / Feldshher',
  phone: '+998 90 123 45 67',
  assignedFacility: {
    name: 'Burchmulla oilaviy shifokorlik punkti (FAP №4)',
    type: 'Birlamchi tibbiy-sanitariya punkti',
    district: 'Bo‘stonliq tumani',
    region: 'Toshkent viloyati',
    catchmentVillages: ['Burchmulla qishlog‘i', 'Yangiqo‘rg‘on', 'Soyliq'],
    populationServed: 1840,
  },
  assignedReferralHospital: {
    name: 'Bo‘stonliq tuman markaziy shifoxonasi (KTMP)',
    emergencyPhone: '103 / +998 71 200 01 03',
    onDutyDoctorGroup: 'Navbatchi shoshilinch terapevtik guruh',
  },
  stats: {
    todayVisits: 7,
    monthVisits: 114,
    pendingReviews: 3,
    emergencyCasesMonth: 2,
  },
  isOnline: true,
  lastSyncAt: 'Bugun, 20:45',
};

export const MOCK_PATIENTS: Patient[] = [];

export const MOCK_VISITS: Visit[] = [];

export const COMMON_SYMPTOMS_LIBRARY = [
  {
    category: 'Yurak-qon tomir tizimi',
    symptoms: [
      { code: 'chest_pain', nameUz: 'Ko‘krak qafasi / to‘sh orti og‘rig‘i', isRedFlagCandidate: true },
      { code: 'palpitations', nameUz: 'Yurak urib ketishi (taxikardiya / aritmiya)', isRedFlagCandidate: false },
      { code: 'syncope', nameUz: 'Hushdan ketish yoki hush xiralashishi', isRedFlagCandidate: true },
      { code: 'edema_legs', nameUz: 'Oyoqlarda shish paydo bo‘lishi', isRedFlagCandidate: false },
    ],
  },
  {
    category: 'Nafas olish tizimi',
    symptoms: [
      { code: 'cough', nameUz: 'Yo‘tal (quruq yoki balg‘amli)', isRedFlagCandidate: false },
      { code: 'dyspnea', nameUz: 'Nafas qisishi / bo‘g‘ilish hissi', isRedFlagCandidate: true },
      { code: 'hemoptysis', nameUz: 'Qon tupurish (balg‘amda qon)', isRedFlagCandidate: true },
      { code: 'wheezing', nameUz: 'Nafasda xirillash yoki hushtak ovozi', isRedFlagCandidate: false },
    ],
  },
  {
    category: 'Oshqozon-ichak tizimi',
    symptoms: [
      { code: 'abdominal_pain', nameUz: 'Qorindagi o‘tkir yoki sanchiq og‘riq', isRedFlagCandidate: true },
      { code: 'nausea_vomiting', nameUz: 'Ko‘ngil aynishi va to‘xtovsiz qayt qilish', isRedFlagCandidate: false },
      { code: 'diarrhea', nameUz: 'Ich ketishi (diareya, suvsizlanish bilan)', isRedFlagCandidate: false },
      { code: 'melena', nameUz: 'Qora rangli najas (oshqozon qonashi shubhasi)', isRedFlagCandidate: true },
    ],
  },
  {
    category: 'Asab tizimi va Bosh',
    symptoms: [
      { code: 'severe_headache', nameUz: 'To‘satdan boshlangan o‘ta kuchli bosh og‘rig‘i', isRedFlagCandidate: true },
      { code: 'dizziness', nameUz: 'Bosh aylanishi va muvozanat yo‘qolishi', isRedFlagCandidate: false },
      { code: 'facial_asymmetry', nameUz: 'Yuz assimetriyasi yoki nutq buzilishi (insult)', isRedFlagCandidate: true },
      { code: 'limb_weakness', nameUz: 'Qo‘l yoki oyoqda to‘satdan kuchsizlik', isRedFlagCandidate: true },
    ],
  },
  {
    category: 'Umumiy va Infeksion',
    symptoms: [
      { code: 'high_fever', nameUz: 'Yuqori tana harorati (38.5 °C dan yuqori)', isRedFlagCandidate: false },
      { code: 'chills', nameUz: 'Titroq va qaltirash', isRedFlagCandidate: false },
      { code: 'general_weakness', nameUz: 'Umumiy og‘ir holsizlik va lanjlik', isRedFlagCandidate: false },
      { code: 'rash', nameUz: 'Terida tez tarqaluvchi toshmalar', isRedFlagCandidate: false },
    ],
  },
];


