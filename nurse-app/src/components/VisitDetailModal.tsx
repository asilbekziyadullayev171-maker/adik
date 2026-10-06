import React, { useState } from 'react';
import {
  X,
  User,
  HeartPulse,
  Activity,
  FileText,
  Clock,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  Stethoscope,
  Pill,
  Printer,
  ChevronRight,
  Camera,
  ZoomIn
} from 'lucide-react';
import { Visit, ClinicalPhoto } from '../types';
import { TriageBadge } from './TriageBadge';

interface VisitDetailModalProps {
  visit: Visit | null;
  onClose: () => void;
}

export const VisitDetailModal: React.FC<VisitDetailModalProps> = ({ visit, onClose }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<ClinicalPhoto | null>(null);

  if (!visit) return null;

  const { patient, vitals, symptoms, redFlags, aiAssessment, doctorReview } = visit;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white/90 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-50 border border-slate-200 rounded-xl shadow-2xl w-full max-w-4xl text-slate-900 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-100/90 rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Elektron ko‘rik varaqasi № {visit.id.replace('vis-', '')}
                </h2>
                <span className="text-xs font-mono text-slate-600">({visit.visitDate})</span>
              </div>
              <p className="text-xs text-slate-600">
                {visit.clinicName} • Bemor: {patient.lastName} {patient.firstName} {patient.patronymic}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <a
              href={visit.meetLink || "https://meet.google.com/new"}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4zM14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2z" />
              </svg>
              <span className="hidden sm:inline">Google Meet</span>
            </a>
            <button
              onClick={() => window.print()}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
              title="Chop etish"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Top summary row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Patient card */}
            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                <User className="w-3.5 h-3.5" />
                <span>Bemor ma’lumotlari</span>
              </div>
              <p className="text-sm font-bold text-slate-900">
                {patient.lastName} {patient.firstName}
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                {patient.age} yosh ({patient.birthDate}) • {patient.gender === 'male' ? 'Erkak' : 'Ayol'}
              </p>
              <p className="text-xs text-slate-600 mt-1">Tel: {patient.phone}</p>
              <p className="text-xs text-slate-600">{patient.village}, {patient.address}</p>

              {patient.chronicConditions.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                    Surunkali kasalliklar:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {patient.chronicConditions.map((cond, i) => (
                      <span
                        key={i}
                        className="text-[11px] bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-amber-300/90"
                      >
                        {cond}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Complaint & Vitals summary */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 md:col-span-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Asosiy shikoyat
                  </span>
                  <TriageBadge level={visit.triageLevel} size="sm" />
                </div>
                <p className="text-sm font-semibold text-slate-800">{visit.chiefComplaint}</p>

                {/* Symptoms list */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {symptoms.map((s) => (
                    <span
                      key={s.id}
                      className="text-xs bg-slate-50 border border-slate-300 px-2.5 py-1 rounded text-slate-700"
                    >
                      {s.nameUz} ({s.durationValue} {s.durationUnit})
                    </span>
                  ))}
                </div>
              </div>

              {/* Status footer */}
              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <span>Yo‘naltirilgan: <strong className="text-slate-800">{visit.targetSpecialty}</strong></span>
                <span>
                  Holat:{' '}
                  <strong className={visit.status === 'reviewed' ? 'text-emerald-600' : 'text-amber-400'}>
                    {visit.status === 'reviewed' ? 'Shifokor ko‘rib chiqqan' : 'Kutilmoqda'}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Red Flag Alert (if any) */}
          {redFlags.length > 0 && (
            <div className="p-4 rounded-xl bg-red-50 border-2 border-red-500/70 space-y-2">
              <div className="flex items-center space-x-2 text-red-600 font-bold text-xs uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4" />
                <span>Shoshilinch xavf omili (Red Flag)</span>
              </div>
              {redFlags.map((rf) => (
                <div key={rf.id} className="text-xs">
                  <p className="text-sm font-bold text-red-700">{rf.titleUz}</p>
                  <p className="text-slate-700 mt-0.5">{rf.descriptionUz}</p>
                  <p className="text-red-200 font-medium mt-1 bg-red-50/60 p-2 rounded border border-red-900">
                    Protokol: {rf.protocolUz}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Vitals Grid */}
          <div className="p-4 rounded-xl bg-white border border-slate-200">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
              Klinik hayotiy ko‘rsatkichlar (Vital signs)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-[10px] text-slate-600 uppercase">Qon bosimi</p>
                <p className="text-base font-bold text-slate-900 font-mono mt-0.5">
                  {vitals.systolicBP}/{vitals.diastolicBP}
                </p>
                <p className="text-[9px] text-slate-500">mmHg</p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-[10px] text-slate-600 uppercase">Yurak urishi</p>
                <p className="text-base font-bold text-slate-900 font-mono mt-0.5">
                  {vitals.pulseRate}
                </p>
                <p className="text-[9px] text-slate-500">zarba/daq</p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-[10px] text-slate-600 uppercase">Harorat</p>
                <p className="text-base font-bold text-slate-900 font-mono mt-0.5">
                  {vitals.temperature}
                </p>
                <p className="text-[9px] text-slate-500">°C</p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-[10px] text-slate-600 uppercase">Kislorod (SpO2)</p>
                <p className="text-base font-bold text-slate-900 font-mono mt-0.5">
                  {vitals.spo2}
                </p>
                <p className="text-[9px] text-slate-500">%</p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-[10px] text-slate-600 uppercase">Nafas soni</p>
                <p className="text-base font-bold text-slate-900 font-mono mt-0.5">
                  {vitals.respiratoryRate}
                </p>
                <p className="text-[9px] text-slate-500">nafas/daq</p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-[10px] text-slate-600 uppercase">Vazn / Bo‘y</p>
                <p className="text-sm font-bold text-slate-900 font-mono mt-1">
                  {vitals.weight || '--'} kg / {vitals.height || '--'} cm
                </p>
              </div>
            </div>
          </div>

          {/* Clinical Photos & ECG Section */}
          {visit.attachments && visit.attachments.length > 0 && (
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <Camera className="w-4 h-4 text-blue-600" />
                  <span>Klinik fotosuratlar va EKG ({visit.attachments.length} ta surat)</span>
                </div>
                <span className="text-[10px] text-emerald-600 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 font-semibold">
                  Shifokor ko‘rigi uchun biriktirilgan
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {visit.attachments.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => setSelectedPhoto(photo)}
                    className="group relative rounded-xl overflow-hidden bg-slate-50 border border-slate-200 cursor-pointer hover:border-blue-500 transition shadow-sm"
                  >
                    <img
                      src={photo.url}
                      alt={photo.categoryUz}
                      className="w-full h-28 object-cover bg-black"
                    />
                    <div className="absolute inset-0 bg-slate-50/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <ZoomIn className="w-6 h-6 text-slate-900" />
                    </div>
                    <div className="p-2 bg-slate-50">
                      <span className="text-[10px] font-bold text-blue-600 block truncate">
                        {photo.categoryUz}
                      </span>
                      {photo.notes && (
                        <span className="text-[9px] text-slate-600 block truncate">
                          {photo.notes}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Clinical Assessment */}
          {aiAssessment && (
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center space-x-2 text-blue-700">
                  <svg className="w-5 h-5 text-blue-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <h3 className="text-sm font-bold uppercase tracking-wider">
                    Sun'iy intellekt (Gemini AI) Xulosasi
                  </h3>
                </div>
                <TriageBadge level={aiAssessment.riskLevel} size="sm" />
              </div>

              {/* Conditions */}
              <div>
                <p className="text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Ehtimoliy klinik holatlar:
                </p>
                <div className="space-y-1.5">
                  {aiAssessment.potentialConditions.map((cond, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-start justify-between"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-800">{cond.conditionUz}</span>
                          {cond.icd10 && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 text-slate-600 border border-slate-300">
                              ICD: {cond.icd10}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">{cond.clinicalReasoningUz}</p>
                      </div>
                      <span className="text-[10px] font-semibold text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded border border-blue-200 shrink-0 ml-2">
                        {cond.likelihood}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key factors */}
              {aiAssessment.keyRiskFactors.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Baholashga asos bo‘lgan omillar:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {aiAssessment.keyRiskFactors.map((f, idx) => (
                      <div key={idx} className="p-2 rounded bg-slate-50 border border-slate-200">
                        <div className="flex justify-between font-semibold text-slate-700">
                          <span>{f.factorUz}</span>
                          <span className="text-amber-400">{f.value}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">{f.explanationUz}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[11px] text-slate-500 italic pt-1">{aiAssessment.disclaimerUz}</p>
            </div>
          )}

          {/* Doctor Review (If reviewed) */}
          {doctorReview ? (
            <div className="p-5 rounded-xl bg-emerald-950/20 border-2 border-emerald-500/50 space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-slate-900">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Shifokorning yakuniy klinik xulosasi</h3>
                    <p className="text-xs text-emerald-700">
                      {doctorReview.doctorName} • {doctorReview.specialty} ({doctorReview.clinicName})
                    </p>
                  </div>
                </div>
                <span className="text-xs text-slate-600">{doctorReview.reviewedAt}</span>
              </div>

              {/* Diagnosis */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                  Klinik tashxis:
                </span>
                <p className="text-sm font-bold text-slate-900">{doctorReview.diagnosisText}</p>
                <p className="text-xs font-mono text-emerald-600 mt-0.5">XKT-10 (ICD-10): {doctorReview.icd10Code}</p>
              </div>

              {/* Treatment Plan */}
              <div>
                <span className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                  Davolash rejasi va umumiy ko‘rsatmalar:
                </span>
                <p className="text-xs text-slate-800 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                  {doctorReview.treatmentPlan}
                </p>
              </div>

              {/* Prescriptions */}
              {doctorReview.prescriptions.length > 0 && (
                <div>
                  <div className="flex items-center space-x-1.5 mb-2 text-xs font-bold text-slate-700 uppercase">
                    <Pill className="w-3.5 h-3.5 text-blue-600" />
                    <span>Tayinlangan dori vositalari (Retsept):</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-slate-700 border border-slate-200">
                      <thead className="bg-white text-slate-600 uppercase text-[10px]">
                        <tr>
                          <th className="p-2.5 border-b border-slate-200">Preparat nomi</th>
                          <th className="p-2.5 border-b border-slate-200">Doza</th>
                          <th className="p-2.5 border-b border-slate-200">Qabul tartibi</th>
                          <th className="p-2.5 border-b border-slate-200">Muddati</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 bg-slate-50/80">
                        {doctorReview.prescriptions.map((p, i) => (
                          <tr key={i}>
                            <td className="p-2.5 font-semibold text-slate-900">{p.medicationName}</td>
                            <td className="p-2.5">{p.dosage}</td>
                            <td className="p-2.5">{p.frequency} ({p.instructions})</td>
                            <td className="p-2.5 font-medium text-emerald-600">{p.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Follow-up */}
              {doctorReview.followUpDate && (
                <div className="p-3 rounded-lg bg-blue-50/30 border border-blue-200 text-xs text-blue-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>Qayta ko‘rik sanasi: <strong>{doctorReview.followUpDate}</strong></span>
                  </div>
                  <span className="text-[11px] text-slate-600">{doctorReview.followUpInstructions}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-300 flex items-center space-x-3">
              <Clock className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="font-bold">Shifokor ko‘rigi kutilmoqda</p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Ko‘rik natijalari {visit.targetSpecialty} navbatchi guruhiga yuborilgan. Shifokor tasdiqlashi bilan bu yerda to‘liq retsept va tashxis aks etadi.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-white/90 rounded-b-xl flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-xs font-semibold text-slate-800 transition cursor-pointer"
          >
            Yopish
          </button>
        </div>
      </div>

      {/* Fullscreen Photo Zoom Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-white/95 backdrop-blur-md"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-100">
              <div className="flex items-center space-x-2">
                <Camera className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-900">
                  {selectedPhoto.categoryUz}
                </span>
                {selectedPhoto.notes && (
                  <span className="text-[11px] text-slate-600">
                    — {selectedPhoto.notes}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 flex items-center justify-center bg-black max-h-[80vh]">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.categoryUz}
                className="max-h-[75vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
