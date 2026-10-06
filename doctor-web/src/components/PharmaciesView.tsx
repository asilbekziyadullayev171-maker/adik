import React from 'react';
import type { Pharmacy } from '../types';
import { Building2, Phone, MapPin, CheckCircle, Clock } from 'lucide-react';

interface Props {
  pharmacies: Pharmacy[];
}

export const PharmaciesView: React.FC<Props> = ({ pharmacies }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-slate-900">Qishloq Dorixonalari & Zaxiralar Tizimi</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tuman bo'yicha integratsiya qilingan dorixonalar, 24/7 navbatchilik va dori vositalari qoldig'i
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className="inline-flex items-center px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            Barcha dorixonalar onlayn
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {pharmacies.map((pharmacy) => (
          <div
            key={pharmacy.id}
            className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
                  <Building2 className="w-5 h-5" />
                </div>
                {pharmacy.is_duty_24_7 ? (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-300 flex items-center">
                    <Clock className="w-3 h-3 mr-1" /> 24/7 Navbatchi
                  </span>
                ) : (
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded">
                    08:00 - 20:00
                  </span>
                )}
              </div>

              <h3 className="text-sm font-bold text-slate-900 mb-1">{pharmacy.name}</h3>
              <p className="text-xs text-slate-500 flex items-center mb-1">
                <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                {pharmacy.village_name}, {pharmacy.address}
              </p>
              <p className="text-xs text-slate-500 flex items-center mb-4">
                <Phone className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                {pharmacy.phone}
              </p>

              {/* Medicines stock list */}
              <div className="border-t border-slate-100 pt-3">
                <span className="text-[11px] font-bold text-slate-700 block mb-2 uppercase tracking-wider">
                  Mavjud Zaxiralar:
                </span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {pharmacy.medicines?.map((med) => (
                    <div
                      key={med.id}
                      className="flex justify-between items-center text-xs p-1.5 bg-slate-50 rounded border border-slate-100"
                    >
                      <span className="font-medium text-slate-800">{med.medicine_name}</span>
                      <div className="text-right">
                        <span className={`font-bold text-[11px] ${med.stock < 30 ? 'text-amber-600' : 'text-teal-700'}`}>
                          {med.stock} {med.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-500">
              <span>Masofa: ~{pharmacy.distance_km} km</span>
              <span className="text-teal-700 font-semibold">Elektron retsept qabul qiladi</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
