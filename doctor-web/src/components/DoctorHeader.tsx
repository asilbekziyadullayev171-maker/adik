import React from 'react';
import type { DoctorProfile } from '../types';
import { 
  Activity, 
  Stethoscope, 
  RefreshCw, 
  CheckCircle2, 
  Database, 
  Sliders, 
  Building2, 
  FileCheck2,
  Users,
  MapPin
} from 'lucide-react';

interface Props {
  activeTab: 'queue' | 'history' | 'pharmacies' | 'patients';
  setActiveTab: (tab: 'queue' | 'history' | 'pharmacies' | 'patients') => void;
  pendingCount: number;
  criticalCount: number;
  completedCount: number;
  onRefresh: () => void;
  isLoading: boolean;
  doctorProfile: DoctorProfile;
  onOpenProfileModal: () => void;
}

export const DoctorHeader: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  pendingCount,
  criticalCount,
  completedCount,
  onRefresh,
  isLoading,
  doctorProfile,
  onOpenProfileModal,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs print:hidden">
      {/* Top hospital info bar */}
      <div className="bg-slate-900 text-white text-xs px-4 sm:px-6 py-1.5 flex justify-between items-center">
        <div className="flex items-center space-x-3 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="font-semibold text-emerald-400 flex items-center shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse" />
            O'zbekiston Respublikasi SSV
          </span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-slate-300 hidden sm:inline truncate">
            {doctorProfile.region ? `${doctorProfile.region}${doctorProfile.district ? `, ${doctorProfile.district}` : ''} • ` : ''}
            {doctorProfile.organization || 'Tuman Markaziy Shifoxonasi'} • Telemeditsina Markazi
          </span>
        </div>
        <div className="flex items-center space-x-3 text-[11px] text-slate-300 shrink-0">
          <span className="flex items-center text-slate-300">
            <Database className="w-3.5 h-3.5 mr-1 text-sky-400" />
            <span className="hidden md:inline">Tizim: </span>Onlayn • Faol
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-slate-300 hidden sm:inline">AI: Gemini 3.1 Flash</span>
        </div>
      </div>

      {/* Main doctor header bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 bg-teal-800 text-white rounded-xl flex items-center justify-center shadow-xs">
            <Stethoscope className="w-6 h-6 text-teal-200" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">QishloqMed</h1>
              <span className="bg-teal-50 text-teal-800 text-[11px] font-bold px-2 py-0.5 rounded-md border border-teal-200">
                Shifokor Telemeditsina Portali
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
              Qishloq vrachlik punktlaridan (QVP) kelayotgan triaj navbati, fotosuratlar va masofaviy retseptlar
            </p>
          </div>
        </div>

        {/* Doctor profile card & action buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer border border-slate-300/80 shadow-2xs"
            title="Ma'lumotlarni yangilash"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-600' : ''}`} />
            <span className="hidden sm:inline">Yangilash</span>
          </button>

          {/* Interactive Doctor Profile & Specialty Card */}
          <div
            onClick={onOpenProfileModal}
            className="group flex items-center space-x-3 bg-linear-to-r from-teal-50/80 via-white to-slate-50 border border-teal-200/90 hover:border-teal-400 rounded-xl p-1.5 pr-3 shadow-2xs hover:shadow-xs transition cursor-pointer"
            title="Soha va profilni o'zgartirish"
          >
            <div className="w-9 h-9 rounded-lg bg-teal-700 text-white font-bold flex items-center justify-center text-xs shadow-xs group-hover:scale-105 transition">
              {(() => {
                const parts = (doctorProfile.fullName || 'Dr. Shifokor')
                  .replace(/^Dr\.\s*/i, '')
                  .trim()
                  .split(/\s+/);
                return (
                  parts.length >= 2 
                    ? `${parts[0][0]}${parts[1][0]}` 
                    : (parts[0]?.[0] || 'DR')
                ).toUpperCase();
              })()}
            </div>
            <div className="text-left">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold text-slate-900 group-hover:text-teal-900 transition">
                  {doctorProfile.fullName}
                </span>
                <span className="text-[10px] text-teal-700 group-hover:underline font-semibold flex items-center">
                  <Sliders className="w-2.5 h-2.5 ml-0.5 text-teal-600" />
                </span>
              </div>
              <div className="text-[11px] font-semibold text-teal-800 line-clamp-1 max-w-[200px]">
                {doctorProfile.specialty}
              </div>
              {(doctorProfile.region || doctorProfile.district) && (
                <div className="text-[10px] text-slate-500 line-clamp-1 max-w-[200px] flex items-center mt-0.5">
                  <MapPin className="w-2.5 h-2.5 mr-1 text-teal-600 shrink-0" />
                  <span>{[doctorProfile.district, doctorProfile.region].filter(Boolean).join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center border-t border-slate-100 overflow-x-auto">
        <nav className="flex space-x-1 -mb-px shrink-0">
          {/* Tab 1: Live Triage Queue */}
          <button
            onClick={() => setActiveTab('queue')}
            className={`py-3 px-4 text-xs font-medium border-b-2 flex items-center space-x-2 transition cursor-pointer shrink-0 ${
              activeTab === 'queue'
                ? 'border-teal-700 text-teal-800 font-bold bg-teal-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Activity className="w-4 h-4 text-teal-600" />
            <span>Klinik Triaj Navbati</span>
            {pendingCount > 0 && (
              <span className="bg-teal-700 text-white text-[11px] font-bold px-2 py-0.2 rounded-full shadow-2xs">
                {pendingCount}
              </span>
            )}
          </button>

          {/* Tab 2: Serviced Patients & Diagnoses (NEW) */}
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-4 text-xs font-medium border-b-2 flex items-center space-x-2 transition cursor-pointer shrink-0 ${
              activeTab === 'history'
                ? 'border-teal-700 text-teal-800 font-bold bg-teal-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <FileCheck2 className="w-4 h-4 text-emerald-600" />
            <span>Xizmat Ko'rsatilganlar & Tashxislar</span>
            {completedCount > 0 && (
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.2 rounded-full border border-emerald-300">
                {completedCount}
              </span>
            )}
          </button>

          {/* Tab 3: Rural Pharmacies & Stock */}
          <button
            onClick={() => setActiveTab('pharmacies')}
            className={`py-3 px-4 text-xs font-medium border-b-2 flex items-center space-x-2 transition cursor-pointer shrink-0 ${
              activeTab === 'pharmacies'
                ? 'border-teal-700 text-teal-800 font-bold bg-teal-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Building2 className="w-4 h-4 text-slate-500" />
            <span>Qishloq Dorixonalari & Zaxiralar</span>
          </button>

          {/* Tab 4: Patients Registry (EHR) */}
          <button
            onClick={() => setActiveTab('patients')}
            className={`py-3 px-4 text-xs font-medium border-b-2 flex items-center space-x-2 transition cursor-pointer shrink-0 ${
              activeTab === 'patients'
                ? 'border-teal-700 text-teal-800 font-bold bg-teal-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Users className="w-4 h-4 text-slate-500" />
            <span>Bemorlar Reestri (EHR)</span>
          </button>
        </nav>

        {/* Quick status counter summary */}
        <div className="hidden lg:flex items-center space-x-4 text-xs py-2 shrink-0">
          {criticalCount > 0 && (
            <div className="flex items-center space-x-1.5 text-rose-800 font-bold bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-300 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
              <span>{criticalCount} ta Shoshilinch (Qizil)</span>
            </div>
          )}
          <div className="flex items-center space-x-1.5 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{completedCount} ta yakunlangan</span>
          </div>
        </div>
      </div>
    </header>
  );
};
