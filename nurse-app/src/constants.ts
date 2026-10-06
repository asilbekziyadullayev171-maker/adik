export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface MedicalSpecialtyItem {
  code: string;
  name: string;
  shortName: string;
  description: string;
}

export const MEDICAL_SPECIALTIES: MedicalSpecialtyItem[] = [
  {
    code: 'general_physician',
    name: 'Umumiy amaliyot shifokori (Bosh terapevt)',
    shortName: 'Bosh terapevt',
    description: 'Qishloq aholisi umumiy salomatligi, terapiya va triaj nazorati',
  },
  {
    code: 'cardiologist',
    name: 'Kardiolog (Yurak qon-tomir mutaxassisi)',
    shortName: 'Kardiolog',
    description: 'EKG tahlili, gipertoniya, stenokardiya, yurak ishemik kasalliklari',
  },
  {
    code: 'pediatrician',
    name: 'Pediatr (Bolalar shifokori)',
    shortName: 'Pediatr',
    description: 'Chaqaloqlar, bolalar yuqumli va nafas yo\'llari kasalliklari',
  },
  {
    code: 'dermatologist',
    name: 'Dermatolog (Teri-tanosil shifokori)',
    shortName: 'Dermatolog',
    description: 'Teri toshmalari, allergik dermatozlar, yara va infeksiyalar',
  },
  {
    code: 'neurologist',
    name: 'Nevropatolog (Asab tizimi kasalliklari)',
    shortName: 'Nevropatolog',
    description: 'Surunkali bosh og\'riqlar, insult oqibatlari, neyropatiyalar',
  },
  {
    code: 'pulmonologist',
    name: 'Pulmonolog (Nafas yo\'llari mutaxassisi)',
    shortName: 'Pulmonolog',
    description: 'O\'tkir va surunkali pnevmoniya, bronxit, astma va gipoksiya',
  },
];
