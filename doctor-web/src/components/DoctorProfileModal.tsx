import React, { useState } from 'react';
import type { DoctorProfile } from '../types';
import { MEDICAL_SPECIALTIES } from '../constants';
import { 
  Stethoscope, 
  ShieldCheck, 
  Building2, 
  Phone, 
  Mail, 
  Award, 
  Check, 
  X,
  UserCheck
} from 'lucide-react';

import { RegionDistrictSelector } from './RegionDistrictSelector';

interface Props {
  currentProfile: DoctorProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: DoctorProfile) => void;
  isInitialSetup?: boolean;
}

export const DoctorProfileModal: React.FC<Props> = ({
  currentProfile,
  isOpen,
  onClose,
  onSave,
  isInitialSetup = false,
}) => {
  const [fullName, setFullName] = useState(currentProfile.fullName || 'Dr. Umid Dilmurodov');
  const [selectedSpecialty, setSelectedSpecialty] = useState(currentProfile.specialty || 'Umumiy amaliyot shifokori (Bosh terapevt)');
  const [selectedCode, setSelectedCode] = useState(currentProfile.specialtyCode || 'general_physician');
  const [region, setRegion] = useState(currentProfile.region || '');
  const [district, setDistrict] = useState(currentProfile.district || '');
  const [organization, setOrganization] = useState(currentProfile.organization || '');
  const [phone, setPhone] = useState(currentProfile.phone || '+998 90 999-99-99');
  const [email, setEmail] = useState(currentProfile.email || 'dilmurodovumid170@gmail.com');
  const [licenseNumber, setLicenseNumber] = useState(currentProfile.licenseNumber || 'UZ-MD-44812');

  if (!isOpen) return null;

  const handleDistrictChange = (newDistrict: string) => {
    setDistrict(newDistrict);
    // If organization is empty or default, suggest localized polyclinic
    if (newDistrict && (!organization || organization.includes('Tuman Markaziy') || organization.includes('markaziy'))) {
      setOrganization(`${newDistrict} markaziy ko'p tarmoqli poliklinikasi`);
    }
  };

  const isFormValid = Boolean(
    fullName.trim() &&
    licenseNumber.trim() &&
    region.trim() &&
    district.trim()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      alert("Iltimos, viloyat va tuman/shaharni tanlang.");
      return;
    }

    const updated: DoctorProfile = {
      ...currentProfile,
      fullName: fullName.trim() || 'Dr. Umid Dilmurodov',
      specialty: selectedSpecialty,
      specialtyCode: selectedCode,
      region: region.trim(),
      district: district.trim(),
      organization: organization.trim() || `${district} Markaziy Ko'p Tarmoqli Poliklinikasi`,
      phone: phone.trim() || '+998 90 999-99-99',
      email: email.trim() || 'dilmurodovumid170@gmail.com',
      licenseNumber: licenseNumber.trim() || 'UZ-MD-44812',
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Header */}
        <div className="bg-linear-to-r from-teal-800 to-slate-900 text-white p-6 relative">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-teal-600/40 border border-teal-400/30 flex items-center justify-center text-white shadow-inner">
              <Stethoscope className="w-6 h-6 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {isInitialSetup ? 'Xush kelibsiz! Shifokor Hududi & Profilini Sozlash' : 'Shifokor Profilini Tahrirlash'}
                </h2>
                {isInitialSetup && (
                  <span className="bg-teal-500/30 text-teal-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-400/30">
                    1-qadam
                  </span>
                )}
              </div>
              <p className="text-xs text-teal-100/90 mt-1 leading-relaxed">
                {isInitialSetup
                  ? "Tizimga kirishdan oldin o'z hududingiz (viloyat va tuman/shahar)ni belgilang. Hamshiralar yuborgan bemorlar avtomatik viloyatlar bo'yicha taqsimlanadi."
                  : "O'z hududingiz va tibbiy mutaxassisligingiz parametrlarini yangilang"}
              </p>
            </div>
          </div>

          {!isInitialSetup && (
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto bg-slate-50/50">
          
          {/* 1. Uzbekistan Region & District Selector (TOP PRIORITY) */}
          <div className="bg-white p-4.5 rounded-xl border-2 border-teal-500/40 shadow-xs relative">
            <div className="flex items-center justify-between mb-3 border-b border-teal-100 pb-2">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-teal-700 text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Faoliyat Hududi (Viloyat va Tuman/Shahar)
                </span>
              </div>
              <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-300">
                Majburiy tanlov
              </span>
            </div>

            <p className="text-[11px] text-slate-600 mb-3 bg-teal-50/60 p-2 rounded-lg border border-teal-100">
              📌 <strong>Muhim:</strong> Hamshiralar kiritgan bemorlar aynan shu kiritilgan viloyatingiz bo'yicha saralanadi va sizning asosiy navbatingizda birinchi bo'lib ko'rsatiladi.
            </p>

            <RegionDistrictSelector
              selectedRegion={region}
              selectedDistrict={district}
              onRegionChange={(newRegion) => {
                setRegion(newRegion);
              }}
              onDistrictChange={handleDistrictChange}
              required
              regionLabel="Siz faoliyat yuritadigan Viloyat:"
              districtLabel="Tuman yoki Shahar:"
            />

            {!region && (
              <p className="text-[11px] text-rose-600 font-semibold mt-2 flex items-center">
                * Davom etish uchun iltimos viloyatni tanlang
              </p>
            )}
          </div>

          {/* 2. Doctor Full Name & License */}
          <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
              <span className="w-6 h-6 rounded-full bg-slate-700 text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Shifokor Ma'lumotlari
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                  <UserCheck className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
                  Shifokor F.I.Sh:
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Masalan: Dr. Umid Dilmurodov"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                  <Award className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
                  Shifokorlik ID / Litsenziya:
                </label>
                <input
                  type="text"
                  required
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="Masalan: UZ-MD-44812"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* 3. Medical Specialty Selection Cards */}
          <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-slate-700 text-white text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-1.5 text-teal-600" />
                  Shifokorlik Sohasi / Mutaxassisligi
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {MEDICAL_SPECIALTIES.map((spec) => {
                const IconComponent = spec.icon;
                const isSelected = selectedCode === spec.code;

                return (
                  <div
                    key={spec.code}
                    onClick={() => {
                      setSelectedCode(spec.code);
                      setSelectedSpecialty(spec.name);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 text-left relative ${
                      isSelected
                        ? 'bg-teal-50/90 border-teal-600 shadow-xs ring-2 ring-teal-600/20'
                        : 'bg-white border-slate-200 hover:border-teal-300 hover:bg-slate-50/80 shadow-2xs'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    <div className="flex-1 pr-5">
                      <div className="text-xs font-bold text-slate-900 leading-snug">
                        {spec.name}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {spec.description}
                      </p>
                    </div>

                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Organization & Contacts */}
          <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
              <span className="w-6 h-6 rounded-full bg-slate-700 text-white text-xs font-bold flex items-center justify-center">
                4
              </span>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Ish Joyi & Bog'lanish
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                <Building2 className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
                Tibbiyot Muassasasi / Ish joyi:
              </label>
              <input
                type="text"
                required
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Masalan: Markaziy Ko'p Tarmoqli Poliklinikasi"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white shadow-2xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                  <Phone className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
                  Telefon raqami:
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 90 999-99-99"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                  <Mail className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
                  Elektron pochta (Email):
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="dilmurodovumid170@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <div>
              {!isFormValid && (
                <span className="text-xs text-rose-600 font-bold">
                  * Iltimos, viloyat va shaharni tanlang
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {!isInitialSetup && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Bekor qilish
                </button>
              )}

              <button
                type="submit"
                disabled={!isFormValid}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition flex items-center space-x-2 ${
                  isFormValid
                    ? 'bg-teal-700 hover:bg-teal-800 text-white cursor-pointer hover:shadow-lg'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Profilni Saqlash & Tizimga Kirish</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
