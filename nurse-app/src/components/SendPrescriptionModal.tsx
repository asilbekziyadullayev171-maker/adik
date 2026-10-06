import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  Pill,
  User,
  Building,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Visit, Pharmacy, PrescriptionOrder } from '../types';

interface SendPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  pharmacies: Pharmacy[];
  selectedPharmacyId?: number;
  reviewedVisits: Visit[];
  onOrderCreated: (order: PrescriptionOrder) => void;
}

export const SendPrescriptionModal: React.FC<SendPrescriptionModalProps> = ({
  isOpen,
  onClose,
  pharmacies,
  selectedPharmacyId,
  reviewedVisits,
  onOrderCreated,
}) => {
  const [targetPharmacyId, setTargetPharmacyId] = useState<number>(
    selectedPharmacyId || (pharmacies[0]?.id || 1)
  );
  const [selectedVisitId, setSelectedVisitId] = useState<string>(
    reviewedVisits[0]?.id || ''
  );
  const [nurseNotes, setNurseNotes] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  useEffect(() => {
    if (selectedPharmacyId) {
      setTargetPharmacyId(selectedPharmacyId);
    } else if (pharmacies.length > 0) {
      setTargetPharmacyId(pharmacies[0].id);
    }
  }, [selectedPharmacyId, pharmacies]);

  useEffect(() => {
    if (reviewedVisits.length > 0 && !selectedVisitId) {
      setSelectedVisitId(reviewedVisits[0].id);
    }
  }, [reviewedVisits, selectedVisitId]);

  if (!isOpen) return null;

  const currentVisit = reviewedVisits.find((v) => v.id === selectedVisitId);
  const currentPharmacy = pharmacies.find((p) => p.id === targetPharmacyId);

  const handleSendOrder = () => {
    if (!currentVisit || !currentPharmacy || !currentVisit.doctorReview) return;

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const code = `RX-${randomNum}`;

    const newOrder: PrescriptionOrder = {
      id: `ord-${Date.now()}`,
      visitId: currentVisit.id,
      pharmacyId: currentPharmacy.id,
      pharmacyName: currentPharmacy.name,
      patientName: `${currentVisit.patient.firstName} ${currentVisit.patient.lastName}`,
      patientPhone: currentVisit.patient.phone,
      orderCode: code,
      medications: currentVisit.doctorReview.prescriptions,
      status: 'sent_to_pharmacy',
      notes: nurseNotes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onOrderCreated(newOrder);
    setGeneratedCode(code);
  };

  const handleFinish = () => {
    setGeneratedCode(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-50 border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-600 border border-emerald-500/30 flex items-center justify-center">
              <Pill className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Shifokor retseptini dorixonaga yo'naltirish
              </h3>
              <p className="text-[11px] text-slate-600">
                Elektron retsept orqali dorini oldindan band qilish
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-700">
          {generatedCode ? (
            /* Success confirmation */
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Retsept dorixonaga yuborildi!
                </h4>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                  Dorixona xodimi tizim orqali buyurtmani qabul qildi va dori vositalarini ajratib qo'yadi.
                </p>
              </div>

              {/* Code display */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 inline-block px-8">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                  Elektron qabul kodi
                </span>
                <span className="text-2xl font-mono font-bold text-emerald-600 tracking-wider">
                  {generatedCode}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-blue-50/40 border border-blue-200 text-[11px] text-blue-700 text-left max-w-md mx-auto space-y-1">
                <p className="font-semibold text-slate-900">Hamshira uchun eslatma:</p>
                <p>
                  Bemor yoki uning qarindoshiga ushbu <span className="font-bold text-emerald-700">{generatedCode}</span> kodini va dorixona manzilini berishingiz kifoya.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleFinish}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-900 font-bold transition shadow-md"
                >
                  Tushunarli, yopish
                </button>
              </div>
            </div>
          ) : (
            /* Form inputs */
            <>
              {reviewedVisits.length === 0 ? (
                <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/30 text-amber-300 space-y-2">
                  <div className="flex items-center space-x-2 font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Hozircha tasdiqlangan retseptlar mavjud emas</span>
                  </div>
                  <p className="text-[11px] text-amber-200/80">
                    Dorixonaga retsept yuborish uchun shifokor avval ko'rik natijasini tekshirib, dori tayinlashi zarur.
                  </p>
                </div>
              ) : (
                <>
                  {/* Select Patient & Visit */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span>Bemor va shifokor retsepti</span>
                    </label>
                    <select
                      value={selectedVisitId}
                      onChange={(e) => setSelectedVisitId(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                    >
                      {reviewedVisits.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.patient.firstName} {v.patient.lastName} ({v.patient.village}) — Tashxis: {v.doctorReview?.diagnosisText || 'Tashxis qo\'yilgan'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Prescribed Medications Preview */}
                  {currentVisit?.doctorReview?.prescriptions && (
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1">
                          <FileText className="w-3 h-3 text-emerald-600" />
                          <span>Tayinlangan dori vositalari</span>
                        </span>
                        <span className="text-[10px] text-blue-600 font-medium">
                          Dr. {currentVisit.doctorReview.doctorName}
                        </span>
                      </div>
                      <div className="space-y-1.5 pt-1">
                        {currentVisit.doctorReview.prescriptions.map((med, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-[11px] bg-slate-100/80 p-2 rounded-lg border border-slate-200"
                          >
                            <span className="font-semibold text-slate-800">
                              {med.medicationName} ({med.dosage})
                            </span>
                            <span className="text-slate-600 text-[10px]">
                              {med.frequency} · {med.duration}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Select Pharmacy */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                      <Building className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Qabul qiluvchi qishloq dorixonasi</span>
                    </label>
                    <select
                      value={targetPharmacyId}
                      onChange={(e) => setTargetPharmacyId(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                    >
                      {pharmacies.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.distanceKm} km {p.is24_7 ? '· 24/7' : ''})
                        </option>
                      ))}
                    </select>
                    {currentPharmacy && (
                      <p className="text-[10px] text-slate-600 pt-0.5 pl-1">
                        Manzil: {currentPharmacy.address} · Tel: {currentPharmacy.phone}
                      </p>
                    )}
                  </div>

                  {/* Optional Notes */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Dorixonachi uchun qo'shimcha izoh (ixtiyoriy)
                    </label>
                    <textarea
                      rows={2}
                      value={nurseNotes}
                      onChange={(e) => setNurseNotes(e.target.value)}
                      placeholder="Masalan: Bemorning o'g'li soat 17:00 da dori vositalarini olib ketadi..."
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-500 placeholder-slate-600 resize-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-200">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition text-xs font-semibold"
                    >
                      Bekor qilish
                    </button>
                    <button
                      onClick={handleSendOrder}
                      disabled={!currentVisit || !currentPharmacy}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-md flex items-center space-x-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>DORIXONAGA YUBORISH</span>
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
