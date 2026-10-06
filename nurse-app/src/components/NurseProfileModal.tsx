import React, { useState, useEffect } from 'react';
import { User, CheckCircle2, X, Phone, Briefcase, Building, MapPin, Sparkles } from 'lucide-react';
import { RegionDistrictSelector } from './RegionDistrictSelector';

export interface NurseProfile {
  id?: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  region: string;
  district?: string;
  facility: string;
  role?: string;
  phone?: string;
}

interface Props {
  currentProfile: NurseProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: NurseProfile) => void;
  isInitialSetup?: boolean;
}

export const NurseProfileModal: React.FC<Props> = ({
  currentProfile,
  isOpen,
  onClose,
  onSave,
  isInitialSetup = false,
}) => {
  // Helper to extract first and last name from profile
  const extractNames = (p: NurseProfile | null) => {
    if (!p) return { first: '', last: '', middle: '' };
    if (p.firstName || p.lastName) {
      return {
        first: p.firstName || '',
        last: p.lastName || '',
        middle: p.middleName || '',
      };
    }
    const parts = (p.fullName || '').trim().split(/\s+/);
    return {
      last: parts[0] || '',
      first: parts[1] || '',
      middle: parts.slice(2).join(' ') || '',
    };
  };

  const initialNames = extractNames(currentProfile);
  const [lastName, setLastName] = useState(initialNames.last);
  const [firstName, setFirstName] = useState(initialNames.first);
  const [middleName, setMiddleName] = useState(initialNames.middle);
  const [phone, setPhone] = useState(currentProfile?.phone || '+998 ');
  const [role, setRole] = useState(currentProfile?.role || 'Katta hamshira');
  const [region, setRegion] = useState(currentProfile?.region || '');
  const [district, setDistrict] = useState(currentProfile?.district || '');
  const [facility, setFacility] = useState(currentProfile?.facility || '');

  useEffect(() => {
    if (isOpen && currentProfile) {
      const names = extractNames(currentProfile);
      setLastName(names.last);
      setFirstName(names.first);
      setMiddleName(names.middle);
      setPhone(currentProfile.phone || '+998 ');
      setRole(currentProfile.role || 'Katta hamshira');
      setRegion(currentProfile.region);
      setDistrict(currentProfile.district || '');
      setFacility(currentProfile.facility);
    }
  }, [isOpen, currentProfile]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !region.trim() || !facility.trim()) return;

    const fullName = [lastName.trim(), firstName.trim(), middleName.trim()].filter(Boolean).join(' ');

    onSave({
      id: currentProfile?.id || `nurse-${Date.now()}`,
      fullName,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      middleName: middleName.trim(),
      region: region.trim(),
      district: district.trim(),
      facility: facility.trim(),
      role: role.trim() || 'Katta hamshira',
      phone: phone.trim() || '+998 90 123-45-67'
    });
  };

  const isFormValid = Boolean(
    firstName.trim() &&
    lastName.trim() &&
    region.trim() &&
    facility.trim()
  );

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {!isInitialSetup && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors cursor-pointer z-10"
            title="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Modal Top Header */}
        <div className="p-6 border-b border-blue-100 bg-linear-to-r from-blue-700 via-blue-600 to-indigo-700 text-white relative">
          <div className="w-12 h-12 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center mb-3 border border-white/20 shadow-inner">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold tracking-tight text-white">
              {isInitialSetup ? "Xush kelibsiz! Hamshira Ro‘yxati" : "Hamshira Profilini Tahrirlash"}
            </h2>
            {isInitialSetup && (
              <span className="bg-amber-400 text-slate-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center shadow-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                Birinchi kirish
              </span>
            )}
          </div>
          <p className="text-xs text-blue-100/90 mt-1 font-medium leading-relaxed">
            {isInitialSetup 
              ? "Tizimdan foydalanishni boshlash uchun ismingiz, familiyangiz va ishlaydigan tibbiyot muassasangizni kiriting" 
              : "Shaxsiy ma'lumotlar va hududiy biriktiruvni yangilash"}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto bg-slate-50/50">
          
          {/* Section 1: Ism & Familiya */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center">
              <User className="w-3.5 h-3.5 mr-1 text-blue-600" />
              1. Shaxsiy Ma'lumotlar
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Familiya */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Familiyangiz <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Masalan: Karimova"
                  className="w-full bg-slate-50 focus:bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition shadow-2xs"
                />
              </div>

              {/* Ism */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Ismingiz <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Masalan: Nilufar"
                  className="w-full bg-slate-50 focus:bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition shadow-2xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Otasining ismi */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">
                  Otasining ismi <span className="text-slate-400 text-[10px]">(ixtiyoriy)</span>
                </label>
                <input 
                  type="text" 
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  placeholder="Masalan: Erkinovna"
                  className="w-full bg-slate-50 focus:bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition shadow-2xs"
                />
              </div>

              {/* Telefon raqami */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600 flex items-center">
                  <Phone className="w-3 h-3 mr-1 text-blue-600" />
                  Telefon raqam
                </label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 90 123-45-67"
                  className="w-full bg-slate-50 focus:bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Hudud (Viloyat va Tuman) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1 text-blue-600" />
              2. Hududiy Joylashuv
            </div>

            <RegionDistrictSelector
              selectedRegion={region}
              selectedDistrict={district}
              onRegionChange={(reg) => {
                setRegion(reg);
              }}
              onDistrictChange={(dist) => {
                setDistrict(dist);
                if (dist && (!facility || facility.includes('OSHP') || facility.includes('FAP'))) {
                  setFacility(`${dist} oilaviy shifokorlik punkti (OSHP №1)`);
                }
              }}
              required
              regionLabel="Viloyat / Hududingiz:"
              districtLabel="Tuman / Shahringiz:"
            />
          </div>

          {/* Section 3: Ish Joyi va Lavozim */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center">
              <Building className="w-3.5 h-3.5 mr-1 text-blue-600" />
              3. Ish Joyi & Lavozim
            </div>

            {/* Tibbiyot Muassasasi */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Tibbiyot Muassasasi (FAP / OSHP / QVP) <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                required
                value={facility}
                onChange={(e) => setFacility(e.target.value)}
                placeholder="Masalan: Urgut tumani 14-son OSHP yoki Burchmulla FAP №4"
                className="w-full bg-slate-50 focus:bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition shadow-2xs"
              />
            </div>

            {/* Lavozim */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center">
                <Briefcase className="w-3 h-3 mr-1 text-blue-600" />
                Lavozimingiz:
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-50 focus:bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none transition cursor-pointer shadow-2xs"
              >
                <option value="Katta hamshira">Katta hamshira / Bosh hamshira</option>
                <option value="Umumiy amaliyot hamshirasi (UAH)">Umumiy amaliyot hamshirasi (UAH)</option>
                <option value="Feldsher (Birlamchi tez yordam)">Feldsher (Birlamchi tez yordam)</option>
                <option value="Patronaj hamshira">Patronaj hamshira</option>
                <option value="Akusherka / Doya">Akusherka / Doya</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
            {!isInitialSetup && (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-xs cursor-pointer"
              >
                Bekor qilish
              </button>
            )}
            <button
              type="submit"
              disabled={!isFormValid}
              className="px-6 py-2.5 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-md hover:shadow-lg text-xs cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isInitialSetup ? "Ro‘yxatdan O‘tish & Tizimga Kirish" : "Profilni Saqlash"}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
