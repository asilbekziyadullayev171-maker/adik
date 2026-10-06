import { useState, useEffect, useCallback } from 'react';
import type { Visit, Pharmacy, DoctorProfile } from './types';
import { api } from './services/api';
import { DoctorHeader } from './components/DoctorHeader';
import { TriageQueue } from './components/TriageQueue';
import { ServicedPatientsView } from './components/ServicedPatientsView';
import { VisitReviewModal } from './components/VisitReviewModal';
import { PharmaciesView } from './components/PharmaciesView';
import { PatientsView } from './components/PatientsView';
import { DoctorProfileModal } from './components/DoctorProfileModal';

export function App() {
  const [activeTab, setActiveTab] = useState<'queue' | 'history' | 'pharmacies' | 'patients'>('queue');
  const [visits, setVisits] = useState<Visit[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Doctor Profile and Specialty State
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile>(() => api.getDoctorProfile());
  const isInitialSetup = !localStorage.getItem('qishloqmed_profile_setup_v14') || !doctorProfile.region || !doctorProfile.district;
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(() => {
    const prof = api.getDoctorProfile();
    const hasSetup = localStorage.getItem('qishloqmed_profile_setup_v14');
    return !hasSetup || !prof.region || !prof.district;
  });

  // Manual refresh callback
  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!api.getToken()) {
        await api.autoLogin();
      }
      const [queueData, pharData] = await Promise.all([
        api.getQueue(),
        api.getPharmacies(),
      ]);
      setVisits(queueData);
      setPharmacies(pharData);
    } catch (e) {
      console.error('Failed to refresh data:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch and auto-polling
  useEffect(() => {
    let ignore = false;

    async function fetchInitialData() {
      try {
        if (!api.getToken()) {
          await api.autoLogin();
        }
        const [queueData, pharData] = await Promise.all([
          api.getQueue(),
          api.getPharmacies(),
        ]);
        if (!ignore) {
          setVisits(queueData);
          setPharmacies(pharData);
          setIsLoading(false);
        }
      } catch (e) {
        console.error('Failed to load doctor dashboard data:', e);
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    fetchInitialData();

    // Auto poll queue every 25 seconds for new rural patients
    const timer = setInterval(() => {
      api.getQueue().then((data) => {
        if (!ignore) setVisits(data);
      }).catch(console.error);
    }, 25000);

    return () => {
      ignore = true;
      clearInterval(timer);
    };
  }, []);

  // Handle specialty/profile saving
  const handleSaveProfile = (updatedProfile: DoctorProfile) => {
    setDoctorProfile(updatedProfile);
    api.saveDoctorProfile(updatedProfile);
    localStorage.setItem('qishloqmed_profile_setup_v14', 'true');
    setIsProfileModalOpen(false);
  };

  // When a visit is selected, fetch full details including attachments
  const handleSelectVisit = async (visit: Visit) => {
    const full = await api.getVisitDetail(visit.id);
    setSelectedVisit(full || visit);
  };

  const handleVisitUpdated = async () => {
    await handleRefresh();
    if (selectedVisit) {
      const updated = await api.getVisitDetail(selectedVisit.id);
      setSelectedVisit(updated);
    }
  };

  const pendingVisits = visits.filter((v) => v.status !== 'completed');
  const completedVisits = visits.filter((v) => v.status === 'completed');

  const pendingCount = pendingVisits.length;
  const criticalCount = pendingVisits.filter((v) => v.risk_level === 'critical' || v.risk_level === 'high').length;
  const completedCount = completedVisits.length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Hospital Header with doctor profile and tabs */}
      <DoctorHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingCount}
        criticalCount={criticalCount}
        completedCount={completedCount}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        doctorProfile={doctorProfile}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
      />

      {/* Main Workspace View */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex-1">
        {/* Tab 1: Live Triage Queue */}
        {activeTab === 'queue' && (
          <TriageQueue
            visits={visits}
            onSelectVisit={handleSelectVisit}
            isLoading={isLoading}
            doctorProfile={doctorProfile}
          />
        )}

        {/* Tab 2: Serviced Patients & Diagnoses (NEW) */}
        {activeTab === 'history' && (
          <ServicedPatientsView
            completedVisits={completedVisits}
            onOpenVisit={handleSelectVisit}
            doctorProfile={doctorProfile}
          />
        )}

        {/* Tab 3: Rural Pharmacies & Stock */}
        {activeTab === 'pharmacies' && (
          <PharmaciesView pharmacies={pharmacies} />
        )}

        {/* Tab 4: Patients Registry (EHR) */}
        {activeTab === 'patients' && (
          <PatientsView
            visits={visits}
            onSelectVisit={handleSelectVisit}
            doctorProfile={doctorProfile}
          />
        )}
      </main>

      {/* Full Consultation & Clinical Inspection Modal */}
      {selectedVisit && (
        <VisitReviewModal
          visit={selectedVisit}
          pharmacies={pharmacies}
          onClose={() => setSelectedVisit(null)}
          onVisitUpdated={handleVisitUpdated}
        />
      )}

      {/* Doctor Specialty Registration / Profile Modal */}
      <DoctorProfileModal
        key={isProfileModalOpen ? 'open' : 'closed'}
        currentProfile={doctorProfile}
        isOpen={isProfileModalOpen}
        onClose={() => {
          if (!isInitialSetup) {
            setIsProfileModalOpen(false);
          }
        }}
        onSave={handleSaveProfile}
        isInitialSetup={isInitialSetup}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500 print:hidden">
        <p>QishloqMed AI • O'zbekiston Qishloq Sog'liqni Saqlash Telemeditsina Tizimi • 2026</p>
      </footer>
    </div>
  );
}

export default App;
