import React, { useState, useMemo } from 'react';
import type { Visit, DoctorProfile } from '../types';
import { calculateAge } from '../constants';
import { getVisitRegion, getVisitDistrict } from '../data/uzbekistanRegions';
import { 
  AlertTriangle, 
  Search, 
  ChevronRight, 
  Clock, 
  Camera, 
  Heart, 
  Activity, 
  CheckCircle2, 
  SlidersHorizontal,
  Flame,
  UserCheck,
  Stethoscope,
  MapPin,
  Building2,
  Globe,
  Compass,
  Sparkles
} from 'lucide-react';

interface Props {
  visits: Visit[];
  onSelectVisit: (visit: Visit) => void;
  isLoading: boolean;
  doctorProfile?: DoctorProfile;
}

export const TriageQueue: React.FC<Props> = ({ visits, onSelectVisit, isLoading, doctorProfile }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [riskFilter, setRiskFilter] = useState<'all' | 'critical' | 'high' | 'moderate' | 'low'>('all');
  const [specialtyFilter, setSpecialtyFilter] = useState<'all' | 'my'>('all');
  const [onlyWithPhotos, setOnlyWithPhotos] = useState(false);

  // Doctor's assigned location
  const doctorRegion = doctorProfile?.region || 'Samarqand viloyati';
  const doctorDistrict = doctorProfile?.district || '';

  // Regional partition filter: 'my' (default) | 'all' | specific region name
  const [regionFilter, setRegionFilter] = useState<string>('my');
  const [districtFilter, setDistrictFilter] = useState<string>('all');

  // Compute visits count by region
  const regionStats = useMemo(() => {
    const counts = new Map<string, number>();
    visits.forEach((v) => {
      const reg = getVisitRegion(v);
      counts.set(reg, (counts.get(reg) || 0) + 1);
    });
    return counts;
  }, [visits]);

  // All active regions with patients
  const activeRegions = useMemo(() => {
    return Array.from(regionStats.keys()).sort((a, b) => {
      if (a === doctorRegion) return -1;
      if (b === doctorRegion) return 1;
      return (regionStats.get(b) || 0) - (regionStats.get(a) || 0);
    });
  }, [regionStats, doctorRegion]);

  const myRegionCount = regionStats.get(doctorRegion) || 0;

  const currentActiveRegionName = regionFilter === 'my' 
    ? doctorRegion 
    : regionFilter === 'all' 
      ? 'Barcha viloyatlar' 
      : regionFilter;

  // Available districts for currently selected region
  const availableDistricts = useMemo(() => {
    if (regionFilter === 'all') return [];
    const targetReg = regionFilter === 'my' ? doctorRegion : regionFilter;
    const districtsSet = new Set<string>();
    visits.forEach((v) => {
      if (getVisitRegion(v) === targetReg) {
        districtsSet.add(getVisitDistrict(v));
      }
    });
    return Array.from(districtsSet);
  }, [regionFilter, doctorRegion, visits]);

  // Check if a visit matches current doctor's specialty
  const isDoctorSpecialtyMatch = (visit: Visit): boolean => {
    if (!doctorProfile) return true;
    if (doctorProfile.specialtyCode === 'general_physician') return true;
    const vSpec = (visit.targetSpecialty || visit.target_specialty || '').toLowerCase();
    const docSpec = doctorProfile.specialty.toLowerCase();
    const docKeyword = docSpec.split(' ')[0]; // 'kardiolog', 'nevropatolog', etc.
    return vSpec.includes(docKeyword);
  };

  // Filter visits by all criteria
  const filteredVisits = visits.filter((v) => {
    // 1. Regional filter
    const visitReg = getVisitRegion(v);
    const visitDist = getVisitDistrict(v);

    let matchesRegion = true;
    if (regionFilter === 'my') {
      matchesRegion = Boolean(!doctorRegion || visitReg.toLowerCase() === doctorRegion.toLowerCase());
    } else if (regionFilter !== 'all') {
      matchesRegion = visitReg.toLowerCase() === regionFilter.toLowerCase();
    }

    // 2. District filter
    const matchesDistrict = districtFilter === 'all' ? true : visitDist === districtFilter;

    // 3. Search query
    const patientName = `${v.patient?.first_name || v.patient_first_name || ''} ${v.patient?.last_name || v.patient_last_name || ''}`.toLowerCase();
    const complaint = (v.chief_complaint || '').toLowerCase();
    const query = searchTerm.toLowerCase();
    const matchesSearch = !query || patientName.includes(query) || complaint.includes(query);

    // 4. Status
    const matchesStatus = statusFilter === 'all' 
      ? true 
      : statusFilter === 'completed' 
        ? v.status === 'completed' 
        : v.status !== 'completed';

    // 5. Risk
    const matchesRisk = riskFilter === 'all' ? true : v.risk_level === riskFilter;

    // 6. Specialty filter
    const matchesSpecialty = specialtyFilter === 'all' ? true : isDoctorSpecialtyMatch(v);

    // 7. Photos
    const hasAttachments = v.attachments && v.attachments.length > 0;
    const matchesPhotos = !onlyWithPhotos || hasAttachments;

    return matchesRegion && matchesDistrict && matchesSearch && matchesStatus && matchesRisk && matchesSpecialty && matchesPhotos;
  });

  const getUrgencyBadge = (risk?: string, _urgency?: number) => {
    switch (risk) {
      case 'critical':
      case 'high':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <Flame className="w-3 h-3 mr-1 text-rose-600" />
            1-Daraja • Shoshilinch (Qizil)
          </span>
        );
      case 'moderate':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" />
            2-Daraja • O'rtacha (Sariq)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
            3-Daraja • Rejali (Yashil)
          </span>
        );
    }
  };

  const getUrgencyBorder = (risk?: string) => {
    switch (risk) {
      case 'critical':
      case 'high':
        return 'border-l-4 border-l-rose-500 hover:border-l-rose-600';
      case 'moderate':
        return 'border-l-4 border-l-amber-500 hover:border-l-amber-600';
      default:
        return 'border-l-4 border-l-emerald-500 hover:border-l-emerald-600';
    }
  };

  const formatVisitTime = (dateStr?: string) => {
    if (!dateStr) return 'Bugun';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Regional Partition & Triage Distribution Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4 text-teal-700" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Viloyatlar Bo'yicha Bemorlar Taqsimoti</span>
                <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 uppercase tracking-wider">
                  Hududiy Saralash
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Hamshiralar kiritgan murojaatlar viloyatlar kesimida saralanadi
              </p>
            </div>
          </div>

          {doctorRegion && (
            <div className="flex items-center space-x-1.5 text-xs bg-teal-50/60 border border-teal-200 px-3 py-1.5 rounded-xl">
              <span className="text-slate-600 text-[11px]">Sizning hududingiz:</span>
              <strong className="text-teal-900 flex items-center font-bold">
                <MapPin className="w-3 h-3 mr-0.5 text-teal-600" />
                {doctorRegion}
                {doctorDistrict ? `, ${doctorDistrict}` : ''}
              </strong>
            </div>
          )}
        </div>

        {/* Region selection pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {/* Option 1: Doctor's assigned region (DEFAULT) */}
          <button
            onClick={() => {
              setRegionFilter('my');
              setDistrictFilter('all');
            }}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
              regionFilter === 'my'
                ? 'bg-teal-700 text-white shadow-sm ring-2 ring-teal-600/30'
                : 'bg-teal-50/80 hover:bg-teal-100 text-teal-900 border border-teal-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Mening hududim ({doctorRegion || 'Samarqand'})</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                regionFilter === 'my' ? 'bg-white text-teal-800' : 'bg-teal-700 text-white'
              }`}
            >
              {myRegionCount}
            </span>
          </button>

          {/* Option 2: All regions nationwide */}
          <button
            onClick={() => {
              setRegionFilter('all');
              setDistrictFilter('all');
            }}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition shrink-0 cursor-pointer ${
              regionFilter === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Barcha viloyatlar (Respublika)</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                regionFilter === 'all' ? 'bg-white text-slate-900' : 'bg-slate-300 text-slate-800'
              }`}
            >
              {visits.length}
            </span>
          </button>

          {/* Other individual active regions */}
          {activeRegions
            .filter((reg) => reg !== doctorRegion)
            .map((reg) => {
              const count = regionStats.get(reg) || 0;
              const isSelected = regionFilter === reg;

              return (
                <button
                  key={reg}
                  onClick={() => {
                    setRegionFilter(reg);
                    setDistrictFilter('all');
                  }}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium transition shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-teal-700 text-white font-bold shadow-xs'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{reg}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isSelected ? 'bg-white text-teal-800' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
        </div>

        {/* Sub-toolbar: Active region status and district pills */}
        {regionFilter !== 'all' && (
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-700">
                📍 {currentActiveRegionName}:
              </span>
              {regionFilter === 'my' ? (
                <span className="text-[11px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded flex items-center">
                  <Sparkles className="w-3 h-3 mr-1 text-teal-600" />
                  Sizning biriktirilgan viloyatingiz
                </span>
              ) : (
                <span className="text-[11px] text-slate-500">
                  Boshqa viloyat telemeditsina murojaatlari
                </span>
              )}
            </div>

            {availableDistricts.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <span className="text-slate-500 text-[11px]">Tuman/Shahar:</span>
                <button
                  onClick={() => setDistrictFilter('all')}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition cursor-pointer ${
                    districtFilter === 'all'
                      ? 'bg-teal-700 text-white'
                      : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  Barchasi
                </button>
                {availableDistricts.map((dist) => (
                  <button
                    key={dist}
                    onClick={() => setDistrictFilter(dist)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition cursor-pointer ${
                      districtFilter === dist
                        ? 'bg-teal-700 text-white font-bold'
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    {dist}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Search and Filter toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Bemor F.I.Sh yoki shikoyat bo'yicha qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
            />
          </div>

          <button
            onClick={() => setOnlyWithPhotos(!onlyWithPhotos)}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition cursor-pointer ${
              onlyWithPhotos
                ? 'bg-teal-50 border-teal-500 text-teal-800 font-semibold'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-teal-600" />
            <span>Faqat Rasm/EKG borlar</span>
          </button>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 flex items-center mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1" /> Saralash:
          </span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1.5 rounded-md font-medium cursor-pointer ${
              statusFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Barchasi ({filteredVisits.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-2.5 py-1.5 rounded-md font-medium cursor-pointer ${
              statusFilter === 'pending' ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Kutilmoqda
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-2.5 py-1.5 rounded-md font-medium cursor-pointer ${
              statusFilter === 'completed' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tasdiqlangan
          </button>

          <div className="h-5 w-px bg-slate-200 mx-1" />

          <button
            onClick={() => setRiskFilter(riskFilter === 'critical' ? 'all' : 'critical')}
            className={`px-2.5 py-1.5 rounded-md font-medium cursor-pointer ${
              riskFilter === 'critical' ? 'bg-rose-700 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            Qizil (Shoshilinch)
          </button>

          {doctorProfile && doctorProfile.specialtyCode !== 'general_physician' && (
            <>
              <div className="h-5 w-px bg-slate-200 mx-1" />
              <button
                onClick={() => setSpecialtyFilter(specialtyFilter === 'my' ? 'all' : 'my')}
                className={`px-2.5 py-1.5 rounded-md font-medium cursor-pointer flex items-center space-x-1.5 ${
                  specialtyFilter === 'my'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200'
                }`}
                title="Faqat o'zingizning mutaxassisligingizga yo'naltirilgan bemorlarni ko'rish"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Mening soham ({doctorProfile.specialty.split(' ')[0]})</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 3. Queue List Cards */}
      {isLoading ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Navbatdagi ko'riklar yuklanmoqda...</p>
        </div>
      ) : filteredVisits.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200 text-slate-500">
          <UserCheck className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">Ko'riklar topilmadi</p>
          <p className="text-xs text-slate-400 mt-1">
            {regionFilter === 'my'
              ? `${doctorRegion} bo'yicha hozircha navbatda bemor mavjud emas. Boshqa viloyatlarni ko'rish uchun "Barcha viloyatlar" tugmasini bosing.`
              : "Belgilangan filtrlar bo'yicha murojaat mavjud emas."}
          </p>
          {regionFilter === 'my' && (
            <button
              onClick={() => setRegionFilter('all')}
              className="mt-3 px-4 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-xs font-semibold border border-teal-200 transition cursor-pointer"
            >
              Barcha viloyatlar navbatini ko'rish ({visits.length})
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredVisits.map((visit) => {
            const patientName = `${visit.patient?.first_name || visit.patient_first_name || 'Bemor'} ${visit.patient?.last_name || visit.patient_last_name || ''}`;
            const visitRegion = getVisitRegion(visit);
            const visitDistrict = getVisitDistrict(visit);
            const isMyRegionPatient = Boolean(
              doctorRegion && visitRegion.toLowerCase() === doctorRegion.toLowerCase()
            );
            const vitals = visit.vital_signs || visit.vitals;
            const attachmentsCount = visit.attachments?.length || 0;
            const isMatch = isDoctorSpecialtyMatch(visit);

            return (
              <div
                key={visit.id}
                onClick={() => onSelectVisit(visit)}
                className={`bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:shadow-md transition cursor-pointer ${getUrgencyBorder(
                  visit.risk_level
                )}`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Patient info & complaint */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {getUrgencyBadge(visit.risk_level, visit.urgency)}
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatVisitTime(visit.visit_date)}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      
                      {/* Region & District Badge */}
                      {isMyRegionPatient ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-teal-100 text-teal-900 border border-teal-300">
                          <MapPin className="w-3 h-3 mr-1 text-teal-700" />
                          {visitRegion}, {visitDistrict}
                          <span className="ml-1.5 bg-teal-700 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider">
                            Mening hududim
                          </span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          <MapPin className="w-3 h-3 mr-1 text-slate-500" />
                          {visitRegion}, {visitDistrict}
                        </span>
                      )}

                      {visit.facility && (
                        <>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-500 flex items-center">
                            <Building2 className="w-3 h-3 mr-1 text-slate-400" />
                            {visit.facility}
                          </span>
                        </>
                      )}

                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        Yo'naltirilgan: <strong>{visit.targetSpecialty || visit.target_specialty || "Umumiy amaliyot"}</strong>
                      </span>
                      {isMatch && doctorProfile?.specialtyCode !== 'general_physician' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-300">
                          ✓ Sohangizga mos
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline space-x-3">
                      <h3 className="text-base font-bold text-slate-900">{patientName}</h3>
                      {visit.patient?.gender && (
                        <span className="text-xs text-slate-500">
                          {visit.patient.gender === 'male' ? 'Erkak' : 'Ayol'},{' '}
                          {visit.patient.date_of_birth ? `${calculateAge(visit.patient.date_of_birth) ?? ''} yosh` : ''}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <span className="font-semibold text-slate-900">Shikoyat: </span>
                      {visit.chief_complaint || 'Klinik ko\'rik'}
                    </p>
                  </div>

                  {/* Middle: Vitals & Attachments info */}
                  <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    {/* Vitals summary if recorded */}
                    {vitals && (
                      <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs">
                        {vitals.systolic_bp && (
                          <span className={`font-semibold ${vitals.systolic_bp > 140 ? 'text-rose-700 font-bold' : 'text-slate-800'}`}>
                            {vitals.systolic_bp}/{vitals.diastolic_bp} mmHg
                          </span>
                        )}
                        {vitals.pulse && (
                          <span className="flex items-center text-slate-600">
                            <Heart className="w-3 h-3 mr-0.5 text-rose-500" />
                            {vitals.pulse} bpm
                          </span>
                        )}
                        {vitals.spo2 && (
                          <span className={`font-medium ${vitals.spo2 < 95 ? 'text-rose-600 font-bold' : 'text-teal-700'}`}>
                            SpO2: {vitals.spo2}%
                          </span>
                        )}
                      </div>
                    )}

                    {/* Photos/Attachments badge */}
                    {attachmentsCount > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                        <Camera className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
                        {attachmentsCount} ta rasm/EKG biriktirilgan
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Rasm biriktirilmagan</span>
                    )}

                    {/* Status badge */}
                    {visit.status === 'completed' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                        Tasdiqlangan
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        Ko'rib chiqish kutilmoqda
                      </span>
                    )}
                  </div>

                  {/* Right: Action button */}
                  <div className="flex items-center justify-end">
                    <button
                      onClick={() => onSelectVisit(visit)}
                      className="flex items-center space-x-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold transition shadow-xs cursor-pointer"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>Ko'rikni ochish</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
