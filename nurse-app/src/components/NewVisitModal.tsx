import React, { useState } from 'react';
import {
  X,
  User,
  HeartPulse,
  Activity,
  AlertTriangle,
  Check,
  ChevronRight,
  ChevronLeft,
  Send,
  Thermometer,
  Wind,
  ShieldAlert,
  Search,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { Patient, SymptomEntry, VitalSigns, Visit, TriageLevel, ClinicalPhoto, AIAssessment } from '../types';
import { MOCK_PATIENTS, COMMON_SYMPTOMS_LIBRARY } from '../data/mockData';
import { validateAndEvaluateVitals, detectRedFlags, generateTriageAssessment } from '../utils/triageEngine';
import { TriageBadge } from './TriageBadge';
import { ClinicalPhotoUpload } from './ClinicalPhotoUpload';
import { StorageService } from '../services/storage';
import { API_BASE_URL, MEDICAL_SPECIALTIES } from '../constants';
import { RegionDistrictSelector } from './RegionDistrictSelector';

interface NewVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveVisit: (visit: Visit) => void;
}

export const NewVisitModal: React.FC<NewVisitModalProps> = ({ isOpen, onClose, onSaveVisit }) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Patient selection state
  const [patientsList, setPatientsList] = useState<Patient[]>(() => StorageService.getPatients());
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(() => {
    const list = StorageService.getPatients();
    return list.length > 0 ? list[0] : null;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingNewPatient, setIsCreatingNewPatient] = useState(() => {
    return StorageService.getPatients().length === 0;
  });
  const [newPatientRegion, setNewPatientRegion] = useState('Toshkent viloyati');
  const [newPatientDistrict, setNewPatientDistrict] = useState('Bo‘stonliq tumani');
  const [newPatient, setNewPatient] = useState<Partial<Patient>>({
    firstName: '',
    lastName: '',
    patronymic: '',
    birthDate: '',
    gender: 'male',
    phone: '+998 ',
    village: 'Burchmulla qishlog‘i',
    address: '',
    chronicConditions: [],
    allergies: [],
  });

  // Complaint & Symptoms
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomEntry[]>([]);
  const [anamnesisAnswers, setAnamnesisAnswers] = useState<Record<string, string>>({});
  const [clinicalPhotos, setClinicalPhotos] = useState<ClinicalPhoto[]>([]);

  // Vitals
  const [vitals, setVitals] = useState<Partial<VitalSigns>>({
    systolicBP: 120,
    diastolicBP: 80,
    pulseRate: 75,
    temperature: 36.6,
    spo2: 98,
    respiratoryRate: 16,
    weight: 70,
    height: 170,
  });

  // Specialty destination
  const [selectedSpecialty, setSelectedSpecialty] = useState('Umumiy amaliyot shifokori (Bosh terapevt)');
  const [aiAssessment, setAiAssessment] = useState<AIAssessment | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Validation & Fallback Assessment
  const vitalsValidation = validateAndEvaluateVitals(vitals);
  const redFlags = detectRedFlags(vitals, selectedSymptoms, anamnesisAnswers);
  const fallbackAiAssessment = generateTriageAssessment(vitals, selectedSymptoms, redFlags, selectedPatient?.age);
  const currentAiAssessment = aiAssessment || fallbackAiAssessment;

  if (!isOpen) return null;

  const handleNextFromStep1 = () => {
    if (isCreatingNewPatient) {
      if (!newPatient.firstName || !newPatient.lastName || !newPatient.birthDate) {
        alert("Iltimos, barcha majburiy maydonlarni to'ldiring.");
        return;
      }
      
      let calculatedAge = 30;
      if (newPatient.birthDate) {
        const bDate = new Date(newPatient.birthDate);
        const today = new Date();
        calculatedAge = today.getFullYear() - bDate.getFullYear();
        const m = today.getMonth() - bDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < bDate.getDate())) {
          calculatedAge--;
        }
        calculatedAge = Math.max(0, calculatedAge);
      }

      const createdPatient: Patient = {
        id: `pat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        code: `QM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        firstName: newPatient.firstName || '',
        lastName: newPatient.lastName || '',
        patronymic: newPatient.patronymic || '',
        birthDate: newPatient.birthDate || '',
        gender: (newPatient.gender as any) || 'male',
        phone: newPatient.phone || '',
        region: newPatientRegion || undefined,
        district: newPatientDistrict || undefined,
        village: `${newPatientDistrict ? `${newPatientDistrict}, ` : ''}${newPatient.village || ''}`.trim(),
        address: `${newPatientRegion ? `${newPatientRegion}, ` : ''}${newPatient.address || ''}`.trim(),
        chronicConditions: [],
        allergies: [],
        age: calculatedAge,
      };

      StorageService.savePatient(createdPatient);
      setPatientsList(prev => [createdPatient, ...prev]);
      setSelectedPatient(createdPatient);
      setIsCreatingNewPatient(false);
    } else {
      if (!selectedPatient) {
        alert("Iltimos, bemorni tanlang.");
        return;
      }
    }
    
    setCurrentStep(2);
  };

  const handleNextToStep4 = async () => {
    setIsLoadingAi(true);
    setCurrentStep(4);
    
    // Complete assessment payload with demographics, vitals, and symptoms
    const assessmentPayload = {
      demographics: {
        age: selectedPatient?.age ?? 35,
        gender: selectedPatient?.gender ?? 'male'
      },
      chief_complaint: chiefComplaint || selectedSymptoms.map(s => s.nameUz).join(', ') || 'Birlamchi tibbiy ko‘rik',
      vital_signs: {
        systolic_bp: vitals.systolicBP,
        diastolic_bp: vitals.diastolicBP,
        pulse: vitals.pulseRate,
        temperature: vitals.temperature,
        spo2: vitals.spo2,
        respiratory_rate: vitals.respiratoryRate,
        weight: vitals.weight,
        height: vitals.height
      },
      symptoms: selectedSymptoms.map(s => ({
        name_uz: s.nameUz,
        severity: s.severity,
        duration_value: s.durationValue,
        duration_unit: s.durationUnit,
        onset: s.onset
      })),
      chronic_conditions: selectedPatient?.chronicConditions || []
    };

    let aiData: any = null;

    try {
      // Fast call to configured Backend AI (timeout: 2.5 seconds, no freeze)
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);
        const res = await fetch(`${API_BASE_URL}/visits/quick-ai-assessment`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(assessmentPayload),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          aiData = await res.json();
        }
      } catch (err) {
        console.info("Server AI ulanmadi, avtonom tibbiy algoritm ishlatilmoqda...", err);
      }

      if (aiData) {
        setAiAssessment({
          riskLevel: (aiData.risk_level?.toUpperCase() as any) || fallbackAiAssessment.riskLevel,
          riskScore: Number(aiData.risk_score) || fallbackAiAssessment.riskScore,
          confidenceLevel: 'yuqori',
          potentialConditions: (aiData.potential_conditions && aiData.potential_conditions.length > 0)
            ? aiData.potential_conditions.map((c: any) => ({
                condition: c.condition || c.nameUz || 'Klinik holat',
                conditionUz: c.condition_uz || c.conditionUz || c.condition || c.nameUz || 'Klinik holat',
                likelihood: c.likelihood || c.probability || 'yuqori ehtimol',
                icd10: c.icd10 || 'Z00.0',
                clinicalReasoningUz: c.reasoning_uz || c.clinicalReasoningUz || (Array.isArray(c.recommendations) ? c.recommendations.join(', ') : '') || 'AI tahlili asosida shakllantirildi'
              }))
            : fallbackAiAssessment.potentialConditions,
          keyRiskFactors: (aiData.risk_factors && aiData.risk_factors.length > 0)
            ? aiData.risk_factors.map((f: any) => ({
                factorUz: typeof f === 'string' ? f : (f.factorUz || f.factor || 'Aniqlangan omil'),
                value: typeof f === 'string' ? '' : (f.value || ''),
                impact: 'yuqori',
                explanationUz: typeof f === 'string' ? 'Sun\'iy intellekt orqali aniqlangan xavf omili' : (f.explanationUz || f.explanation_uz || 'Xavf omili')
              }))
            : fallbackAiAssessment.keyRiskFactors,
          missingData: (aiData.missing_data && aiData.missing_data.length > 0)
            ? aiData.missing_data.map((m: any) => ({
                fieldUz: typeof m === 'string' ? m : (m.fieldUz || m.field || 'Ma\'lumot yetarli emas'),
                importance: 'o‘rta',
                reasonUz: typeof m === 'string' ? 'Qo\'shimcha diagnostika tavsiya etiladi' : (m.reasonUz || m.reason_uz || 'Tavsiya')
              }))
            : fallbackAiAssessment.missingData,
          suggestedSpecialty: fallbackAiAssessment.suggestedSpecialty,
          doctorRecommendationUz: aiData.confidence_note || aiData.doctor_recommendation_uz || fallbackAiAssessment.doctorRecommendationUz,
          disclaimerUz: "Bu Sun'iy Intellekt (AI) differensial saralash xulosasi. Yakuniy tashxis shifokor tomonidan tasdiqlanadi."
        });
      } else {
        setAiAssessment(fallbackAiAssessment);
      }
      // Automatically select the AI-recommended medical specialty
      if (fallbackAiAssessment?.suggestedSpecialty) {
        setSelectedSpecialty(fallbackAiAssessment.suggestedSpecialty);
      }
    } catch (e) {
      console.warn("Lokal klinik triage ishlatilmoqda:", e);
      setAiAssessment(fallbackAiAssessment);
      if (fallbackAiAssessment?.suggestedSpecialty) {
        setSelectedSpecialty(fallbackAiAssessment.suggestedSpecialty);
      }
    } finally {
      setIsLoadingAi(false);
    }
  };

  const toggleSymptom = (code: string, nameUz: string, category: string) => {
    const exists = selectedSymptoms.find((s) => s.code === code);
    if (exists) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s.code !== code));
    } else {
      setSelectedSymptoms([
        ...selectedSymptoms,
        {
          id: `sym-${Date.now()}-${code}`,
          code,
          nameUz,
          category,
          severity: 'moderate',
          durationValue: 1,
          durationUnit: 'kun',
          onset: 'gradual',
        },
      ]);
    }
  };

  const handleFinalSubmit = () => {
    if (!selectedPatient) return;

    const nurseProf = StorageService.getNurseProfile();
    const visitRegion = (selectedPatient as any).region || newPatientRegion || nurseProf?.region || 'Toshkent viloyati';
    const visitDistrict = (selectedPatient as any).district || newPatientDistrict || nurseProf?.district || 'Bo‘stonliq tumani';
    const visitFacility = nurseProf?.facility || 'Burchmulla FAP №4';

    const newVisitRecord: Visit = {
      id: `vis-${Date.now()}`,
      patientId: selectedPatient.id,
      patient: selectedPatient,
      nurseId: nurseProf?.id || 'usr-nurse-01',
      clinicId: 'cl-fap-04',
      clinicName: visitFacility,
      region: visitRegion,
      district: visitDistrict,
      facility: visitFacility,
      visitDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      chiefComplaint: chiefComplaint || (selectedSymptoms[0]?.nameUz ?? 'Birlamchi ko‘rik'),
      symptoms: selectedSymptoms,
      vitals: vitals as VitalSigns,
      anamnesisAnswers,
      redFlags,
      aiAssessment: currentAiAssessment,
      attachments: clinicalPhotos,
      triageLevel: currentAiAssessment.riskLevel,
      targetSpecialty: selectedSpecialty,
      status: 'submitted_to_doctor',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    onSaveVisit(newVisitRecord);
    onClose();
  };

  const filteredPatients = patientsList.filter((p) =>
    `${p.firstName} ${p.lastName} ${p.phone} ${p.village}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white/95 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-50 border border-slate-200 rounded-xl shadow-2xl w-full max-w-4xl text-slate-900 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-100/90 rounded-t-xl">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Yangi bemor qabuli va klinik saralash
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Standartlashtirilgan birlamchi tibbiy ko‘rik protokoli
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs flex items-center space-x-1.5 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Yopish</span>
          </button>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-4 border-b border-slate-200 bg-slate-50/50 text-xs">
          {[
            { step: 1, label: '1. Bemor ma’lumotlari' },
            { step: 2, label: '2. Shikoyat va Anamnez' },
            { step: 3, label: '3. Vital ko‘rsatkichlar' },
            { step: 4, label: '4. Triage va Yo‘naltirish' },
          ].map((item) => (
            <div
              key={item.step}
              onClick={() => {
                // allow clicking previous steps
                if (item.step < currentStep) setCurrentStep(item.step as any);
              }}
              className={`py-3 px-2 sm:px-4 text-center font-medium border-b-2 transition ${
                currentStep === item.step
                  ? 'border-blue-500 text-blue-600 bg-blue-50 font-semibold'
                  : currentStep > item.step
                  ? 'border-emerald-500 text-emerald-600 cursor-pointer'
                  : 'border-transparent text-slate-500'
              }`}
            >
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden">{item.step}-bosqich</span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* STEP 1: Patient Selection */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Bemor F.I.SH, telefon raqami yoki qishlog‘i bo‘yicha qidirish..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreatingNewPatient(!isCreatingNewPatient)}
                  className="px-3 py-2 rounded-lg bg-slate-200 hover:bg-slate-200 border border-slate-300 text-xs font-semibold text-slate-800 transition flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isCreatingNewPatient ? 'Ro‘yxatdan tanlash' : 'Yangi bemor ochish'}</span>
                </button>
              </div>

              {!isCreatingNewPatient ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    Mavjud bemorlar ro‘yxati ({filteredPatients.length})
                  </label>
                  {filteredPatients.length === 0 ? (
                    <div className="p-6 text-center bg-slate-100 rounded-xl border border-slate-200">
                      <p className="text-xs text-slate-600 mb-2">Bazada ro‘yxatga olingan bemorlar topilmadi.</p>
                      <button
                        type="button"
                        onClick={() => setIsCreatingNewPatient(true)}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        + Yangi bemorni kiritish
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                      {filteredPatients.map((pat) => {
                        const isSelected = selectedPatient?.id === pat.id;
                        return (
                          <div
                            key={pat.id}
                            onClick={() => setSelectedPatient(pat)}
                            className={`p-3.5 rounded-lg border text-left transition cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50/40 border-blue-500 ring-1 ring-blue-500/50'
                                : 'bg-slate-200/60 border-slate-300 hover:bg-slate-200'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-sm font-bold text-slate-900">
                                  {pat.lastName} {pat.firstName} {pat.patronymic}
                                </p>
                                <p className="text-xs text-slate-600 mt-0.5">
                                  {pat.age} yosh, {pat.gender === 'male' ? 'Erkak' : 'Ayol'} • {pat.village}
                                </p>
                              </div>
                              <span className="text-[10px] font-mono bg-slate-50 px-1.5 py-0.5 rounded text-slate-600 border border-slate-200">
                                {pat.code}
                              </span>
                            </div>
                            <div className="mt-2 text-[11px] text-slate-600 flex items-center justify-between border-t border-slate-300/60 pt-2">
                              <span>Tel: {pat.phone}</span>
                              {pat.chronicConditions.length > 0 && (
                                <span className="text-amber-400 font-medium truncate max-w-[150px]">
                                  {pat.chronicConditions[0]}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* New Patient Form */
                <div className="bg-slate-50/80 p-4 rounded-lg border border-slate-200 space-y-4">
                  <h3 className="text-sm font-bold text-slate-800">Yangi bemorni ro‘yxatga olish</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-slate-600">Familiya *</label>
                      <input
                        type="text"
                        value={newPatient.lastName}
                        onChange={(e) => setNewPatient({ ...newPatient, lastName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-sm text-slate-900"
                        placeholder="Masalan: Aliyev"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600">Ism *</label>
                      <input
                        type="text"
                        value={newPatient.firstName}
                        onChange={(e) => setNewPatient({ ...newPatient, firstName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-sm text-slate-900"
                        placeholder="Masalan: Sardor"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600">Otasining ismi</label>
                      <input
                        type="text"
                        value={newPatient.patronymic}
                        onChange={(e) => setNewPatient({ ...newPatient, patronymic: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-sm text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-slate-600">Tug‘ilgan sana *</label>
                      <input
                        type="date"
                        value={newPatient.birthDate}
                        onChange={(e) => setNewPatient({ ...newPatient, birthDate: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-sm text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600">Jinsi *</label>
                      <select
                        value={newPatient.gender}
                        onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value as any })}
                        className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-sm text-slate-900"
                      >
                        <option value="male">Erkak</option>
                        <option value="female">Ayol</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-600">Telefon raqami *</label>
                      <input
                        type="text"
                        value={newPatient.phone}
                        onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-sm text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Smart Region & District Selector */}
                  <RegionDistrictSelector
                    selectedRegion={newPatientRegion}
                    selectedDistrict={newPatientDistrict}
                    onRegionChange={setNewPatientRegion}
                    onDistrictChange={setNewPatientDistrict}
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-600">Qishloq / Mahalla *</label>
                      <input
                        type="text"
                        value={newPatient.village}
                        onChange={(e) => setNewPatient({ ...newPatient, village: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-sm text-slate-900"
                        placeholder="Masalan: Burchmulla qishlog‘i"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600">Ko‘cha va uy raqami</label>
                      <input
                        type="text"
                        value={newPatient.address}
                        onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-sm text-slate-900"
                        placeholder="Masalan: Mustaqillik ko‘chasi, 12-uy"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Complaints & Dynamic Anamnesis */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Chief complaint textarea */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Bemorning asosiy shikoyati (erkin bayoni) *
                </label>
                <textarea
                  rows={2}
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder="Masalan: 3 kundan beri to‘sh ortida achishish va nafas qisishi bezovta qilmoqda..."
                  className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Symptom Library Checkboxes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Klinik simptomlar lug‘ati (tanlang)
                </label>
                <div className="space-y-4">
                  {COMMON_SYMPTOMS_LIBRARY.map((cat) => (
                    <div key={cat.category} className="bg-slate-50/40 p-3 rounded-lg border border-slate-200">
                      <p className="text-xs font-bold text-slate-600 mb-2 border-b border-slate-200 pb-1">
                        {cat.category}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {cat.symptoms.map((sym) => {
                          const isChecked = selectedSymptoms.some((s) => s.code === sym.code);
                          return (
                            <button
                              type="button"
                              key={sym.code}
                              onClick={() => toggleSymptom(sym.code, sym.nameUz, cat.category)}
                              className={`flex items-center space-x-2.5 p-2 rounded-md text-xs font-medium text-left transition border cursor-pointer ${
                                isChecked
                                  ? 'bg-blue-900/30 border-blue-500 text-blue-700'
                                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded border flex items-center justify-center ${
                                  isChecked ? 'bg-blue-600 border-blue-600 text-slate-900' : 'border-slate-300'
                                }`}
                              >
                                {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span className="flex-1">{sym.nameUz}</span>
                              {sym.isRedFlagCandidate && (
                                <span className="text-[10px] text-red-600 font-bold bg-red-50/60 px-1 rounded border border-red-800/40">
                                  Xavf
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Anamnesis follow-up questions */}
              {selectedSymptoms.some((s) => s.code === 'chest_pain') && (
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-500/40 space-y-3">
                  <div className="flex items-center space-x-2 text-blue-600">
                    <Activity className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      Dinamik anamnez: Ko‘krak og‘rig‘i bo‘yicha qo‘shimcha aniqlash
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-slate-700 block mb-1">
                        Og‘riq chap qo‘l, yelka yoki pastki jag‘ga tarqaladimi?
                      </label>
                      <select
                        value={anamnesisAnswers['cp_radiation'] || ''}
                        onChange={(e) => setAnamnesisAnswers({ ...anamnesisAnswers, cp_radiation: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900"
                      >
                        <option value="">Tanlang...</option>
                        <option value="Ha, chap qo‘l va jag‘ga tarqaladi">Ha, chap qo‘l / jag‘ga tarqaladi</option>
                        <option value="Yo‘q, faqat to‘sh ortida">Yo‘q, faqat lokal to‘sh ortida</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-700 block mb-1">Og‘riq xarakteri qanday?</label>
                      <select
                        value={anamnesisAnswers['cp_character'] || ''}
                        onChange={(e) => setAnamnesisAnswers({ ...anamnesisAnswers, cp_character: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900"
                      >
                        <option value="">Tanlang...</option>
                        <option value="Siquvchi, ezuvchi, achishuvchi">Siquvchi, ezuvchi, achishuvchi</option>
                        <option value="Sanchuvchi, nafas olganda kuchayadi">Sanchuvchi, nafas olganda kuchayadi</option>
                        <option value="Simillovchi, doimiy">Simillovchi, doimiy</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {selectedSymptoms.some((s) => s.code === 'abdominal_pain') && (
                <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-500/40 space-y-3">
                  <div className="flex items-center space-x-2 text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      Dinamik anamnez: Qorin og‘rig‘i bo‘yicha peritoneal belgilar
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-slate-700 block mb-1">Qorin devori tarangligi (defans)?</label>
                      <select
                        value={anamnesisAnswers['abdominal_palpation'] || ''}
                        onChange={(e) =>
                          setAnamnesisAnswers({ ...anamnesisAnswers, abdominal_palpation: e.target.value })
                        }
                        className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900"
                      >
                        <option value="">Tanlang...</option>
                        <option value="Yumshoq, taranglik yo‘q">Yumshoq, taranglik yo‘q</option>
                        <option value="O‘ng yonboshda lokal mushak tarangligi">O‘ng yonboshda lokal mushak tarangligi</option>
                        <option value="Butun qorin bo‘ylab taxtasimon tarang">Butun qorin bo‘ylab taxtasimon tarang</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-700 block mb-1">Shchetkin-Blyumberg belgisi?</label>
                      <select
                        value={anamnesisAnswers['rebound_tenderness'] || ''}
                        onChange={(e) =>
                          setAnamnesisAnswers({ ...anamnesisAnswers, rebound_tenderness: e.target.value })
                        }
                        className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900"
                      >
                        <option value="">Tanlang...</option>
                        <option value="Manfiy (og‘riq kuchaymadi)">Manfiy (og‘riq kuchaymadi)</option>
                        <option value="Musbat (qo‘l olinganda o‘tkir og‘riq)">Musbat (qo‘l olinganda o‘tkir og‘riq)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Clinical Photos & ECG Section */}
              <ClinicalPhotoUpload
                photos={clinicalPhotos}
                onPhotosChange={setClinicalPhotos}
              />
            </div>
          )}

          {/* STEP 3: Objective Vital Signs */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Hayotiy ko‘rsatkichlar (Vital signs)</h3>
                  <p className="text-xs text-slate-600">Har bir ko‘rsatkichni standart o‘lchov birliklarida kiriting</p>
                </div>
              </div>

              {/* Validation Errors & Warnings Alert Box */}
              {!vitalsValidation.isValid && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-500/60 text-xs text-red-700 space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold text-red-600">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Kiritishda xatolik aniqlandi (davom etish mumkin emas):</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5">
                    {vitalsValidation.errors.map((err, i) => (
                      <li key={i}>{err.messageUz}</li>
                    ))}
                  </ul>
                </div>
              )}

              {vitalsValidation.warnings.length > 0 && (
                <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/50 text-xs text-amber-300 space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Klinik ogohlantirish (me’yordan chetlanish):</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5">
                    {vitalsValidation.warnings.map((w, i) => (
                      <li key={i}>{w.messageUz}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Vitals Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Systolic BP */}
                <div className="p-3.5 rounded-lg bg-white border border-slate-200">
                  <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                    <span>Sistolik bosim</span>
                    <span className="font-mono text-[11px]">mmHg</span>
                  </div>
                  <input
                    type="number"
                    value={vitals.systolicBP || ''}
                    onChange={(e) => setVitals({ ...vitals, systolicBP: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-lg font-bold text-slate-900 text-center font-mono"
                    placeholder="120"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>Me’yor: 90-140</span>
                    <span className="text-amber-500">&gt;140 yuqori</span>
                  </div>
                </div>

                {/* Diastolic BP */}
                <div className="p-3.5 rounded-lg bg-white border border-slate-200">
                  <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                    <span>Diastolik bosim</span>
                    <span className="font-mono text-[11px]">mmHg</span>
                  </div>
                  <input
                    type="number"
                    value={vitals.diastolicBP || ''}
                    onChange={(e) => setVitals({ ...vitals, diastolicBP: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-lg font-bold text-slate-900 text-center font-mono"
                    placeholder="80"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>Me’yor: 60-90</span>
                    <span className="text-amber-500">&gt;90 yuqori</span>
                  </div>
                </div>

                {/* Pulse */}
                <div className="p-3.5 rounded-lg bg-white border border-slate-200">
                  <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                    <span>Yurak urishi (puls)</span>
                    <span className="font-mono text-[11px]">zarba/daq</span>
                  </div>
                  <input
                    type="number"
                    value={vitals.pulseRate || ''}
                    onChange={(e) => setVitals({ ...vitals, pulseRate: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-lg font-bold text-slate-900 text-center font-mono"
                    placeholder="75"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>Me’yor: 60-100</span>
                    <span className="text-amber-500">&gt;100 taxikardiya</span>
                  </div>
                </div>

                {/* Temperature */}
                <div className="p-3.5 rounded-lg bg-white border border-slate-200">
                  <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                    <span>Tana harorati</span>
                    <span className="font-mono text-[11px]">°C</span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    value={vitals.temperature || ''}
                    onChange={(e) => setVitals({ ...vitals, temperature: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-lg font-bold text-slate-900 text-center font-mono"
                    placeholder="36.6"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>Me’yor: 36.0-37.2</span>
                    <span className="text-amber-500">&gt;38.0 isitma</span>
                  </div>
                </div>

                {/* SpO2 */}
                <div className="p-3.5 rounded-lg bg-white border border-slate-200">
                  <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                    <span>Kislorod (SpO2)</span>
                    <span className="font-mono text-[11px]">%</span>
                  </div>
                  <input
                    type="number"
                    value={vitals.spo2 || ''}
                    onChange={(e) => setVitals({ ...vitals, spo2: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-lg font-bold text-slate-900 text-center font-mono"
                    placeholder="98"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>Me’yor: 95-100%</span>
                    <span className="text-red-600">&lt;90% xavfli</span>
                  </div>
                </div>

                {/* Respiratory rate */}
                <div className="p-3.5 rounded-lg bg-white border border-slate-200">
                  <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                    <span>Nafas soni (NHS)</span>
                    <span className="font-mono text-[11px]">nafas/daq</span>
                  </div>
                  <input
                    type="number"
                    value={vitals.respiratoryRate || ''}
                    onChange={(e) => setVitals({ ...vitals, respiratoryRate: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-lg font-bold text-slate-900 text-center font-mono"
                    placeholder="16"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>Me’yor: 12-20</span>
                    <span className="text-amber-500">&gt;20 hansirash</span>
                  </div>
                </div>

                {/* Weight */}
                <div className="p-3.5 rounded-lg bg-white border border-slate-200">
                  <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                    <span className="font-semibold text-slate-800">Tana vazni (vazn)</span>
                    <span className="font-mono text-[11px] font-bold text-blue-600">kg</span>
                  </div>
                  <input
                    type="number"
                    step="0.5"
                    value={vitals.weight || ''}
                    onChange={(e) => setVitals({ ...vitals, weight: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-lg font-bold text-slate-900 text-center font-mono"
                    placeholder="70"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>Me’yor: 50-90 kg</span>
                    <span className="text-blue-600">TMI hisobi</span>
                  </div>
                </div>

                {/* Height */}
                <div className="p-3.5 rounded-lg bg-white border border-slate-200">
                  <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                    <span className="font-semibold text-slate-800">Bo‘yi (uzunligi)</span>
                    <span className="font-mono text-[11px] font-bold text-blue-600">sm</span>
                  </div>
                  <input
                    type="number"
                    value={vitals.height || ''}
                    onChange={(e) => setVitals({ ...vitals, height: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-lg font-bold text-slate-900 text-center font-mono"
                    placeholder="170"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>Me’yor: 150-195 sm</span>
                    <span className="text-blue-600">TMI hisobi</span>
                  </div>
                </div>

                {/* BMI Card */}
                <div className="p-3.5 rounded-lg bg-blue-50/70 border border-blue-200 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-blue-800 font-semibold mb-1">
                    <span>Tana massasi indeksi (TMI)</span>
                    <span className="font-mono text-[11px]">kg/m²</span>
                  </div>
                  <div className="text-center py-0.5">
                    <span className="text-2xl font-bold font-mono text-blue-900">
                      {vitals.weight && vitals.height
                        ? (vitals.weight / Math.pow(vitals.height / 100, 2)).toFixed(1)
                        : '--.-'}
                    </span>
                  </div>
                  <div className="text-[10px] text-center font-semibold text-blue-700">
                    {(() => {
                      if (!vitals.weight || !vitals.height) return 'Vazn va bo‘yni kiriting';
                      const bmiVal = vitals.weight / Math.pow(vitals.height / 100, 2);
                      if (bmiVal < 18.5) return 'Vazn tanqisligi (<18.5)';
                      if (bmiVal <= 24.9) return 'Normal vazn (18.5 - 24.9)';
                      if (bmiVal <= 29.9) return 'Ortiqcha vazn (25 - 29.9)';
                      return 'Semizlik (≥30)';
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Triage Assessment & Dispatch */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {/* Red Flag Warning Box (if any) */}
              {redFlags.length > 0 && (
                <div className="p-4 rounded-xl bg-red-50 border-2 border-red-500 space-y-3">
                  <div className="flex items-center space-x-2 text-red-600">
                    <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
                    <h3 className="text-sm font-bold uppercase tracking-wider">
                      SHOSHILINCH RED FLAG BELGISI ANIQLANDI!
                    </h3>
                  </div>
                  {redFlags.map((flag) => (
                    <div key={flag.id} className="bg-white/90 p-3 rounded-lg border border-red-200 text-xs">
                      <p className="font-bold text-red-700 text-sm">{flag.titleUz}</p>
                      <p className="text-slate-700 mt-1">{flag.descriptionUz}</p>
                      <div className="mt-2 p-2 rounded bg-red-50 border border-red-200 text-red-200 font-medium">
                        <span className="font-bold text-slate-900 uppercase text-[10px] block">Klinik protokol:</span>
                        {flag.protocolUz}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* AI Clinical Triage Overview */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-blue-700 flex items-center space-x-2">
                      <svg className="w-5 h-5 text-blue-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="text-base">Sun'iy intellekt (Gemini AI) Xulosasi</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 ml-7 font-medium">
                      Kiritilgan {selectedSymptoms.length} ta simptom va hayotiy ko‘rsatkichlar asosida AI tomonidan shakllantirildi
                    </p>
                  </div>
                  <TriageBadge level={currentAiAssessment.riskLevel} size="md" />
                </div>

                {/* Potential Conditions */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                    Ehtimoliy klinik holatlar:
                  </label>
                  <div className="space-y-1.5">
                    {currentAiAssessment.potentialConditions.map((cond: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-800">{cond.conditionUz}</p>
                          <p className="text-slate-600 text-[11px] mt-0.5">{cond.clinicalReasoningUz}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 shrink-0 ml-2">
                          {cond.likelihood}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Disclaimer note */}
                <p className="text-[11px] text-slate-500 italic border-t border-slate-200 pt-2">
                  {currentAiAssessment.disclaimerUz}
                </p>
              </div>

              {/* Specialty Dispatch */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Qaysi mutaxassislik bo‘yicha shifokorga yo‘naltiriladi?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {MEDICAL_SPECIALTIES.map((specItem) => {
                    const spec = specItem.name;
                    const isRecommended = currentAiAssessment.suggestedSpecialty === spec ||
                      currentAiAssessment.suggestedSpecialty.includes(specItem.shortName);
                    return (
                      <button
                        type="button"
                        key={specItem.code}
                        onClick={() => setSelectedSpecialty(spec)}
                        className={`p-2.5 rounded-lg border text-left font-medium transition cursor-pointer flex items-center justify-between ${
                          selectedSpecialty === spec
                            ? 'bg-teal-50 border-teal-600 text-teal-800 ring-1 ring-teal-500/40 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex flex-col pr-2">
                          <span className="font-semibold text-xs text-slate-900">{spec}</span>
                          <span className="text-[10px] text-slate-500 mt-0.5 leading-tight">{specItem.description}</span>
                        </div>
                        {isRecommended && (
                          <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full border border-teal-300 shrink-0">
                            AI Tavsiya
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Actions */}
        <div className="px-5 py-4 border-t border-slate-200 bg-white/90 rounded-b-xl flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((currentStep - 1) as any)}
              className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Orqaga</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Bekor qilish / Yopish</span>
            </button>
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              disabled={currentStep === 3 && !vitalsValidation.isValid}
              onClick={() => {
                if (currentStep === 3) {
                  handleNextToStep4();
                } else if (currentStep === 1) {
                  handleNextFromStep1();
                } else {
                  setCurrentStep((currentStep + 1) as any);
                }
              }}
              className={`px-5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
                currentStep === 3 && !vitalsValidation.isValid
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
              }`}
            >
              <span>{isLoadingAi ? 'Tahlil qilinmoqda...' : 'Keyingisi'}</span>
              {isLoadingAi ? (
                <Activity className="w-4 h-4 animate-pulse" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSubmit}
              className={`px-6 py-2.5 rounded-lg text-xs font-bold tracking-wide flex items-center space-x-2 transition shadow-md cursor-pointer ${
                redFlags.length > 0
                  ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>
                {redFlags.length > 0
                  ? 'SHOSHILINCH SHIFOKORGA YUBORISH'
                  : 'SHIFOKOR KO‘RIGIGA YUBORISH'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
