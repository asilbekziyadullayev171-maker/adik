import { VitalSigns, SymptomEntry, RedFlagAlert, AIAssessment, TriageLevel, PotentialCondition } from '../types';

export interface VitalsValidationResult {
  isValid: boolean;
  errors: { field: string; messageUz: string }[];
  warnings: { field: string; messageUz: string; severity: 'warning' | 'critical' }[];
}

export function validateAndEvaluateVitals(vitals: Partial<VitalSigns>): VitalsValidationResult {
  const errors: { field: string; messageUz: string }[] = [];
  const warnings: { field: string; messageUz: string; severity: 'warning' | 'critical' }[] = [];

  const { systolicBP, diastolicBP, pulseRate, temperature, spo2, respiratoryRate } = vitals;

  // 1. Hard Range & Logical Errors
  if (systolicBP !== undefined && diastolicBP !== undefined) {
    if (systolicBP <= diastolicBP) {
      errors.push({
        field: 'systolicBP',
        messageUz: 'Sistolik bosim diastolik bosimdan yuqori bo‘lishi shart.',
      });
    }
  }

  if (systolicBP !== undefined && (systolicBP < 40 || systolicBP > 300)) {
    errors.push({
      field: 'systolicBP',
      messageUz: 'Sistolik bosim fizik ko‘rsatkichdan tashqarida (40-300 mmHg).',
    });
  }

  if (diastolicBP !== undefined && (diastolicBP < 20 || diastolicBP > 200)) {
    errors.push({
      field: 'diastolicBP',
      messageUz: 'Diastolik bosim fizik ko‘rsatkichdan tashqarida (20-200 mmHg).',
    });
  }

  if (pulseRate !== undefined && (pulseRate < 25 || pulseRate > 250)) {
    errors.push({
      field: 'pulseRate',
      messageUz: 'Yurak urishi fizik ko‘rsatkichdan tashqarida (25-250 /daq).',
    });
  }

  if (temperature !== undefined && (temperature < 30.0 || temperature > 44.0)) {
    errors.push({
      field: 'temperature',
      messageUz: 'Tana harorati fizik ko‘rsatkichdan tashqarida (30.0-44.0 °C).',
    });
  }

  if (spo2 !== undefined && (spo2 < 50 || spo2 > 100)) {
    errors.push({
      field: 'spo2',
      messageUz: 'SpO2 50% dan 100% gacha bo‘lishi shart.',
    });
  }

  // 2. Clinical Warnings
  if (systolicBP !== undefined) {
    if (systolicBP >= 180) {
      warnings.push({
        field: 'systolicBP',
        messageUz: 'Sistolik bosim keskin yuqori (≥ 180 mmHg) — Gipertenziv kriz xavfi.',
        severity: 'critical',
      });
    } else if (systolicBP < 90) {
      warnings.push({
        field: 'systolicBP',
        messageUz: 'Sistolik bosim me’yordan past (< 90 mmHg) — Gipotenziya / Kollaps xavfi.',
        severity: 'critical',
      });
    } else if (systolicBP > 140) {
      warnings.push({
        field: 'systolicBP',
        messageUz: 'Sistolik bosim ko‘tarilgan (> 140 mmHg) — Arterial gipertenziya.',
        severity: 'warning',
      });
    }
  }

  if (pulseRate !== undefined) {
    if (pulseRate > 120) {
      warnings.push({
        field: 'pulseRate',
        messageUz: 'YaQQ taxikardiya (> 120 /daq).',
        severity: 'critical',
      });
    } else if (pulseRate < 50) {
      warnings.push({
        field: 'pulseRate',
        messageUz: 'Bradikardiya (< 50 /daq).',
        severity: 'critical',
      });
    }
  }

  if (spo2 !== undefined) {
    if (spo2 < 90) {
      warnings.push({
        field: 'spo2',
        messageUz: 'Og‘ir gipoksiya (SpO2 < 90%) — Shoshilinch kislorod talab etiladi.',
        severity: 'critical',
      });
    } else if (spo2 < 95) {
      warnings.push({
        field: 'spo2',
        messageUz: 'Gipoksiya alomati (SpO2 90-94%).',
        severity: 'warning',
      });
    }
  }

  if (temperature !== undefined) {
    if (temperature >= 39.5) {
      warnings.push({
        field: 'temperature',
        messageUz: 'Yuqori febril harorat (≥ 39.5 °C).',
        severity: 'critical',
      });
    } else if (temperature < 35.0) {
      warnings.push({
        field: 'temperature',
        messageUz: 'Gipotermiya (< 35.0 °C).',
        severity: 'critical',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function detectRedFlags(
  vitals: Partial<VitalSigns>,
  symptoms: SymptomEntry[],
  anamnesis: Record<string, string>
): RedFlagAlert[] {
  const flags: RedFlagAlert[] = [];

  const hasSymptom = (code: string) => symptoms.some((s) => s.code === code);

  // RF-001: Severe hypotension
  if (vitals.systolicBP !== undefined && vitals.systolicBP < 80) {
    flags.push({
      id: 'rf-001',
      code: 'RF-001',
      titleUz: 'O‘tkir kollaps / Qon aylanishi shoki (AQB < 80 mmHg)',
      severity: 'EMERGENCY',
      descriptionUz: `Sistolik bosim kritik darajada past (${vitals.systolicBP} mmHg). Gipovolemik yoki kardiogen shok xavfi mavjud.`,
      protocolUz: 'Bemorni gorizontal yotqizish, oyoqlarini 30 gradusga ko‘tarish, infuzion terapiya tayyorlash va zudlik bilan reanimatsiya chaqirish.',
    });
  }

  // RF-002: Hypertensive emergency
  if (
    (vitals.systolicBP !== undefined && vitals.systolicBP >= 200) ||
    (vitals.diastolicBP !== undefined && vitals.diastolicBP >= 120)
  ) {
    flags.push({
      id: 'rf-002',
      code: 'RF-002',
      titleUz: 'Asoratlangan gipertenziv kriz (AQB ≥ 200/120 mmHg)',
      severity: 'EMERGENCY',
      descriptionUz: `Qon bosimi kritik darajada yuqori (${vitals.systolicBP || '--'}/${vitals.diastolicBP || '--'} mmHg). Bosh miyaga qon quyilishi (insult) yoki o‘tkir chap qorincha yetishmovchiligi xavfi.`,
      protocolUz: 'Tezkor gipotenziv terapiya, bemorga yarim o‘tirgan holat berish, shoshilinch tez tibbiy yordamni jalb etish.',
    });
  }

  // RF-005: Severe Hypoxia
  if (vitals.spo2 !== undefined && vitals.spo2 < 85) {
    flags.push({
      id: 'rf-005',
      code: 'RF-005',
      titleUz: 'Og‘ir darajadagi gipoksemiya (SpO2 < 85%)',
      severity: 'EMERGENCY',
      descriptionUz: `Qonning kislorod bilan to‘yinish darajasi kritik pasaygan (${vitals.spo2}%). Nafas yetishmovchiligi.`,
      protocolUz: 'Zudlik bilan kislorod maskasi orqali nafas oldirish (O2 terapiya 4-6 l/daq).',
    });
  }

  // RF-008 & RF-009: Cardiac Red Flags
  const isChestPain = hasSymptom('chest_pain');
  const radiation = anamnesis['cp_radiation'];
  if (isChestPain && radiation && radiation.toLowerCase().includes('chap')) {
    flags.push({
      id: 'rf-008',
      code: 'RF-008',
      titleUz: 'O‘tkir koronar sindrom / Miokard infarkti alomatlari',
      severity: 'EMERGENCY',
      descriptionUz: 'To‘sh ortidagi siquvchi og‘riq chap qo‘l, yelka yoki jag‘ga tarqalmoqda.',
      protocolUz: 'Qat’iy jismoniy va psixologik tinchlik, nitroglitserin (qarshi ko‘rsatma bo‘lmasa), EKG yozib olish va kardioreanimatsiya brigadasini chaqirish.',
    });
  }

  // RF-010: Thunderclap Headache / Neurological
  if (hasSymptom('severe_headache') && symptoms.some((s) => s.code === 'severe_headache' && s.onset === 'sudden')) {
    flags.push({
      id: 'rf-010',
      code: 'RF-010',
      titleUz: 'O‘tkir serebrovaskulyar patologiya / Subaraxnoidal qon quyilishi',
      severity: 'EMERGENCY',
      descriptionUz: 'To‘satdan yuzaga kelgan "momaqaldiroqsimon" eng kuchli bosh og‘rig‘i.',
      protocolUz: 'Bosh miya insulti protokoli bo‘yicha nevrologik tekshiruv, boshni 30 gradus ko‘tarish, neyroxirurgik tekshiruvga shoshilinch yuborish.',
    });
  }

  // Acute Abdomen
  if (hasSymptom('abdominal_pain') && anamnesis['rebound_tenderness']?.toLowerCase().includes('musbat')) {
    flags.push({
      id: 'rf-016',
      code: 'RF-016',
      titleUz: 'O‘tkir qorin sindromi (Peritonit / O‘tkir jarrohlik patologiyasi)',
      severity: 'EMERGENCY',
      descriptionUz: 'Qorin pardasi ta’sirlanish belgilari (Shchetkin-Blyumberg musbat).',
      protocolUz: 'Og‘riqsizlantiruvchi vositalar berilmasin! Zudlik bilan xirurgik statsionarga yuborish.',
    });
  }

  return flags;
}

export function generateTriageAssessment(
  vitals: Partial<VitalSigns>,
  symptoms: SymptomEntry[],
  redFlags: RedFlagAlert[],
  patientAge?: number
): AIAssessment {
  const conditions: PotentialCondition[] = [];
  const riskFactors: { factorUz: string; value: string; impact: 'yuqori' | 'o‘rta' | 'past'; explanationUz: string }[] = [];
  const missingData: { fieldUz: string; importance: 'yuqori' | 'o‘rta'; reasonUz: string }[] = [];
  let suggestedSpecialty = 'Umumiy amaliyot shifokori (Bosh terapevt)';
  let doctorRecommendationUz = 'Rejali tartibda ambulator maslahat va diagnostika tavsiya etiladi.';

  const hasSymptom = (code: string) => symptoms.some((s) => s.code === code);
  const isEmergency = redFlags.some((f) => f.severity === 'EMERGENCY');

  let calculatedScore = isEmergency ? 0.85 : 0.15;

  // 1. Evaluate Vitals
  if (vitals.systolicBP !== undefined) {
    if (vitals.systolicBP >= 180 || (vitals.diastolicBP !== undefined && vitals.diastolicBP >= 110)) {
      calculatedScore += 0.35;
      riskFactors.push({
        factorUz: 'Xavfli yuqori qon bosimi',
        value: `${vitals.systolicBP}/${vitals.diastolicBP || '--'} mmHg`,
        impact: 'yuqori',
        explanationUz: 'Gipertenziv kriz, miyaga qon quyilishi (insult) yoki o‘tkir yurak yetishmovchiligi xavfi.',
      });
      conditions.push({
        condition: 'Hypertensive Crisis / Encephalopathy',
        conditionUz: 'Asoratlangan gipertenziv kriz / Bosh miya insulti xavfi',
        likelihood: 'yuqori ehtimol',
        icd10: 'I10',
        clinicalReasoningUz: 'Qon bosimining keskin oshishi nishon a’zolar (bosh miya, yurak, buyrak) zararlanishiga olib kelishi mumkin.',
      });
      suggestedSpecialty = 'Kardiolog (Yurak qon-tomir mutaxassisi)';
    } else if (vitals.systolicBP > 140) {
      calculatedScore += 0.15;
      riskFactors.push({
        factorUz: 'Arterial gipertoniya',
        value: `${vitals.systolicBP}/${vitals.diastolicBP || '--'} mmHg`,
        impact: 'o‘rta',
        explanationUz: 'Qon bosimining ko‘tarilishi kardiak yuklamani oshiradi.',
      });
      conditions.push({
        condition: 'Arterial Hypertension',
        conditionUz: 'Arterial gipertoniya (II-III daraja)',
        likelihood: 'yuqori ehtimol',
        icd10: 'I10',
        clinicalReasoningUz: 'Muntazam gipotenziv terapiya va doimiy monitoring talab etiladi.',
      });
    } else if (vitals.systolicBP < 90) {
      calculatedScore += 0.35;
      riskFactors.push({
        factorUz: 'Gipotenziya / Kollaps',
        value: `${vitals.systolicBP}/${vitals.diastolicBP || '--'} mmHg`,
        impact: 'yuqori',
        explanationUz: 'Gemodinamik yetishmovchilik, gipovolemiya yoki shok holati belgisi.',
      });
      conditions.push({
        condition: 'Hypotension / Circulatory Collapse',
        conditionUz: 'O‘tkir arterial gipotenziya / Qon aylanishi shoki xavfi',
        likelihood: 'yuqori ehtimol',
        icd10: 'I95.9',
        clinicalReasoningUz: 'Qon bosimi kritik pastligi sababli periferik va markaziy perfuziya buzilishi.',
      });
    }
  }

  if (vitals.spo2 !== undefined) {
    if (vitals.spo2 < 90) {
      calculatedScore += 0.4;
      riskFactors.push({
        factorUz: 'Og‘ir gipoksemiya',
        value: `${vitals.spo2} %`,
        impact: 'yuqori',
        explanationUz: 'Hayot uchun xavfli gipoksiya. Zudlik bilan kislorod talab etiladi.',
      });
      missingData.push({
        fieldUz: 'Ko‘krak qafasi rentgeni va arterial gazlar tahlili',
        importance: 'yuqori',
        reasonUz: 'Gipoksiya etiologiyasini (pnevmoniya, o‘pka shishi) aniqlash uchun.',
      });
    } else if (vitals.spo2 < 95) {
      calculatedScore += 0.2;
      riskFactors.push({
        factorUz: 'Kislorod to‘yinishi pasaygan',
        value: `${vitals.spo2} %`,
        impact: 'o‘rta',
        explanationUz: 'Nafas yetishmovchiligi yoki o‘pka shamollashi belgisi.',
      });
    }
  }

  if (vitals.pulseRate !== undefined) {
    if (vitals.pulseRate > 120) {
      calculatedScore += 0.25;
      riskFactors.push({
        factorUz: 'YaQQ taxikardiya',
        value: `${vitals.pulseRate} /daq`,
        impact: 'yuqori',
        explanationUz: 'Yurakning tez urishi intoksikatsiya, isitma, qon ketishi yoki paroksizmal aritmiya asorati.',
      });
      conditions.push({
        condition: 'Paroxysmal Tachycardia / Cardiac Arrhythmia',
        conditionUz: 'Yurak ritmi buzilishi (Paroksizmal taxikardiya / Aritmiya)',
        likelihood: 'yuqori ehtimol',
        icd10: 'I47.9',
        clinicalReasoningUz: 'Taxikardiya kardiogen yoki metabolik buzilishlar oqibatida yuzaga kelishi mumkin.',
      });
    } else if (vitals.pulseRate < 50) {
      calculatedScore += 0.25;
      riskFactors.push({
        factorUz: 'Kritik bradikardiya',
        value: `${vitals.pulseRate} /daq`,
        impact: 'yuqori',
        explanationUz: 'Yurak o‘tkazuvchanligi blokadasi yoki sinus tuguni disfunksiyasi.',
      });
      conditions.push({
        condition: 'Sinus Bradycardia / Atrioventricular Block',
        conditionUz: 'Sinusli bradikardiya / AV blokada xavfi',
        likelihood: 'yuqori ehtimol',
        icd10: 'I44.2',
        clinicalReasoningUz: 'Kam puls kardiak sinkopa (hushdan ketish) xavfini keltirib chiqaradi.',
      });
    }
  }

  if (vitals.temperature !== undefined && vitals.temperature >= 38.0) {
    calculatedScore += 0.2;
    riskFactors.push({
      factorUz: 'Febril harorat',
      value: `${vitals.temperature} °C`,
      impact: 'o‘rta',
      explanationUz: 'O‘tkir yallig‘lanish yoki bakterial/virusli infeksiya jarayoni.',
    });
    missingData.push({
      fieldUz: 'Klinik umumiy qon tahlili (UQT) va C-reaktiv oqsil',
      importance: 'yuqori',
      reasonUz: 'Bakterial yoki virusli infeksiya differensatsiyasi uchun.',
    });
  }

  if (patientAge && patientAge > 65) {
    calculatedScore += 0.1;
    riskFactors.push({
      factorUz: 'Geriatrik yosh omili',
      value: `${patientAge} yosh`,
      impact: 'o‘rta',
      explanationUz: 'Katta yoshli bemorlarda yondosh surunkali kasalliklar asorati yuqori bo‘ladi.',
    });
  }

  // 2. Specific Symptom Clusters & Disease Matching
  // CARDIAC
  if (hasSymptom('chest_pain')) {
    calculatedScore += 0.45;
    const isRadiating = isEmergency || (vitals.systolicBP && vitals.systolicBP >= 140);
    conditions.unshift({
      condition: isRadiating ? 'Acute Coronary Syndrome / Myocardial Infarction' : 'Angina Pectoris',
      conditionUz: isRadiating ? 'O‘tkir koronar sindrom / Miokard infarkti ehtimoli' : 'Stenokardiya xuruji / Yurak ishemiyasi',
      likelihood: 'yuqori ehtimol',
      icd10: isRadiating ? 'I21.9' : 'I20.9',
      clinicalReasoningUz: 'To‘sh orti og‘rig‘i kardiak ishemiyaning klassik belgisi bo‘lib, EKG va troponin tahlili talab qiladi.',
    });
    suggestedSpecialty = 'Kardiolog (Yurak qon-tomir mutaxassisi)';
    doctorRecommendationUz = 'Zudlik bilan EKG olinishi, aspirin/nitroglitserin qo‘llanishi va kardiolog ko‘rigi zarur.';
    missingData.push({
      fieldUz: '12 tarmoqli EKG va Troponin I/T ekspress-testi',
      importance: 'yuqori',
      reasonUz: 'Miokard infarkti va ST segmenti o‘zgarishlarini inkor qilish uchun.',
    });
  }

  // NEUROLOGICAL (STROKE)
  if (hasSymptom('facial_asymmetry') || hasSymptom('limb_weakness') || (hasSymptom('severe_headache') && vitals.systolicBP && vitals.systolicBP >= 170)) {
    calculatedScore += 0.55;
    conditions.unshift({
      condition: 'Acute Ischemic / Hemorrhagic Stroke',
      conditionUz: 'Bosh miya qon aylanishining o‘tkir buzilishi (Insult / TIA)',
      likelihood: 'yuqori ehtimol',
      icd10: 'I63.9',
      clinicalReasoningUz: 'Yuz assimetriyasi, oyoq-qo‘llarda kuchsizlik yoki keskin gipertenziya fonidagi bosh og‘rig‘i insult belgisi.',
    });
    suggestedSpecialty = 'Nevropatolog (Asab tizimi kasalliklari)';
    doctorRecommendationUz = 'Bemorni "terapevtik darcha" (4.5 soat) davrida zudlik bilan KT/MRT markaziga yetkazish zarur.';
    missingData.push({
      fieldUz: 'Bosh miya Kompyuter Tomografiyasi (KT)',
      importance: 'yuqori',
      reasonUz: 'Qon quyilishi (gemorragik) yoki ishemiyani ajratish uchun.',
    });
  }

  // RESPIRATORY
  if (hasSymptom('cough') || hasSymptom('dyspnea') || hasSymptom('wheezing')) {
    calculatedScore += 0.3;
    const isPneumonia = (vitals.temperature && vitals.temperature >= 38.0) || (vitals.spo2 && vitals.spo2 < 94);
    conditions.push({
      condition: isPneumonia ? 'Pneumonia / Lower Respiratory Tract Infection' : 'Acute Bronchitis / Asthma Exacerbation',
      conditionUz: isPneumonia ? 'Zotiljam (Pnevmoniya) / O‘tkir nafas yetishmovchiligi' : 'O‘tkir bronxit / Bronxial astma xuruji',
      likelihood: isPneumonia ? 'yuqori ehtimol' : 'o‘rta ehtimol',
      icd10: isPneumonia ? 'J18.9' : 'J20.9',
      clinicalReasoningUz: 'Yo‘tal, nafas qisishi va gipoksiya fonida nafas yo‘llari yallig‘lanishi yoki bronxoobstruksiya.',
    });
    if (suggestedSpecialty.includes('terapevt') || suggestedSpecialty.includes('Terapevt')) {
      suggestedSpecialty = 'Pulmonolog (Nafas yo‘llari mutaxassisi)';
    }
    missingData.push({
      fieldUz: 'Ko‘krak qafasi rentgenogrammasi / Auskultatsiya',
      importance: 'o‘rta',
      reasonUz: 'O‘pkadagi infiltrativ o‘zgarishlarni va xirillashlarni aniqlash.',
    });
  }

  // SURGICAL ABDOMEN & GI
  if (hasSymptom('abdominal_pain')) {
    calculatedScore += 0.4;
    conditions.push({
      condition: 'Acute Abdomen / Appendicitis / Cholecystitis',
      conditionUz: 'O‘tkir qorin sindromi (O‘tkir appenditsit / Xoletsistit)',
      likelihood: 'yuqori ehtimol',
      icd10: 'K35.8',
      clinicalReasoningUz: 'Qorindagi o‘tkir og‘riq shoshilinch xirurgik ko‘rik va UTT (UZI) talab qiladi. Analgetiklar berilmasin.',
    });
    doctorRecommendationUz = 'Zudlik bilan jarroh ko‘rigi va qorin bo‘shlig‘i ultratovush tekshiruvi (UZI) tavsiya etiladi.';
    missingData.push({
      fieldUz: 'Qorin bo‘shlig‘i a’zolari UTT (UZI) va Leykotsitoz tekshiruvi',
      importance: 'yuqori',
      reasonUz: 'O‘tkir appenditsit, xoletsistit yoki ichak tutilishini tasdiqlash uchun.',
    });
  }

  // GI BLEEDING
  if (hasSymptom('melena')) {
    calculatedScore += 0.5;
    conditions.unshift({
      condition: 'Gastrointestinal Bleeding',
      conditionUz: 'Oshqozon-ichak traktidan o‘tkir qon ketish xavfi',
      likelihood: 'yuqori ehtimol',
      icd10: 'K92.2',
      clinicalReasoningUz: 'Qora qatronsimon najas (melena) oshqozon yoki 12-barmoq ichak yarasidan qonash belgisi.',
    });
    doctorRecommendationUz = 'Shoshilinch statsionarga yuborilsin, EGD (gastroskopiya) o‘tkazilsin.';
  }

  // DERMATOLOGY
  if (hasSymptom('skin_rash') || hasSymptom('rash') || hasSymptom('itching')) {
    calculatedScore += 0.2;
    conditions.push({
      condition: 'Dermatitis / Skin Pathology',
      conditionUz: 'Dermatologik o‘zgarishlar / Teri toshmalari',
      likelihood: 'o‘rta ehtimol',
      icd10: 'L30.9',
      clinicalReasoningUz: 'Teri toshmalari va qichishish dermatologik differensatsiyani talab qiladi.',
    });
    if (suggestedSpecialty.includes('terapevt') || suggestedSpecialty.includes('Terapevt')) {
      suggestedSpecialty = 'Dermatolog (Teri-tanosil shifokori)';
    }
  }

  // PEDIATRICS
  if (patientAge !== undefined && patientAge < 18) {
    if (suggestedSpecialty.includes('terapevt') || suggestedSpecialty.includes('Terapevt')) {
      suggestedSpecialty = 'Pediatr (Bolalar shifokori)';
    }
  }

  // GASTROENTERITIS & DEHYDRATION
  if (hasSymptom('diarrhea') || hasSymptom('nausea_vomiting')) {
    calculatedScore += 0.2;
    conditions.push({
      condition: 'Acute Gastroenteritis / Dehydration',
      conditionUz: 'O‘tkir gastroenterit / Suvsizlanish (Eksikoz)',
      likelihood: 'o‘rta ehtimol',
      icd10: 'A09',
      clinicalReasoningUz: 'Ko‘ngil aynishi, qayt qilish va ich ketishi organizm suvsizlanishiga sabab bo‘ladi.',
    });
    missingData.push({
      fieldUz: 'Elektrolitlar (K+, Na+) va najas tahlili',
      importance: 'o‘rta',
      reasonUz: 'Suv-tuz balansi buzilishini va ichak infeksiyasini aniqlash uchun.',
    });
  }

  // SYNCOPE / FAINTING
  if (hasSymptom('syncope')) {
    calculatedScore += 0.35;
    conditions.push({
      condition: 'Syncope / Orthostatic Collapse',
      conditionUz: 'Hushdan ketish sindromi / Kardiogen yoki vazovagal kollaps',
      likelihood: 'yuqori ehtimol',
      icd10: 'R55',
      clinicalReasoningUz: 'Qisqa muddatli hush yo‘qotilishi kardiak aritmiya yoki serebral gipoperfuziya belgisi.',
    });
    missingData.push({
      fieldUz: 'Qon glyukoza darajasi va EKG',
      importance: 'yuqori',
      reasonUz: 'Gipoglikemiya va kardiak ritm buzilishlarini inkor qilish.',
    });
  }

  // Add fallback general condition if empty
  if (conditions.length === 0) {
    conditions.push({
      condition: 'General Medical Examination',
      conditionUz: 'Umumiy terapevtik ko‘rik talab etiladigan holat',
      likelihood: 'o‘rta ehtimol',
      icd10: 'Z00.0',
      clinicalReasoningUz: 'Vital ko‘rsatkichlar va shikoyatlar asosida ambulator tekshiruv tavsiya qilinadi.',
    });
  }

  // Clamp score
  calculatedScore = Math.min(0.98, Math.max(0.1, calculatedScore));

  // Determine Triage Level
  let riskLevel: TriageLevel = 'LOW';
  if (isEmergency || calculatedScore >= 0.75) {
    riskLevel = 'EMERGENCY';
  } else if (calculatedScore >= 0.45) {
    riskLevel = 'HIGH';
  } else if (calculatedScore >= 0.3) {
    riskLevel = 'MODERATE';
  }

  // Default missing data if none added
  if (missingData.length === 0) {
    missingData.push({
      fieldUz: 'Klinik umumiy qon tahlili (UQT)',
      importance: 'o‘rta',
      reasonUz: 'Umumiy holatni va yallig‘lanish belgilarini baholash uchun.',
    });
  }

  return {
    riskLevel,
    riskScore: Number(calculatedScore.toFixed(2)),
    confidenceLevel: 'yuqori',
    potentialConditions: conditions,
    keyRiskFactors: riskFactors.length > 0 ? riskFactors : [
      {
        factorUz: 'Birlamchi holat',
        value: 'Qoniqarli',
        impact: 'past',
        explanationUz: 'Vital ko‘rsatkichlar me’yor chegarasida.',
      }
    ],
    missingData,
    suggestedSpecialty,
    doctorRecommendationUz: isEmergency
      ? 'Zudlik bilan shoshilinch tez tibbiy yordam (103) brigadasi chaqirilsin va statsionarga yuborilsin.'
      : doctorRecommendationUz,
    disclaimerUz: "Bu Sun'iy Intellekt (AI) differensial saralash xulosasi. Yakuniy tashxis shifokor tomonidan tasdiqlanadi.",
  };
}
