import React from 'react';
import {
  Stethoscope,
  PhoneCall,
  RefreshCw,
  Building,
  Wifi,
  WifiOff
} from 'lucide-react';
import { CURRENT_NURSE } from '../data/mockData';

interface HeaderProps {
  onOpenProfile: () => void;
  activeTab: 'visits' | 'patients' | 'reviews' | 'pharmacies';
  setActiveTab: (tab: 'visits' | 'patients' | 'reviews' | 'pharmacies') => void;
  pendingSyncCount?: number;
  onSync?: () => void;
  isSyncing?: boolean;
  nurseProfile?: any;
  counts?: {
    visits?: number;
    reviews?: number;
    medicines?: number;
    patients?: number;
  };
}

export const Header: React.FC<HeaderProps> = ({
  onOpenProfile,
  activeTab,
  setActiveTab,
  pendingSyncCount = 0,
  onSync,
  isSyncing = false,
  nurseProfile,
  counts
}) => {
  const currentName = nurseProfile?.fullName || CURRENT_NURSE.fullName;
  const currentFacility = nurseProfile?.facility || CURRENT_NURSE.assignedFacility?.name || 'Birlamchi tibbiyot punkti';
  const initials = currentName
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <header className="bg-white text-slate-900 border-b border-slate-200 sticky top-0 z-30 shadow-sm w-full max-w-full overflow-x-hidden">
      {/* Top institution bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between h-16 w-full min-w-0">
          {/* Logo & Facility */}
          <div className="flex items-center space-x-2.5 min-w-0 flex-1 mr-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-inner shrink-0">
              <Stethoscope className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1.5">
                <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 truncate">Shifonuri</span>
                <span className="text-[11px] bg-blue-50 text-blue-700 font-semibold px-1.5 py-0.5 rounded border border-blue-200 shrink-0">
                  Hamshira
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium truncate max-w-[160px] sm:max-w-md">
                {currentFacility}
              </p>
            </div>
          </div>

          {/* Right actions: Sync status, Emergency line & Profile */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
            {/* Offline Sync Indicator / Button */}
            {pendingSyncCount > 0 ? (
              <button
                onClick={onSync}
                disabled={isSyncing}
                className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold hover:bg-amber-200 transition cursor-pointer shrink-0"
                title="Bazada saqlanmagan yozuvlarni serverga yuklash"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Yuklanmoqda...' : `${pendingSyncCount}`}</span>
              </button>
            ) : (
              <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-emerald-700 font-medium">Sinxron</span>
              </div>
            )}

            {/* Emergency Hotline Button */}
            <a
              href="tel:103"
              className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold tracking-wide transition shadow-sm shrink-0"
              title="Shoshilinch tez tibbiy yordam dispetcheri"
            >
              <PhoneCall className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">103 Tezkor</span>
              <span className="sm:hidden">103</span>
            </a>

            {/* Nurse Profile Button */}
            <button
              onClick={onOpenProfile}
              className="flex items-center space-x-2 pl-1.5 sm:pl-2 pr-2 sm:pr-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 transition text-left cursor-pointer shrink-0"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200 shrink-0">
                {initials || 'HN'}
              </div>
              <div className="hidden lg:block min-w-0">
                <p className="text-xs font-semibold text-slate-800 leading-tight truncate">
                  {currentName}
                </p>
                <p className="text-[10px] text-slate-600 leading-none truncate">
                  {nurseProfile?.role || CURRENT_NURSE.role}
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation tabs (Desktop / Tablet) */}
      <div className="hidden md:block bg-slate-100 border-t border-slate-200/80 px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-7xl mx-auto flex space-x-1 sm:space-x-4">
          <button
            onClick={() => setActiveTab('visits')}
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-medium border-b-2 transition flex items-center space-x-2 cursor-pointer ${
              activeTab === 'visits'
                ? 'border-blue-500 text-blue-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-800'
            }`}
          >
            <span>Ko‘riklar</span>
            {typeof counts?.visits === 'number' && counts.visits > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[11px] bg-slate-200 text-slate-700 font-bold border border-slate-300">
                {counts.visits}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-medium border-b-2 transition flex items-center space-x-2 cursor-pointer ${
              activeTab === 'reviews'
                ? 'border-blue-500 text-blue-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-800'
            }`}
          >
            <span>Shifokor xulosalari</span>
            {typeof counts?.reviews === 'number' && counts.reviews > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[11px] bg-emerald-500/20 text-emerald-700 font-bold border border-emerald-500/30">
                {counts.reviews}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('pharmacies')}
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-medium border-b-2 transition flex items-center space-x-2 cursor-pointer ${
              activeTab === 'pharmacies'
                ? 'border-emerald-500 text-emerald-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-800'
            }`}
          >
            <span>Dorilar & Aptechka</span>
            {typeof counts?.medicines === 'number' && counts.medicines > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[11px] bg-emerald-500/20 text-emerald-700 font-bold border border-emerald-500/30">
                {counts.medicines}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('patients')}
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-medium border-b-2 transition flex items-center space-x-2 cursor-pointer ${
              activeTab === 'patients'
                ? 'border-blue-500 text-blue-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-800'
            }`}
          >
            <span>Bemorlar registri</span>
            {typeof counts?.patients === 'number' && counts.patients > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[11px] bg-slate-200 text-slate-700 font-bold border border-slate-300">
                {counts.patients}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
