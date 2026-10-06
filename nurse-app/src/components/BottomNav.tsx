import React from 'react';
import {
  Activity,
  ClipboardCheck,
  Building,
  Users,
  Plus
} from 'lucide-react';

interface BottomNavProps {
  activeTab: 'visits' | 'patients' | 'reviews' | 'pharmacies';
  setActiveTab: (tab: 'visits' | 'patients' | 'reviews' | 'pharmacies') => void;
  onOpenNewVisit: () => void;
  pendingReviewsCount: number;
  pharmaciesCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewVisit,
  pendingReviewsCount,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 pt-2 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Tab 1: Visits */}
        <button
          onClick={() => setActiveTab('visits')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors ${
            activeTab === 'visits'
              ? 'text-blue-600 font-bold'
              : 'text-slate-600 hover:text-slate-600'
          }`}
        >
          <Activity className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Ko'riklar</span>
        </button>

        {/* Tab 2: Reviews */}
        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors relative ${
            activeTab === 'reviews'
              ? 'text-blue-600 font-bold'
              : 'text-slate-600 hover:text-slate-600'
          }`}
        >
          <ClipboardCheck className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Xulosalar</span>
          {pendingReviewsCount > 0 && (
            <span className="absolute top-0.5 right-1 w-2.5 h-2.5 border-2 border-white rounded-full bg-blue-500"></span>
          )}
        </button>

        {/* CENTER ACTION: NEW VISIT FAB */}
        <button
          onClick={onOpenNewVisit}
          className="flex flex-col items-center -mt-6 focus:outline-none"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 border-[3px] border-white active:scale-95 transition-transform">
            <Plus className="w-6 h-6 stroke-[3]" />
          </div>
          <span className="text-[9px] font-bold text-blue-600 mt-1 uppercase tracking-wider">
            Yangi qabul
          </span>
        </button>

        {/* Tab 3: Pharmacies / Medicines */}
        <button
          onClick={() => setActiveTab('pharmacies')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors ${
            activeTab === 'pharmacies'
              ? 'text-emerald-600 font-bold'
              : 'text-slate-600 hover:text-slate-600'
          }`}
        >
          <Building className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Dorilar</span>
        </button>

        {/* Tab 4: Patients */}
        <button
          onClick={() => setActiveTab('patients')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors ${
            activeTab === 'patients'
              ? 'text-blue-600 font-bold'
              : 'text-slate-600 hover:text-slate-600'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Bemorlar</span>
        </button>
      </div>
    </nav>
  );
};
