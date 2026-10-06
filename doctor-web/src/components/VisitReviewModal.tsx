import React, { useState, useMemo } from 'react';
import type { Visit, ClinicalAttachment, Pharmacy } from '../types';
import { api } from '../services/api';
import { calculateAge } from '../constants';
import {
  X,
  User,
  Activity,
  AlertTriangle,
  Sparkles,
  Camera,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Send,
  Pill,
  ShieldCheck,
  FileCheck,
  CheckCircle,
  Phone,
  Maximize2
} from 'lucide-react';

interface Props {
  visit: Visit;
  onClose: () => void;
  onVisitUpdated: () => void;
  pharmacies: Pharmacy[];
}

export const VisitReviewModal: React.FC<Props> = ({
  visit,
  onClose,
  onVisitUpdated,
  pharmacies,
}) => {
  // Zoom viewer state for clinical photos & ECG
  const [selectedPhoto, setSelectedPhoto] = useState<ClinicalAttachment | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isInverted, setIsInverted] = useState<boolean>(false);

  // Stable Prescription ID (derived from visit ID)
  const rxNumber = useMemo(() => {
    const hash = (visit.id || 'rx').split('').reduce((acc, char) => acc + char.charCodeAt(0), 1234);
    return `RX-${1000 + (hash % 9000)}`;
  }, [visit.id]);

  const existingDoc = visit.doctor_assessment;
  const firstAiCondition = visit.ai_assessment?.potential_conditions?.[0];

  // Doctor Assessment Form States - initialized from existing review or AI recommendations
  const [icd10Code, setIcd10Code] = useState<string>(() => {
    return visit.icd10_code || existingDoc?.icd10_code || firstAiCondition?.code || '';
  });
  const [diagnosisName, setDiagnosisName] = useState<string>(() => {
    return (
      visit.diagnosis_name ||
      existingDoc?.diagnosis_name ||
      firstAiCondition?.condition_uz ||
      firstAiCondition?.name ||
      firstAiCondition?.condition ||
      ''
    );
  });
  const [clinicalNotes, setClinicalNotes] = useState<string>(() => {
    return (
      existingDoc?.clinical_notes ||
      `Bemor shikoyatlari va ko'rsatkichlari ko'zdan kechirildi. ${visit.chief_complaint ? `Shikoyat: ${visit.chief_complaint}` : ''}`
    );
  });
  const [treatmentPlan, setTreatmentPlan] = useState<string>(() => {
    return existingDoc?.treatment_plan || '';
  });
  const [recommendations, setRecommendations] = useState<string>(() => {
    return (
      visit.doctor_recommendation ||
      existingDoc?.recommendations ||
      (visit.ai_assessment?.recommendations?.length ? visit.ai_assessment.recommendations.join('. ') : '')
    );
  });
  const [nurseInstruction, setNurseInstruction] = useState<string>(
    visit.doctor_assessment?.nurse_instructions || ''
  );

  // Prescription Form
  const [selectedMed, setSelectedMed] = useState<string>('Enalapril 10mg');
  const [dosage, setDosage] = useState<string>('1 tabletkadan kuniga 1 mahal ertalab');
  const [durationDays, setDurationDays] = useState<number>(14);
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<number>(1);
  const [prescriptionItems, setPrescriptionItems] = useState<Array<{
    name: string;
    dosage: string;
    duration: number;
    pharmacyId: number;
  }>>(() => {
    const rxList = visit.prescriptions || existingDoc?.prescriptions;
    if (rxList && rxList.length > 0) {
      return rxList.map((p) => ({
        name: p.medicine_name,
        dosage: p.dosage,
        duration: p.duration_days || 14,
        pharmacyId: p.pharmacy_id || 1,
      }));
    }
    return [];
  });

  // Referral
  const [isReferralNeeded, setIsReferralNeeded] = useState<boolean>(false);
  const [referralFacility, setReferralFacility] = useState<string>('Tuman Markaziy Shifoxonasi - Kardiologiya');
  const [referralReason, setReferralReason] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const vitals = visit.vital_signs || visit.vitals;
  const patient = visit.patient;
  const attachments = visit.attachments || [];
  const ai = visit.ai_assessment;

  const quickDiagnoses = [
    { code: 'I10', name: 'Birlamchi (essensial) arterial gipertenziya' },
    { code: 'I20.0', name: 'Nostabil stenokardiya (O\'tkir yurak sindromi ehtimoli)' },
    { code: 'I21.9', name: 'O\'tkir miokard infarkti' },
    { code: 'J18.9', name: 'Nospetsifik o\'choqli pnevmoniya' },
    { code: 'J20.9', name: 'O\'tkir bronxit' },
    { code: 'J03.9', name: 'O\'tkir lakunar tonzillit (Angina)' },
    { code: 'L20.9', name: 'Atopik dermatit / Allergik toshma' },
    { code: 'E11.9', name: '2-tur qandli diabet' },
  ];

  const handleAddPrescriptionItem = () => {
    if (!selectedMed) return;
    setPrescriptionItems([
      ...prescriptionItems,
      {
        name: selectedMed,
        dosage,
        duration: durationDays,
        pharmacyId: selectedPharmacyId,
      }
    ]);
  };

  const handleRemovePrescriptionItem = (index: number) => {
    setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
  };

  const handleCompleteReview = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await api.saveConsultation(visit.id, {
        icd10_code: icd10Code,
        diagnosis_name: diagnosisName,
        clinical_notes: clinicalNotes,
        treatment_plan: treatmentPlan,
        recommendations: recommendations,
        nurse_instruction: nurseInstruction.trim() || undefined,
        prescription_items: prescriptionItems.map((p) => ({
          medicine_name: p.name,
          dosage: p.dosage,
          frequency: p.dosage,
          duration_days: p.duration,
          instructions: p.dosage,
          pharmacy_id: p.pharmacyId,
        })),
        referral_facility: isReferralNeeded ? referralFacility : undefined,
        referral_reason: isReferralNeeded ? referralReason : undefined,
      });

      setSuccessMsg('Klinik tashxis va tavsiyalar muvaffaqiyatli tasdiqlandi! Bemor xizmat ko\'rsatilganlar arxiviga kiritildi.');
      setTimeout(() => {
        onVisitUpdated();
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Save error:', err);
      setErrorMsg(err.message || 'Xatolik yuz berdi. Iltimos qayta urinib ko\'ring.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'ecg':
        return 'EKG tasmasi';
      case 'skin_rash':
        return 'Teri toshmasi';
      case 'wound':
        return 'Yara / Travma';
      case 'throat':
        return 'Tomoq ko\'rigi';
      case 'swelling':
        return 'Shish / Travma';
      default:
        return 'Klinik fotosurat';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[96vh] flex flex-col shadow-2xl border border-slate-300 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center text-white">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white">
                  Bemor Ko'rigi: {patient?.first_name || visit.patient_first_name} {patient?.last_name || visit.patient_last_name}
                </h2>
                <span className="text-xs bg-teal-900 text-teal-300 font-mono px-2 py-0.5 rounded border border-teal-700">
                  ID: {visit.id.substring(0, 8)}
                </span>
                {visit.risk_level === 'critical' && (
                  <span className="text-xs bg-rose-900 text-rose-200 px-2 py-0.5 rounded font-bold border border-rose-700">
                    SHOSHILINCH
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Qishloq: {patient?.village?.name || 'Bog\'iston QFY'} • Ko'rik vaqti: {new Date(visit.visit_date).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href={visit.meet_link || "https://meet.google.com/new"}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition shadow-sm"
              title="Google Meet orqali video qo'ng'iroqqa ulanish"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4zM14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2z" />
              </svg>
              <span>Video aloqa</span>
            </a>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Two-column layout */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50">
          {/* LEFT COLUMN: Clinical data, Vitals, Photos, AI analysis (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Patient & Vitals Card */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center">
                <User className="w-4 h-4 mr-1.5 text-teal-600" /> Bemor Ma'lumotlari & Hayotiy Ko'rsatkichlar
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-slate-400 block">Jinsi / Yoshi</span>
                  <span className="font-semibold text-slate-800">
                    {patient?.gender === 'male' ? 'Erkak' : 'Ayol'},{' '}
                    {patient?.date_of_birth ? `${calculateAge(patient.date_of_birth) ?? '-'} yosh` : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Telefon</span>
                  <span className="font-semibold text-slate-800 flex items-center">
                    <Phone className="w-3 h-3 mr-1 text-slate-400" />
                    {patient?.phone || '+998 90 555-12-34'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Qon guruhi</span>
                  <span className="font-semibold text-slate-800">{patient?.blood_type || 'II (A) Rh+'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Pasport / JSHSHIR</span>
                  <span className="font-mono text-slate-700">{patient?.national_id || 'AA 1234567'}</span>
                </div>
              </div>

              {/* Vitals Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <div className={`p-2.5 rounded-lg border text-center ${
                  (vitals?.systolic_bp && vitals.systolic_bp > 140) 
                    ? 'bg-rose-50 border-rose-300 text-rose-900' 
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className="text-[11px] text-slate-500 block">Qon bosimi</span>
                  <span className="text-base font-bold text-slate-900">
                    {vitals?.systolic_bp ? `${vitals.systolic_bp}/${vitals.diastolic_bp}` : '140/90'}
                  </span>
                  <span className="text-[10px] text-slate-400 block">mmHg</span>
                </div>

                <div className={`p-2.5 rounded-lg border text-center ${
                  (vitals?.pulse && (vitals.pulse > 100 || vitals.pulse < 50)) 
                    ? 'bg-amber-50 border-amber-300 text-amber-900' 
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className="text-[11px] text-slate-500 block">Puls (yurak)</span>
                  <span className="text-base font-bold text-slate-900">
                    {vitals?.pulse || 78}
                  </span>
                  <span className="text-[10px] text-slate-400 block">urish/daq</span>
                </div>

                <div className={`p-2.5 rounded-lg border text-center ${
                  (vitals?.spo2 && vitals.spo2 < 95) 
                    ? 'bg-rose-50 border-rose-300 text-rose-900' 
                    : 'bg-teal-50 border-teal-200 text-teal-900'
                }`}>
                  <span className="text-[11px] text-slate-500 block">SpO2 (Kislorod)</span>
                  <span className="text-base font-bold text-slate-900">
                    {vitals?.spo2 || 98}%
                  </span>
                  <span className="text-[10px] text-teal-700 font-medium block">
                    {vitals?.spo2 && vitals.spo2 < 95 ? 'Gipoksiya' : 'Norma'}
                  </span>
                </div>

                <div className={`p-2.5 rounded-lg border text-center ${
                  (vitals?.temperature && vitals.temperature > 37.5) 
                    ? 'bg-amber-50 border-amber-300 text-amber-900' 
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className="text-[11px] text-slate-500 block">Harorat</span>
                  <span className="text-base font-bold text-slate-900">
                    {vitals?.temperature ? `${vitals.temperature}°C` : '36.6°C'}
                  </span>
                  <span className="text-[10px] text-slate-400 block">aksillyar</span>
                </div>

                <div className="p-2.5 rounded-lg border bg-slate-50 border-slate-200 text-center">
                  <span className="text-[11px] text-slate-500 block">Nafas soni</span>
                  <span className="text-base font-bold text-slate-900">
                    {vitals?.respiratory_rate || 18}
                  </span>
                  <span className="text-[10px] text-slate-400 block">nafas/daq</span>
                </div>
              </div>

              {/* Chief complaint & notes */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-700 block mb-1">
                  Bemorning asosiy shikoyati:
                </span>
                <p className="text-xs text-slate-800 bg-amber-50/70 p-3 rounded-lg border border-amber-200">
                  {visit.chief_complaint || 'Ko\'krak sohasida bosuvchi og\'riq, bosh aylanishi va teri toshmasi.'}
                </p>
              </div>
            </div>

            {/* 2. Visual Inspection Gallery: Photos & ECG */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center">
                  <Camera className="w-4 h-4 mr-1.5 text-teal-600" />
                  Klinik Fotosuratlar & EKG Tasmasi ({attachments.length})
                </h3>
                <span className="text-[11px] text-teal-700 font-medium bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Hamshira tomonidan yuklangan
                </span>
              </div>

              {attachments.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl">
                  <Camera className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Ushbu ko'rik uchun fotosuratlar yuklanmagan.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      onClick={() => {
                        setSelectedPhoto(att);
                        setZoomLevel(1);
                        setRotation(0);
                      }}
                      className="group relative bg-slate-900 rounded-xl overflow-hidden border border-slate-200 hover:border-teal-500 shadow-xs cursor-pointer transition"
                    >
                      <div className="aspect-4/3 overflow-hidden bg-slate-800 flex items-center justify-center">
                        <img
                          src={att.file_url}
                          alt={att.title || att.category}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          onError={(e) => {
                            // fallback for demo visuals if not physically on disk
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80';
                          }}
                        />
                      </div>

                      {/* Photo Overlay Tag */}
                      <div className="absolute top-2 left-2">
                        <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded border border-slate-700">
                          {getCategoryLabel(att.category)}
                        </span>
                      </div>

                      <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-slate-950/90 via-slate-950/60 to-transparent p-2 text-left">
                        <p className="text-[11px] font-semibold text-white truncate">
                          {att.title || att.file_name}
                        </p>
                        {att.notes && (
                          <p className="text-[10px] text-slate-300 truncate">{att.notes}</p>
                        )}
                      </div>

                      <div className="absolute inset-0 bg-teal-900/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                        <span className="bg-white/90 text-teal-900 text-xs font-semibold px-2.5 py-1 rounded-full shadow-md flex items-center">
                          <Maximize2 className="w-3 h-3 mr-1" /> Kattalashtirish
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Gemini AI Triage Analysis Card */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center">
                  <Sparkles className="w-4 h-4 mr-1.5 text-sky-600" />
                  Gemini 3.1 Flash • Sun'iy Intellekt Triaj Tahlili
                </h3>
                <span className="text-[11px] text-slate-400">
                  Model: gemini-3.1-flash-lite
                </span>
              </div>

              <div className="space-y-3">
                {/* AI Risk Score Bar */}
                <div className="p-3 rounded-lg bg-sky-50/60 border border-sky-200">
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="font-semibold text-slate-800">
                      Triage xavf darajasi: <span className="font-bold text-sky-800">
                        {ai?.risk_level === 'critical' ? 'Kritik (Qizil)' : ai?.risk_level === 'high' ? 'Yuqori (Qizil)' : ai?.risk_level === 'moderate' ? 'O\'rtacha (Sariq)' : 'Past (Yashil)'}
                      </span>
                    </span>
                    <span className="font-mono text-xs font-bold text-sky-700">
                      Xavf bali: {ai?.risk_score || 65}/100
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-sky-600 h-2 rounded-full transition-all"
                      style={{ width: `${ai?.risk_score || 65}%` }}
                    />
                  </div>
                </div>

                {/* Differential Diagnoses from AI */}
                <div>
                  <span className="text-xs font-semibold text-slate-700 block mb-2">
                    AI tomonidan ehtimol qilingan differensial tashxislar:
                  </span>
                  {ai?.potential_conditions && Array.isArray(ai.potential_conditions) && ai.potential_conditions.length > 0 ? (
                    <div className="space-y-2 text-xs">
                      {ai.potential_conditions.map((cond: any, idx: number) => {
                        const title = cond.condition_uz || cond.name || cond.condition || 'Ehtimoliy holat';
                        const code = cond.code || '';
                        const prob = typeof cond.probability === 'number' 
                          ? `${cond.probability}%` 
                          : (cond.likelihood || 'O\'rtacha');
                        const reason = cond.reasoning_uz || cond.explanation || '';

                        return (
                          <div
                            key={idx}
                            className="p-2.5 bg-slate-50 hover:bg-sky-50/50 rounded-lg border border-slate-200 transition flex items-start justify-between gap-2"
                          >
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-slate-900">{idx + 1}. {title}</span>
                                {code && (
                                  <span className="text-[10px] bg-sky-100 text-sky-800 font-mono font-bold px-1.5 py-0.2 rounded">
                                    {code}
                                  </span>
                                )}
                              </div>
                              {reason && (
                                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                  {reason}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center space-x-2 shrink-0">
                              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                                {prob}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (code) setIcd10Code(code);
                                  setDiagnosisName(title);
                                  if (reason) {
                                    setTreatmentPlan((prev) => prev ? prev : `AI tavsiyasi: ${reason}`);
                                  }
                                }}
                                className="text-[10px] bg-teal-700 hover:bg-teal-800 text-white font-semibold px-2 py-1 rounded transition cursor-pointer shadow-2xs"
                                title="Ushbu tashxisni formaga ko'chirish"
                              >
                                Tanlash
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-500 text-center">
                      AI tomonidan qo'shimcha differensial tashxislar qayd etilmagan.
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 italic bg-slate-50 p-2.5 rounded border border-slate-200">
                  * Eslatma: AI faqat qaror qabul qilishda yordam beradi. Yakuniy klinik tashxis va davolash shifokor mas'uliyatidadir.
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Doctor Decision, Diagnosis, Prescription, Nurse Order (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Doctor Decision Form Card */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <ShieldCheck className="w-5 h-5 text-teal-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Shifokorning Yakuniy Klinik Qarori
                </h3>
              </div>

              {/* ICD-10 Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  XPA-10 (ICD-10) Klinik Tashxisi:
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={icd10Code}
                    onChange={(e) => setIcd10Code(e.target.value)}
                    placeholder="Kod (masalan: I10)"
                    className="w-24 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                  <input
                    type="text"
                    value={diagnosisName}
                    onChange={(e) => setDiagnosisName(e.target.value)}
                    placeholder="Tashxis nomi"
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                {/* Quick ICD-10 suggestions */}
                <div className="flex flex-wrap gap-1.5">
                  {quickDiagnoses.map((qd) => (
                    <button
                      key={qd.code}
                      type="button"
                      onClick={() => {
                        setIcd10Code(qd.code);
                        setDiagnosisName(qd.name);
                      }}
                      className={`text-[10px] px-2 py-0.5 rounded cursor-pointer transition ${
                        icd10Code === qd.code
                          ? 'bg-teal-700 text-white font-semibold'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {qd.code} - {qd.name.substring(0, 18)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Clinical Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Klinik Ko'rik Xulosasi & Anamnez:
                </label>
                <textarea
                  rows={2}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              {/* Treatment Plan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Davolash Rejasi & Tavsiyalar:
                </label>
                <textarea
                  rows={2}
                  value={treatmentPlan}
                  onChange={(e) => setTreatmentPlan(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              {/* Doctor Recommendations */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Qo'shimcha Tavsiyalar & Monitoring:
                </label>
                <textarea
                  rows={2}
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              {/* E-Prescription Dispatch to Rural Pharmacy */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800 flex items-center">
                    <Pill className="w-4 h-4 mr-1 text-teal-700" /> Elektron Retsept (Dorixonaga Yuborish)
                  </span>
                  <span className="text-[10px] bg-teal-100 text-teal-800 font-mono font-bold px-2 py-0.5 rounded">
                    {rxNumber}
                  </span>
                </div>

                {/* Add new medicine */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-500 block">Dori nomi</label>
                    <select
                      value={selectedMed}
                      onChange={(e) => setSelectedMed(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs bg-white"
                    >
                      <option value="Enalapril 10mg">Enalapril 10mg (80 quti)</option>
                      <option value="Aspirin Kardio 100mg">Aspirin Kardio 100mg (95 quti)</option>
                      <option value="Amoksitsillin 500mg">Amoksitsillin 500mg (45 quti)</option>
                      <option value="Paratsetamol 500mg">Paratsetamol 500mg (120 quti)</option>
                      <option value="Suprastin 25mg">Suprastin 25mg (40 quti)</option>
                      <option value="Nitroglitserin 0.5mg">Nitroglitserin 0.5mg (25 quti)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-500 block">Dorixona</label>
                    <select
                      value={selectedPharmacyId}
                      onChange={(e) => setSelectedPharmacyId(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs bg-white"
                    >
                      {pharmacies.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.village_name})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="Qabul qilish tartibi (masalan: 1 tab kuniga 2 mahal)"
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded-md text-xs bg-white"
                  />
                  <div className="w-20">
                    <input
                      type="number"
                      value={durationDays}
                      onChange={(e) => setDurationDays(Number(e.target.value))}
                      placeholder="Kun"
                      title="Qabul qilish muddati (kun)"
                      className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs bg-white text-center"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddPrescriptionItem}
                    className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-md text-xs font-semibold cursor-pointer shrink-0"
                  >
                    + Qo'shish
                  </button>
                </div>

                {/* Prescriptions List */}
                <div className="space-y-1.5 mt-2">
                  {prescriptionItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center bg-white p-2 rounded border border-slate-200 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-900">{item.name}</span>
                        <span className="text-[11px] text-slate-500 block">{item.dosage}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePrescriptionItem(idx)}
                        className="text-rose-500 hover:text-rose-700 text-xs font-bold px-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order/Instruction to Nurse in village */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center">
                  <Send className="w-3.5 h-3.5 mr-1 text-teal-600" />
                  Hamshiraga Shoshilinch Ko'rsatma (Planshetiga boradi):
                </label>
                <input
                  type="text"
                  value={nurseInstruction}
                  onChange={(e) => setNurseInstruction(e.target.value)}
                  placeholder="Masalan: Bemorga 1 tab Enalapril bering, 20 daqiqadan so'ng bosimni o'lchang"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              {/* Hospital Referral Toggle */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isReferralNeeded}
                    onChange={(e) => setIsReferralNeeded(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                  <span>Tuman Markaziy Shifoxonasiga yo'llanma / 103 chaqirish</span>
                </label>

                {isReferralNeeded && (
                  <div className="mt-2 p-3 bg-rose-50 rounded-lg border border-rose-200 text-xs space-y-2">
                    <div>
                      <label className="text-[11px] text-rose-800 font-semibold block">Muassasa / Bo'lim:</label>
                      <input
                        type="text"
                        value={referralFacility}
                        onChange={(e) => setReferralFacility(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-rose-300 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-rose-800 font-semibold block">Yo'llanma sababi:</label>
                      <input
                        type="text"
                        value={referralReason}
                        onChange={(e) => setReferralReason(e.target.value)}
                        placeholder="Nostabil holat, statsionar tekshiruv zarur"
                        className="w-full px-2.5 py-1.5 bg-white border border-rose-300 rounded text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Alerts and errors */}
              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-semibold flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1.5 text-emerald-600" />
                  {successMsg}
                </div>
              )}

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 rounded-lg text-xs font-semibold flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1.5 text-rose-600" />
                  {errorMsg}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={handleCompleteReview}
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-teal-700 hover:bg-teal-800 disabled:bg-teal-400 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>{isSubmitting ? 'Saqlanmoqda...' : 'Tasdiqlash & Retseptni Yuborish'}</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition cursor-pointer"
                >
                  Yopish
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FULLSCREEN PHOTO / ECG INSPECTION MODAL */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-60 bg-black/90 flex flex-col p-4">
          {/* Zoom controls bar */}
          <div className="flex justify-between items-center text-white px-4 py-2 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-bold text-teal-400">
                {getCategoryLabel(selectedPhoto.category)}: {selectedPhoto.title || selectedPhoto.file_name}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Masshtab: {Math.round(zoomLevel * 100)}%
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsInverted(!isInverted)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 cursor-pointer transition ${
                  isInverted
                    ? 'bg-amber-500 text-black'
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
                title="EKG to'lqinlari uchun yuqori kontrast (Invert)"
              >
                <span>Kontrast (Invert)</span>
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white text-xs flex items-center cursor-pointer"
                title="Kichiklashtirish"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.min(4, z + 0.25))}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white text-xs flex items-center cursor-pointer"
                title="Kattalashtirish"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white text-xs flex items-center cursor-pointer"
                title="Aylantirish"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setZoomLevel(1);
                  setRotation(0);
                  setIsInverted(false);
                }}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-white text-xs cursor-pointer font-medium"
              >
                Tiklash
              </button>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="p-2 bg-rose-700 hover:bg-rose-800 rounded-lg text-white text-xs cursor-pointer ml-3"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Photo viewer canvas */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-4">
            <img
              src={selectedPhoto.file_url}
              alt={selectedPhoto.title || selectedPhoto.category}
              style={{
                transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                filter: isInverted ? 'invert(1) contrast(1.4)' : 'none',
                transition: 'transform 0.15s ease-out, filter 0.2s',
                maxWidth: '92%',
                maxHeight: '82vh',
              }}
              className="object-contain rounded-lg shadow-2xl cursor-grab select-none"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=90';
              }}
            />
          </div>

          {/* Bottom notes bar */}
          {selectedPhoto.notes && (
            <div className="bg-slate-900/90 text-slate-300 text-xs px-6 py-2.5 border-t border-slate-800 text-center">
              <span className="font-semibold text-white">Hamshira izohi: </span>
              {selectedPhoto.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
