import React, { useState, useMemo } from 'react';
import type { Visit, DoctorProfile } from '../types';
import { calculateAge } from '../constants';
import { getVisitRegion, getVisitDistrict } from '../data/uzbekistanRegions';
import { Search, Calendar, Phone, MapPin, Users, Compass, Globe } from 'lucide-react';

interface Props {
  visits: Visit[];
  onSelectVisit: (visit: Visit) => void;
  doctorProfile?: DoctorProfile;
}

export const PatientsView: React.FC<Props> = ({ visits, onSelectVisit, doctorProfile }) => {
  const [query, setQuery] = useState('');
  const doctorRegion = doctorProfile?.region || 'Samarqand viloyati';
  const [regionFilter, setRegionFilter] = useState<string>('my');

  // Extract unique patients from visits
  const patientsMap = useMemo(() => {
    const map = new Map<string, any>();
    visits.forEach((v) => {
      const p = v.patient;
      const pId = v.patient_id || v.id;
      const reg = getVisitRegion(v);
      const dist = getVisitDistrict(v);

      if (!map.has(pId)) {
        map.set(pId, {
          id: pId,
          first_name: p?.first_name || v.patient_first_name || 'Bemor',
          last_name: p?.last_name || v.patient_last_name || '',
          gender: p?.gender || 'unknown',
          date_of_birth: p?.date_of_birth || '',
          phone: p?.phone || '',
          region: reg,
          district: dist,
          village: p?.village?.name || dist,
          national_id: p?.national_id || '',
          blood_type: p?.blood_type || '',
          visits: [v],
        });
      } else {
        map.get(pId).visits.push(v);
      }
    });
    return map;
  }, [visits]);

  // Compute regions count among patients
  const regionStats = useMemo(() => {
    const counts = new Map<string, number>();
    Array.from(patientsMap.values()).forEach((p) => {
      counts.set(p.region, (counts.get(p.region) || 0) + 1);
    });
    return counts;
  }, [patientsMap]);

  const activeRegions = useMemo(() => {
    return Array.from(regionStats.keys()).sort((a, b) => {
      if (a === doctorRegion) return -1;
      if (b === doctorRegion) return 1;
      return (regionStats.get(b) || 0) - (regionStats.get(a) || 0);
    });
  }, [regionStats, doctorRegion]);

  const myRegionPatientsCount = regionStats.get(doctorRegion) || 0;

  const filteredPatients = useMemo(() => {
    return Array.from(patientsMap.values()).filter((p) => {
      // Regional match
      let matchesRegion = true;
      if (regionFilter === 'my') {
        matchesRegion = Boolean(!doctorRegion || p.region.toLowerCase() === doctorRegion.toLowerCase());
      } else if (regionFilter !== 'all') {
        matchesRegion = p.region.toLowerCase() === regionFilter.toLowerCase();
      }

      // Search match
      const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
      const q = query.toLowerCase();
      const matchesSearch = !q || fullName.includes(q) || p.national_id.toLowerCase().includes(q) || p.district.toLowerCase().includes(q);

      return matchesRegion && matchesSearch;
    });
  }, [patientsMap, regionFilter, doctorRegion, query]);

  return (
    <div className="space-y-4">
      {/* Top Banner and Search */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Qishloq Aholisi Elektron Tibbiy Kartalari (EHR)</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Bemorlarning viloyat va tumanlar bo'yicha elektron kartalari va murojaatlar arxivi
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Ism, pasport yoki tuman bo'yicha..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Regional Partition Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto scrollbar-thin">
        <button
          onClick={() => setRegionFilter('my')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
            regionFilter === 'my'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-teal-50 text-teal-900 border border-teal-200 hover:bg-teal-100'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Mening hududim ({doctorRegion || 'Samarqand'})</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              regionFilter === 'my' ? 'bg-white text-teal-800' : 'bg-teal-700 text-white'
            }`}
          >
            {myRegionPatientsCount}
          </span>
        </button>

        <button
          onClick={() => setRegionFilter('all')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 cursor-pointer ${
            regionFilter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Barcha viloyatlar ({patientsMap.size})</span>
        </button>

        {activeRegions
          .filter((reg) => reg !== doctorRegion)
          .map((reg) => {
            const count = regionStats.get(reg) || 0;
            const isSelected = regionFilter === reg;
            return (
              <button
                key={reg}
                onClick={() => setRegionFilter(reg)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-teal-700 text-white font-bold'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                }`}
              >
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{reg}</span>
                <span className="text-[10px] font-bold text-slate-500">({count})</span>
              </button>
            );
          })}
      </div>

      {filteredPatients.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500 shadow-2xs">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">Bemorlar topilmadi</p>
          <p className="text-xs text-slate-400 mt-1">
            Belgilangan hudud yoki qidiruv bo'yicha bemorlar topilmadi.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPatients.map((patient) => {
            const isMy = Boolean(
              doctorRegion && patient.region.toLowerCase() === doctorRegion.toLowerCase()
            );

            return (
              <div
                key={patient.id}
                className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-sm border border-teal-300">
                        {patient.first_name[0]}{patient.last_name[0] || ''}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          {patient.first_name} {patient.last_name}
                        </h3>
                        {patient.national_id && (
                          <span className="text-[11px] text-slate-500 font-mono">
                            JSHSHIR: {patient.national_id}
                          </span>
                        )}
                      </div>
                    </div>
                    {patient.blood_type && (
                      <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">
                        {patient.blood_type}
                      </span>
                    )}
                  </div>

                  {/* Location badge */}
                  <div className="mb-3">
                    {isMy ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-teal-100 text-teal-900 border border-teal-300">
                        <MapPin className="w-3 h-3 mr-1 text-teal-700" />
                        {patient.region}, {patient.district} • ⭐ Mening hududim
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                        {patient.region}, {patient.district}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
                    <div className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-2 text-slate-400" />
                      <span>
                        Tug'ilgan sana:{' '}
                        <strong className="text-slate-800">{patient.date_of_birth || '-'}</strong>
                        {patient.date_of_birth && calculateAge(patient.date_of_birth) !== null && (
                          <span> ({calculateAge(patient.date_of_birth)} yosh)</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-3.5 h-3.5 mr-2 text-slate-400" />
                      <span>Telefon: <strong className="text-slate-800">{patient.phone || '-'}</strong></span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                      Murojaatlar tarixi ({patient.visits.length}):
                    </span>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {patient.visits.map((v: Visit) => (
                        <div
                          key={v.id}
                          onClick={() => onSelectVisit(v)}
                          className="p-2 rounded bg-white hover:bg-teal-50 border border-slate-200 text-xs flex justify-between items-center cursor-pointer transition"
                        >
                          <div className="truncate mr-2">
                            <span className="font-semibold text-slate-800 block truncate">{v.chief_complaint}</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(v.visit_date).toLocaleDateString('uz-UZ')}
                            </span>
                          </div>
                          <span className="text-[10px] font-semibold text-teal-700 shrink-0">
                            Ochish →
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-right">
                  <button
                    type="button"
                    onClick={() => onSelectVisit(patient.visits[0])}
                    className="text-xs font-semibold text-teal-700 hover:text-teal-800 cursor-pointer"
                  >
                    Oxirgi ko'rikni ko'rish →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
