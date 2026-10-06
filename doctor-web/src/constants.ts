import {
  Stethoscope,
  Heart,
  Baby,
  Sparkles,
  Brain,
  Activity,
  type LucideIcon,
} from 'lucide-react';

export interface MedicalSpecialtyItem {
  code: string;
  name: string;
  description: string;
  icon: LucideIcon;
  badgeColor: string;
}

export const MEDICAL_SPECIALTIES: MedicalSpecialtyItem[] = [
  {
    code: 'general_physician',
    name: 'Umumiy amaliyot shifokori (Bosh terapevt)',
    description: 'Qishloq aholisi umumiy salomatligi, terapiya va triaj nazorati',
    icon: Stethoscope,
    badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
  },
  {
    code: 'cardiologist',
    name: 'Kardiolog (Yurak qon-tomir mutaxassisi)',
    description: 'EKG tahlili, gipertoniya, stenokardiya, yurak ishemik kasalliklari',
    icon: Heart,
    badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
  },
  {
    code: 'pediatrician',
    name: 'Pediatr (Bolalar shifokori)',
    description: 'Chaqaloqlar, bolalar yuqumli va nafas yo\'llari kasalliklari',
    icon: Baby,
    badgeColor: 'bg-sky-50 text-sky-800 border-sky-200',
  },
  {
    code: 'dermatologist',
    name: 'Dermatolog (Teri-tanosil shifokori)',
    description: 'Teri toshmalari, allergik dermatozlar, yara va infeksiyalar',
    icon: Sparkles,
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  {
    code: 'neurologist',
    name: 'Nevropatolog (Asab tizimi kasalliklari)',
    description: 'Surunkali bosh og\'riqlar, insult oqibatlari, neyropatiyalar',
    icon: Brain,
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
  },
  {
    code: 'pulmonologist',
    name: 'Pulmonolog (Nafas yo\'llari mutaxassisi)',
    description: 'O\'tkir va surunkali pnevmoniya, bronxit, astma va gipoksiya',
    icon: Activity,
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
  },
];

/**
 * Pure helper for age calculation from date of birth string
 */
export function calculateAge(dobStr?: string): number | null {
  if (!dobStr) return null;
  const birthDate = new Date(dobStr);
  if (isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}
