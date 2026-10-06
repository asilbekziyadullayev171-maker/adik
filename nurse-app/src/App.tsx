import React, { useState, useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import {
  Plus,
  Search,
  Filter,
  Activity,
  HeartPulse,
  Thermometer,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Calendar,
  ChevronRight,
  User,
  Phone,
  FileText,
  Pill,
  Building,
  RefreshCw,
} from 'lucide-react';
import { Visit, Patient, TriageLevel, Pharmacy, PrescriptionOrder } from './types';
import { MOCK_VISITS, MOCK_PATIENTS, CURRENT_NURSE } from './data/mockData';
import { StorageService } from './services/storage';
import { Header } from './components/Header';
import { TriageBadge } from './components/TriageBadge';
import { NewVisitModal } from './components/NewVisitModal';
import { VisitDetailModal } from './components/VisitDetailModal';
import { NurseProfileModal } from './components/NurseProfileModal';
import { PharmaciesTab } from './components/PharmaciesTab';
import { SendPrescriptionModal } from './components/SendPrescriptionModal';
import { BottomNav } from './components/BottomNav';

export function App() {
  const [activeTab, setActiveTab] = useState<'visits' | 'patients' | 'reviews' | 'pharmacies'>('visits');
  const [visits, setVisits] = useState<Visit[]>(() => StorageService.getVisits());
  const [patients, setPatients] = useState<Patient[]>(() => StorageService.getPatients());
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>(() => StorageService.getPharmacies());
  const [prescriptionOrders, setPrescriptionOrders] = useState<PrescriptionOrder[]>(() => StorageService.getPrescriptionOrders());
  const [medicinesCount, setMedicinesCount] = useState<number>(() => StorageService.getMedicines().length);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [isNewVisitOpen, setIsNewVisitOpen] = useState(false);
  
  // Nurse Profile state - check if it's their first time
  const [nurseProfile, setNurseProfile] = useState<any>(() => StorageService.getNurseProfile());
  const [isProfileOpen, setIsProfileOpen] = useState(() => {
    const profile = StorageService.getNurseProfile();
    return !profile || !profile.fullName || (!profile.firstName && !profile.lastName);
  });
  
  const [isSendPrescriptionOpen, setIsSendPrescriptionOpen] = useState(false);
  const [sendPrescriptionPharmacyId, setSendPrescriptionPharmacyId] = useState<number | undefined>(undefined);

  useEffect(() => {
    CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      // Custom back button logic (prevent immediate exit)
      if (isNewVisitOpen) setIsNewVisitOpen(false);
      else if (selectedVisit) setSelectedVisit(null);
      else if (isProfileOpen && nurseProfile) setIsProfileOpen(false);
      else if (isSendPrescriptionOpen) setIsSendPrescriptionOpen(false);
      else if (activeTab !== 'visits') setActiveTab('visits');
      else {
        CapacitorApp.exitApp();
      }
    });
    return () => {
      CapacitorApp.removeAllListeners();
    };
  }, [isNewVisitOpen, selectedVisit, isProfileOpen, isSendPrescriptionOpen, activeTab, nurseProfile]);

  // Sync state
  const [syncQueueCount, setSyncQueueCount] = useState<number>(() => StorageService.getSyncQueue().filter(i => i.status === 'pending').length);
  const [isSyncing, setIsSyncing] = useState(false);

  // Filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [triageFilter, setTriageFilter] = useState<'ALL' | TriageLevel>('ALL');

  const handleSaveVisit = (newVisit: Visit) => {
    StorageService.saveVisit(newVisit);
    setVisits([newVisit, ...visits]);
    setSelectedVisit(newVisit);
    setSyncQueueCount(StorageService.getSyncQueue().filter(i => i.status === 'pending').length);
    StorageService.triggerSync().then(() => {
      setSyncQueueCount(StorageService.getSyncQueue().filter(i => i.status === 'pending').length);
    }).catch(console.error);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await StorageService.triggerSync();
      setSyncQueueCount(StorageService.getSyncQueue().filter(i => i.status === 'pending').length);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleOpenSendPrescription = (pharmacyId?: number) => {
    setSendPrescriptionPharmacyId(pharmacyId);
    setIsSendPrescriptionOpen(true);
  };

  const handleOrderCreated = (order: PrescriptionOrder) => {
    StorageService.savePrescriptionOrder(order);
    setPrescriptionOrders([order, ...prescriptionOrders]);
    setSyncQueueCount(StorageService.getSyncQueue().filter(i => i.status === 'pending').length);
  };

  // Filtered visits
  const filteredVisits = visits.filter((v) => {
    const matchesSearch =
      `${v.patient.firstName} ${v.patient.lastName} ${v.patient.village} ${v.chiefComplaint}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesTriage = triageFilter === 'ALL' || v.triageLevel === triageFilter;

    return matchesSearch && matchesTriage;
  });

  const reviewedVisits = visits.filter((v) => v.status === 'reviewed' && v.doctorReview);
  const emergencyCount = visits.filter((v) => v.triageLevel === 'EMERGENCY').length;
  const pendingCount = visits.filter((v) => v.status === 'submitted_to_doctor').length;
  const reviewedCount = reviewedVisits.length;

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 text-slate-900 flex flex-col font-sans pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
      {/* Top Header */}
      <Header
        onOpenProfile={() => setIsProfileOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingSyncCount={syncQueueCount}
        onSync={handleSync}
        isSyncing={isSyncing}
        nurseProfile={nurseProfile}
        counts={{
          visits: visits.length,
          reviews: reviewedCount,
          medicines: medicinesCount,
          patients: patients.length,
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 space-y-6 overflow-x-hidden">
        {/* TAB 1: VISITS (Ko'riklar) */}
        {activeTab === 'visits' && (
          <div className="space-y-6">
            {/* Top Action Bar & Stat Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Big New Visit Action Card */}
              <div className="md:col-span-2 p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
                    <Activity className="w-4 h-4" />
                    <span>Birlamchi tibbiy ko‘rik</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Yangi bemorni ko‘rikdan o‘tkazish
                  </h2>
                  <p className="text-xs text-slate-700 mt-1 max-w-md">
                    Hayotiy ko‘rsatkichlarni o‘lchash, dinamik anamnez yig‘ish va avtomatlashtirilgan Red Flag tahlili.
                  </p>
                </div>

                <div className="mt-4 pt-3 flex items-center justify-between">
                  <button
                    onClick={() => setIsNewVisitOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold tracking-wide transition shadow-md flex items-center space-x-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>QABULNI BOSHLASH</span>
                  </button>
                  <span className="text-[11px] text-slate-600 font-mono">
                    Protokol: KM-TR-2026
                  </span>
                </div>
              </div>

              {/* Stat 1: Emergency */}
              <div className="p-4 rounded-2xl bg-slate-100/90 border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-600">
                  <span>Shoshilinch holatlar</span>
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                </div>
                <div className="my-2">
                  <span className="text-3xl font-extrabold text-red-600 font-mono tracking-tight">
                    {emergencyCount}
                  </span>
                  <span className="text-xs text-slate-500 ml-1.5">bemor</span>
                </div>
                <p className="text-[11px] text-slate-600 border-t border-slate-200 pt-1.5">
                  1-darajali tezkor nazoratda
                </p>
              </div>

              {/* Stat 2: Reviewed */}
              <div className="p-4 rounded-2xl bg-slate-100/90 border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-600">
                  <span>Shifokor xulosalari</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="my-2">
                  <span className="text-3xl font-extrabold text-emerald-600 font-mono tracking-tight">
                    {reviewedCount}
                  </span>
                  <span className="text-xs text-slate-500 ml-1.5">kelib tushgan</span>
                </div>
                <p className="text-[11px] text-slate-600 border-t border-slate-200 pt-1.5">
                  Retsept va yo‘llanmalar tayyor
                </p>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Bemor F.I.SH, qishlog‘i yoki shikoyati bo‘yicha izlash..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Triage Level Filter pills */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: 'ALL', label: 'Barchasi' },
                  { id: 'EMERGENCY', label: 'Shoshilinch' },
                  { id: 'HIGH', label: 'Yuqori xavf' },
                  { id: 'MODERATE', label: 'O‘rta xavf' },
                  { id: 'LOW', label: 'Past xavf' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setTriageFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                      triageFilter === f.id
                        ? 'bg-blue-600 border-blue-500 text-slate-900'
                        : 'bg-white border-slate-200 text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Visits List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 uppercase tracking-wider px-1">
                <span>Ko‘rikdan o‘tgan bemorlar ro‘yxati ({filteredVisits.length})</span>
                <span>Standart Manchester Triage protokoli</span>
              </div>

              {filteredVisits.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200 space-y-3">
                  <Activity className="w-10 h-10 text-slate-400 mx-auto" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800">
                      {visits.length === 0 ? "Hozircha ko‘riklar ro‘yxati bo‘sh" : "Hech qanday ko‘rik topilmadi"}
                    </p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      {visits.length === 0
                        ? "Yangi bemor kelganda birlamchi ko‘rikni boshlash uchun quyidagi tugmani bosing."
                        : "Qidiruv parametrlarini o‘zgartirib ko‘ring"}
                    </p>
                  </div>
                  {visits.length === 0 && (
                    <button
                      onClick={() => setIsNewVisitOpen(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition cursor-pointer inline-flex items-center space-x-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Yangi qabulni boshlash</span>
                    </button>
                  )}
                </div>
              ) : (
                filteredVisits.map((visit) => {
                  const { patient, vitals, triageLevel, status, doctorReview } = visit;
                  return (
                    <div
                      key={visit.id}
                      onClick={() => setSelectedVisit(visit)}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition cursor-pointer shadow-sm hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      {/* Left: Patient and Complaint */}
                      <div className="flex items-start space-x-3.5 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 font-bold flex items-center justify-center shrink-0 border border-slate-300">
                          {patient.firstName[0]}
                          {patient.lastName[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                              {patient.lastName} {patient.firstName} {patient.patronymic}
                            </h3>
                            <span className="text-xs text-slate-600 font-medium">
                              ({patient.age} yosh, {patient.gender === 'male' ? 'Erkak' : 'Ayol'})
                            </span>
                            <span className="text-[10px] font-mono bg-white px-1.5 py-0.2 rounded text-slate-500 border border-slate-200">
                              {patient.code}
                            </span>
                            <TriageBadge level={triageLevel} size="sm" />
                          </div>

                          <p className="text-xs text-slate-700 font-medium mt-1">
                            <span className="text-slate-500">Shikoyat:</span> {visit.chiefComplaint}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600">
                            <span>{patient.village}</span>
                            <span>•</span>
                            <span>Ko‘rik vaqti: {visit.visitDate}</span>
                            <span>•</span>
                            <span>Yo‘naltirildi: <strong className="text-slate-700">{visit.targetSpecialty}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Middle: Key Vitals Mini Grid */}
                      <div className="grid grid-cols-4 gap-2 bg-white/90 p-2.5 rounded-xl border border-slate-200 shrink-0 text-center font-mono text-xs">
                        <div>
                          <span className="text-[9px] text-slate-500 uppercase block">AQB</span>
                          <span className={`font-bold ${vitals.systolicBP >= 160 ? 'text-red-600' : 'text-slate-800'}`}>
                            {vitals.systolicBP}/{vitals.diastolicBP}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 uppercase block">Puls</span>
                          <span className={`font-bold ${vitals.pulseRate > 100 ? 'text-amber-400' : 'text-slate-800'}`}>
                            {vitals.pulseRate}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 uppercase block">SpO2</span>
                          <span className={`font-bold ${vitals.spo2 < 95 ? 'text-red-600' : 'text-slate-800'}`}>
                            {vitals.spo2}%
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 uppercase block">Harorat</span>
                          <span className={`font-bold ${vitals.temperature >= 38.0 ? 'text-amber-400' : 'text-slate-800'}`}>
                            {vitals.temperature}°C
                          </span>
                        </div>
                      </div>

                      {/* Right: Review Status & Action */}
                      <div className="flex items-center justify-between md:justify-end space-x-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-200">
                        {status === 'reviewed' ? (
                          <div className="text-right">
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-emerald-950/60 text-emerald-600 border border-emerald-800/40 text-xs font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Xulosa berilgan</span>
                            </span>
                            <p className="text-[10px] text-slate-600 mt-0.5 font-mono truncate max-w-[140px]">
                              {doctorReview?.doctorName}
                            </p>
                          </div>
                        ) : (
                          <div className="text-right">
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-amber-950/50 text-amber-400 border border-amber-800/40 text-xs font-semibold">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Kutilmoqda</span>
                            </span>
                            <p className="text-[10px] text-slate-500 mt-0.5">Navbatchi guruhda</p>
                          </div>
                        )}

                        <div className="p-2 rounded-lg bg-slate-200 text-slate-600 group-hover:text-slate-900">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: DOCTOR REVIEWS (Shifokor xulosalari) */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Markaziy shifoxonadan kelib tushgan klinik xulosalar
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Shifokor tomonidan tasdiqlangan tashxislar, dori retseptlari va bemorga ko‘rsatmalar
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {reviewedVisits.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-800">Shifokor xulosalari hozircha mavjud emas</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Bemorlar birlamchi ko‘rikdan o‘tkazilib shifokorga yuborilgach, markaziy mutaxassis xulosalari va retseptlari bu yerda ko‘rinadi.
                  </p>
                </div>
              ) : (
                reviewedVisits.map((vis) => {
                  const doc = vis.doctorReview!;
                  return (
                    <div
                      key={vis.id}
                      className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 shadow-sm"
                    >
                      {/* Top doctor info */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-lg bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold border border-emerald-800/40">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{doc.doctorName}</p>
                            <p className="text-xs text-slate-600">
                              {doc.specialty} • {doc.clinicName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-xs">
                          <span className="text-slate-600">Tekshirilgan vaqt:</span>
                          <span className="font-mono text-slate-800">{doc.reviewedAt}</span>
                        </div>
                      </div>

                      {/* Patient Context */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div>
                          <span className="text-slate-600">Bemor:</span>{' '}
                          <strong className="text-slate-900 text-sm">
                            {vis.patient.lastName} {vis.patient.firstName}
                          </strong>{' '}
                          ({vis.patient.age} yosh, {vis.patient.village})
                        </div>
                        <TriageBadge level={vis.triageLevel} size="sm" />
                      </div>

                      {/* Clinical Diagnosis */}
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-600 block mb-1">
                          Klinik tashxis:
                        </span>
                        <p className="text-sm font-bold text-slate-900">{doc.diagnosisText}</p>
                        <p className="text-xs font-mono text-emerald-600 mt-0.5">XKT-10 kodi: {doc.icd10Code}</p>
                      </div>

                      {/* Treatment plan */}
                      <div className="text-xs space-y-1">
                        <span className="font-bold text-slate-700 uppercase text-[10px] block">
                          Davolash rejasi va muolajalar:
                        </span>
                        <p className="bg-white p-3 rounded-lg border border-slate-200 text-slate-800 leading-relaxed">
                          {doc.treatmentPlan}
                        </p>
                      </div>

                      {/* Prescriptions summary */}
                      {doc.prescriptions.length > 0 && (
                        <div>
                          <span className="font-bold text-slate-700 uppercase text-[10px] block mb-1.5">
                            Tayinlangan dori vositalari ({doc.prescriptions.length} ta preparat):
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {doc.prescriptions.map((pr, i) => (
                              <div key={i} className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs">
                                <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                                  <Pill className="w-3.5 h-3.5 text-blue-600" />
                                  <span>{pr.medicationName}</span>
                                </div>
                                <p className="text-slate-600 text-[11px] mt-1">{pr.dosage}</p>
                                <p className="text-slate-600 text-[11px]">{pr.frequency}</p>
                                <p className="text-emerald-600 text-[11px] font-medium mt-0.5">Muddati: {pr.duration}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action footer */}
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => setSelectedVisit(vis)}
                          className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-xs font-semibold text-slate-800 transition cursor-pointer flex items-center space-x-1.5"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>To‘liq ko‘rik varaqasini ochish</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 3: PATIENTS REGISTRY (Bemorlar) */}
        {activeTab === 'patients' && (
          <div className="space-y-6">
            
            {/* Hamshira Profil Kartasi */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm relative">
              <button 
                onClick={() => setIsProfileOpen(true)}
                className="absolute top-4 right-4 p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                title="Profilni tahrirlash"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
              </button>
              
              <div className="flex items-start space-x-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center border-2 border-emerald-200">
                  <User className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{nurseProfile?.fullName || 'Ism kiritilmagan'}</h2>
                  <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                    <Building className="w-4 h-4" />
                    {nurseProfile?.facility || 'Muassasa kiritilmagan'}
                  </p>
                  <p className="text-sm font-medium text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    {nurseProfile?.region || 'Viloyat kiritilmagan'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                  Bemorlar registri
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hudud bo'yicha hisobda turuvchi aholi kartotekasi ({patients.length} ta)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {patients.length === 0 ? (
                <div className="col-span-full py-8 text-center text-slate-600 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  Hozircha bemorlar yo'q
                </div>
              ) : (
                patients.map((p) => (
                  <div
                    key={p.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">
                          {p.lastName} {p.firstName} {p.patronymic}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">
                          {p.age} yosh ({p.birthDate}) • {p.gender === 'male' ? 'Erkak' : 'Ayol'}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono bg-slate-100 px-2.5 py-1 rounded-lg text-slate-600 font-bold">
                        {p.code}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                      <p className="flex items-center space-x-2">
                        <Phone className="w-3.5 h-3.5 text-slate-600" />
                        <span>{p.phone}</span>
                      </p>
                      <p className="flex items-center space-x-2">
                        <Building className="w-3.5 h-3.5 text-slate-600" />
                        <span>{p.village}, {p.address}</span>
                      </p>
                    </div>

                    {p.chronicConditions && p.chronicConditions.length > 0 && (
                      <div className="pt-3 border-t border-slate-100 text-xs">
                        <span className="text-[10px] font-bold text-slate-600 uppercase block mb-1.5">
                          Surunkali kasalliklar:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {p.chronicConditions.map((cond, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 rounded bg-amber-50 text-[11px] font-semibold text-amber-600 border border-amber-100"
                            >
                              {cond}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {p.allergies && p.allergies.length > 0 && (
                      <div className="text-xs pt-1">
                        <span className="text-[10px] font-bold text-slate-600 uppercase block mb-1.5">
                          Allergik anamnez:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {p.allergies.map((all, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 rounded bg-red-50 border border-red-100 text-[11px] font-semibold text-red-600"
                            >
                              {all}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: PHARMACIES & MEDICINES INVENTORY */}
        {activeTab === 'pharmacies' && (
          <PharmaciesTab
            pharmacies={pharmacies}
            prescriptionOrders={prescriptionOrders}
            reviewedVisits={reviewedVisits}
            onOpenSendPrescription={handleOpenSendPrescription}
            nurseProfile={nurseProfile}
            patients={patients}
            onMedicinesCountChange={setMedicinesCount}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200/80 py-4 text-center text-xs text-slate-500 hidden md:block">
        <p>QishloqMed AI • Birlamchi tibbiy yordam va klinik saralash platformasi (FAP / OSHP)</p>
        <p className="text-[11px] text-slate-600 mt-0.5">Xavfsizlik standarti: Klinik qaror faqat shifokor tomonidan qabul qilinadi</p>
      </footer>

      {/* Modals */}
      <NewVisitModal
        isOpen={isNewVisitOpen}
        onClose={() => setIsNewVisitOpen(false)}
        onSaveVisit={handleSaveVisit}
      />

      <VisitDetailModal
        visit={selectedVisit}
        onClose={() => setSelectedVisit(null)}
      />

      <NurseProfileModal
        currentProfile={nurseProfile}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        isInitialSetup={!nurseProfile || !nurseProfile.fullName || (!nurseProfile.firstName && !nurseProfile.lastName)}
        onSave={(updated) => {
          setNurseProfile(updated);
          StorageService.saveNurseProfile(updated);
          setIsProfileOpen(false);
        }}
      />

      <SendPrescriptionModal
        isOpen={isSendPrescriptionOpen}
        onClose={() => setIsSendPrescriptionOpen(false)}
        pharmacies={pharmacies}
        selectedPharmacyId={sendPrescriptionPharmacyId}
        reviewedVisits={reviewedVisits}
        onOrderCreated={handleOrderCreated}
      />

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewVisit={() => setIsNewVisitOpen(true)}
        pendingReviewsCount={reviewedVisits.length}
        pharmaciesCount={pharmacies.length}
      />
    </div>
  );
}

export default App;

