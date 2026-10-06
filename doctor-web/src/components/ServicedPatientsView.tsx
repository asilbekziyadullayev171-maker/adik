import React, { useState, useMemo } from 'react';
import type { Visit, DoctorProfile } from '../types';
import { calculateAge } from '../constants';
import { getVisitRegion, getVisitDistrict } from '../data/uzbekistanRegions';
import { 
  CheckCircle2, 
  Search, 
  FileText, 
  Calendar, 
  MapPin, 
  Pill, 
  Camera, 
  Printer, 
  ShieldCheck, 
  Stethoscope, 
  ChevronRight,
  X,
  Compass,
  Globe
} from 'lucide-react';

interface Props {
  completedVisits: Visit[];
  onOpenVisit: (visit: Visit) => void;
  doctorProfile?: DoctorProfile;
}

export const ServicedPatientsView: React.FC<Props> = ({
  completedVisits,
  onOpenVisit,
  doctorProfile,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReportVisit, setSelectedReportVisit] = useState<Visit | null>(null);

  const doctorRegion = doctorProfile?.region || 'Samarqand viloyati';
  const [regionFilter, setRegionFilter] = useState<string>('my');

  // Stats by region
  const regionStats = useMemo(() => {
    const counts = new Map<string, number>();
    completedVisits.forEach((v) => {
      const reg = getVisitRegion(v);
      counts.set(reg, (counts.get(reg) || 0) + 1);
    });
    return counts;
  }, [completedVisits]);

  const activeRegions = useMemo(() => {
    return Array.from(regionStats.keys()).sort((a, b) => {
      if (a === doctorRegion) return -1;
      if (b === doctorRegion) return 1;
      return (regionStats.get(b) || 0) - (regionStats.get(a) || 0);
    });
  }, [regionStats, doctorRegion]);

  const myRegionCount = regionStats.get(doctorRegion) || 0;

  // Filter completed visits
  const filtered = completedVisits.filter((v) => {
    // Regional match
    const visitReg = getVisitRegion(v);
    let matchesRegion = true;
    if (regionFilter === 'my') {
      matchesRegion = Boolean(!doctorRegion || visitReg.toLowerCase() === doctorRegion.toLowerCase());
    } else if (regionFilter !== 'all') {
      matchesRegion = visitReg.toLowerCase() === regionFilter.toLowerCase();
    }

    const query = searchTerm.toLowerCase();
    const patientName = `${v.patient?.first_name || v.patient_first_name || ''} ${v.patient?.last_name || v.patient_last_name || ''}`.toLowerCase();
    const diagnosis = `${v.icd10_code || ''} ${v.diagnosis_name || ''}`.toLowerCase();
    const complaint = (v.chief_complaint || '').toLowerCase();
    const village = (v.patient?.village?.name || '').toLowerCase();

    const matchesSearch = !query || patientName.includes(query) || diagnosis.includes(query) || complaint.includes(query) || village.includes(query);

    return matchesRegion && matchesSearch;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Metrics */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Xizmat Ko'rsatilgan Bemorlar & Tashxislar Arxiv
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Shifokor tomonidan ko'rib chiqilgan, XPA-10 tashxisi qo'yilgan va davolash tavsiyalari berilgan bemorlar ro'yxati
          </p>
        </div>

        {/* Stats badges */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-center">
            <span className="text-[11px] text-slate-400 block font-medium">Jami ko'rilgan</span>
            <span className="text-base font-extrabold text-slate-900">{completedVisits.length} nafar</span>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl text-center">
            <span className="text-[11px] text-emerald-700 block font-medium">Tashxis tasdiqlangan</span>
            <span className="text-base font-extrabold text-emerald-800">100%</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Bemor ismi, qishlog'i yoki XPA-10 tashxisi (masalan: Gipertoniya, I10) bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Natijalar: <strong className="text-slate-900">{filtered.length}</strong> ta bemor
        </div>
      </div>

      {/* Regional Partition Pills */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-2 overflow-x-auto scrollbar-thin">
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
            {myRegionCount}
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
          <span>Barcha viloyatlar ({completedVisits.length})</span>
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

      {/* Serviced Patients Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500 shadow-2xs">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">Xizmat ko'rsatilgan bemorlar topilmadi</p>
          <p className="text-xs text-slate-400 mt-1">
            Navbatdagi ko'riklarni ko'rib chiqib tasdiqlaganingizdan so'ng, ular shu yerda avtomatik jamlanadi.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((visit) => {
            const patientName = `${visit.patient?.first_name || visit.patient_first_name || 'Bemor'} ${visit.patient?.last_name || visit.patient_last_name || ''}`;
            const villageName = visit.patient?.village?.name || 'Bog\'iston QFY';
            const diagnosisCode = visit.icd10_code || visit.doctor_assessment?.icd10_code || 'I10';
            const diagnosisText = visit.diagnosis_name || visit.doctor_assessment?.diagnosis_name || 'Klinik tekshiruvdan o\'tkazildi';
            const recommendation = visit.doctor_recommendation || visit.doctor_assessment?.recommendations || 'Rejali terapiya va nazorat';
            const prescriptions = visit.prescriptions || visit.doctor_assessment?.prescriptions || [];
            const vitals = visit.vital_signs || visit.vitals;

            return (
              <div
                key={visit.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition duration-200 flex flex-col space-y-4"
              >
                {/* Header row: Patient details and Service Date */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-sm border border-teal-300">
                      {patientName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-bold text-slate-900">{patientName}</h3>
                        <span className="text-[11px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                          Xizmat ko'rsatildi
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          <MapPin className="w-3 h-3 mr-1 text-slate-400" /> {getVisitRegion(visit)}, {getVisitDistrict(visit)}
                        </span>
                        <span>•</span>
                        <span>{villageName}</span>
                        <span>•</span>
                        <span>
                          {visit.patient?.date_of_birth ? `${calculateAge(visit.patient.date_of_birth) ?? ''} yosh` : 'Kattalar'}
                        </span>
                        <span>•</span>
                        <span>Tel: {visit.patient?.phone || '+998 90 123-45-67'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Date badge */}
                  <div className="text-right text-xs text-slate-500 flex sm:flex-col items-center sm:items-end justify-between">
                    <span className="flex items-center font-medium text-slate-700">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-teal-600" />
                      {new Date(visit.serviced_at || visit.visit_date).toLocaleDateString('uz-UZ')}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(visit.serviced_at || visit.visit_date).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Main Diagnosis & Doctor Recommendation section */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Diagnosis Column (5 cols) */}
                  <div className="md:col-span-5 bg-teal-50/50 p-4 rounded-xl border border-teal-100/80 space-y-2">
                    <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block flex items-center">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1 text-teal-700" />
                      Qo'yilgan XPA-10 Klinik Tashxisi:
                    </span>
                    <div>
                      <span className="inline-block bg-teal-700 text-white font-mono font-bold text-xs px-2.5 py-0.5 rounded-md shadow-2xs mb-1">
                        {diagnosisCode}
                      </span>
                      <p className="text-xs font-bold text-slate-900 leading-snug">
                        {diagnosisText}
                      </p>
                    </div>

                    {vitals?.systolic_bp && (
                      <div className="text-[11px] text-slate-600 pt-1 border-t border-teal-200/50 flex items-center space-x-2">
                        <span>Ko'rikdagi bosim: <strong>{vitals.systolic_bp}/{vitals.diastolic_bp} mmHg</strong></span>
                        <span>•</span>
                        <span>Puls: <strong>{vitals.pulse} bpm</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Doctor Recommendation Column (7 cols) */}
                  <div className="md:col-span-7 bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block flex items-center">
                        <Stethoscope className="w-3.5 h-3.5 mr-1 text-teal-600" />
                        Shifokorning Shaxsiy Tavsiyalari (Tavsiya):
                      </span>
                      <p className="text-xs text-slate-800 leading-relaxed mt-1 italic bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                        "{recommendation}"
                      </p>
                    </div>

                    {/* Prescriptions tag list */}
                    {prescriptions.length > 0 && (
                      <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="text-[11px] font-semibold text-slate-500 flex items-center mr-1">
                          <Pill className="w-3 h-3 mr-1 text-teal-600" /> Retseptlar:
                        </span>
                        {prescriptions.map((rx, idx) => (
                          <span
                            key={idx}
                            className="bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-800 font-medium text-[11px]"
                          >
                            {rx.medicine_name} ({rx.duration_days ? `${rx.duration_days} kun` : rx.dosage})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2">
                    {visit.attachments && visit.attachments.length > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-700 font-medium text-[11px] border border-slate-200">
                        <Camera className="w-3 h-3 mr-1 text-teal-600" />
                        {visit.attachments.length} ta klinik rasm/EKG biriktirilgan
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* View Ambulator Blank (Printable) */}
                    <button
                      type="button"
                      onClick={() => setSelectedReportVisit(visit)}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold flex items-center space-x-1.5 transition cursor-pointer border border-slate-300 shadow-2xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-teal-700" />
                      <span>Ambulator Xulosa (Blank)</span>
                    </button>

                    {/* Open full inspection modal */}
                    <button
                      type="button"
                      onClick={() => onOpenVisit(visit)}
                      className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-semibold flex items-center space-x-1.5 transition cursor-pointer shadow-xs"
                    >
                      <span>To'liq kartani ko'rish</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AMBULATOR REPORT / BLANK PRINT MODAL */}
      {selectedReportVisit && (
        <div className="fixed inset-0 z-70 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-300 overflow-hidden my-auto animate-in zoom-in-95 duration-150">
            {/* Top Toolbar */}
            <div className="bg-slate-900 text-white px-6 py-3 flex justify-between items-center print:hidden">
              <span className="text-xs font-bold flex items-center">
                <FileText className="w-4 h-4 mr-2 text-teal-400" />
                Ambulator Tibbiy Ma'lumotnoma (025-shakl)
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Chop etish (Print)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedReportVisit(null)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Form Content */}
            <div className="p-8 space-y-6 text-slate-900 bg-white" id="printable-medical-record">
              {/* Official Header */}
              <div className="text-center border-b-2 border-slate-900 pb-4">
                <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                  O'zbekiston Respublikasi Sog'liqni Saqlash Vazirligi
                </p>
                <h2 className="text-base font-extrabold text-slate-900 mt-1 uppercase">
                  Tuman Markaziy Shifoxonasi • Telemeditsina Konsultatsiya Xulosasi
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Qishloq vrachlik punkti (QVP) orqali o'tkazilgan masofaviy ko'rik varaqasi
                </p>
              </div>

              {/* Patient and Visit Details */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <p><strong>Bemor F.I.Sh:</strong> {selectedReportVisit.patient?.first_name || selectedReportVisit.patient_first_name} {selectedReportVisit.patient?.last_name || selectedReportVisit.patient_last_name}</p>
                  <p><strong>Tug'ilgan sana / Yoshi:</strong> {selectedReportVisit.patient?.date_of_birth || '-'} ({selectedReportVisit.patient?.date_of_birth ? `${calculateAge(selectedReportVisit.patient.date_of_birth) ?? '-'} yosh` : '-'})</p>
                  <p><strong>Yashash manzili:</strong> {selectedReportVisit.patient?.village?.name || 'Bog\'iston QFY'}, {selectedReportVisit.patient?.address || 'Ibn Sino ko\'chasi'}</p>
                  <p><strong>JSHSHIR / Pasport:</strong> {selectedReportVisit.patient?.national_id || 'AA 1234567'}</p>
                </div>
                <div className="space-y-1.5 text-right sm:text-left">
                  <p><strong>Ko'rik sanasi:</strong> {new Date(selectedReportVisit.serviced_at || selectedReportVisit.visit_date).toLocaleDateString('uz-UZ')}</p>
                  <p><strong>Ko'rik ID:</strong> {selectedReportVisit.id.substring(0, 13)}</p>
                  <p><strong>Konsultant shifokor:</strong> {selectedReportVisit.doctor_assessment?.doctor_name || 'Dr. Umid Dilmurodov'}</p>
                  <p><strong>Mutaxassisligi:</strong> {selectedReportVisit.doctor_assessment?.doctor_specialty || 'Umumiy amaliyot shifokori (Bosh terapevt)'}</p>
                </div>
              </div>

              {/* Vitals */}
              {(() => {
                const vitals = selectedReportVisit.vital_signs || selectedReportVisit.vitals;
                if (!vitals) return null;
                return (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs grid grid-cols-4 gap-2 text-center">
                    <div>
                      <span className="text-slate-500 block">Qon bosimi:</span>
                      <strong className="text-slate-900">{vitals.systolic_bp ? `${vitals.systolic_bp}/${vitals.diastolic_bp}` : '-'} mmHg</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Puls:</span>
                      <strong className="text-slate-900">{vitals.pulse ? `${vitals.pulse} bpm` : '-'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">SpO2:</span>
                      <strong className="text-slate-900">{vitals.spo2 ? `${vitals.spo2}%` : '-'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Harorat:</span>
                      <strong className="text-slate-900">{vitals.temperature ? `${vitals.temperature}°C` : '-'}</strong>
                    </div>
                  </div>
                );
              })()}

              {/* Chief complaint */}
              <div className="text-xs">
                <strong className="block text-slate-700 mb-0.5">Asosiy Shikoyati:</strong>
                <p className="bg-slate-50 p-2.5 rounded border border-slate-200 text-slate-800">
                  {selectedReportVisit.chief_complaint}
                </p>
              </div>

              {/* Official Diagnosis */}
              <div className="text-xs space-y-1 p-3 bg-teal-50 border-l-4 border-l-teal-600 rounded">
                <strong className="block text-teal-900 uppercase">Klinik Tashxis (XPA-10 / ICD-10):</strong>
                <p className="text-sm font-extrabold text-slate-900">
                  [{selectedReportVisit.icd10_code || 'I10'}] {selectedReportVisit.diagnosis_name || 'Essensial gipertenziya'}
                </p>
              </div>

              {/* Doctor Recommendations */}
              <div className="text-xs space-y-1">
                <strong className="block text-slate-800 uppercase tracking-wider">
                  Shifokorning Tavsiyalari & Davolash Rejasi:
                </strong>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {selectedReportVisit.doctor_recommendation || selectedReportVisit.doctor_assessment?.recommendations}
                </div>
              </div>

              {/* Prescriptions */}
              {(selectedReportVisit.prescriptions || selectedReportVisit.doctor_assessment?.prescriptions) && (
                <div className="text-xs space-y-1">
                  <strong className="block text-slate-800 uppercase tracking-wider">
                    Tayinlangan Dori Vositalari (Elektron Retsept):
                  </strong>
                  <table className="w-full text-left border border-slate-200 rounded text-xs mt-1">
                    <thead className="bg-slate-100 border-b border-slate-200">
                      <tr>
                        <th className="p-2">Dori nomi</th>
                        <th className="p-2">Qabul qilish tartibi</th>
                        <th className="p-2">Davomiyligi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedReportVisit.prescriptions || selectedReportVisit.doctor_assessment?.prescriptions || []).map((rx, i) => (
                        <tr key={i} className="border-b border-slate-100">
                          <td className="p-2 font-semibold text-slate-900">{rx.medicine_name}</td>
                          <td className="p-2">{rx.dosage}</td>
                          <td className="p-2">{rx.duration_days ? `${rx.duration_days} kun` : 'Doimiy'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Signatures */}
              <div className="pt-8 flex justify-between items-end text-xs border-t border-slate-200">
                <div>
                  <p>Hamshira: <strong>Nilufar Karimova</strong></p>
                  <p className="text-[11px] text-slate-400">Qishloq vrachlik punkti</p>
                </div>
                <div className="text-right">
                  <p>Masofaviy Shifokor: <strong>{selectedReportVisit.doctor_assessment?.doctor_name || 'Dr. Umid Dilmurodov'}</strong></p>
                  <p className="text-[11px] text-slate-500 font-mono">Imzo & Muhr: [Elektron Raqamli Imzo E-IMZO]</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
