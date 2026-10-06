import React, { useState, useEffect } from 'react';
import {
  Building,
  PhoneCall,
  Clock,
  Pill,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Send,
  ChevronDown,
  ChevronUp,
  Receipt,
  MapPin,
  AlertCircle,
  Plus,
  MinusCircle,
  Printer,
  Download,
  Trash2,
  Edit2,
  FileSpreadsheet,
  X,
  Calendar,
  User,
  ShieldCheck,
  Package,
  Layers,
  Map as MapIcon,
  HelpCircle
} from 'lucide-react';
import { Pharmacy, PrescriptionOrder, Visit, MedicineItem, UsedMedicineRecord, Patient } from '../types';
import { PharmacyMap } from './PharmacyMap';
import { StorageService } from '../services/storage';

interface PharmaciesTabProps {
  pharmacies: Pharmacy[];
  prescriptionOrders: PrescriptionOrder[];
  reviewedVisits: Visit[];
  onOpenSendPrescription: (pharmacyId?: number) => void;
  nurseProfile?: any;
  patients?: Patient[];
  onMedicinesCountChange?: (count: number) => void;
}

export const PharmaciesTab: React.FC<PharmaciesTabProps> = ({
  pharmacies,
  prescriptionOrders,
  reviewedVisits,
  onOpenSendPrescription,
  nurseProfile,
  patients = [],
  onMedicinesCountChange,
}) => {
  // Main view modes: 'inventory' (Aptechka), 'dispensed' (Chiqimlar), 'external' (Dorixonalar)
  const [viewSection, setViewSection] = useState<'inventory' | 'dispensed' | 'external'>('inventory');

  // Inventory & Used medicines state
  const [medicines, setMedicines] = useState<MedicineItem[]>(() => StorageService.getMedicines());
  const [usedMedicines, setUsedMedicines] = useState<UsedMedicineRecord[]>(() => StorageService.getUsedMedicines());

  // Search & Filters for medicines
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modals state
  const [isAddMedicineOpen, setIsAddMedicineOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<MedicineItem | null>(null);
  const [isDispenseModalOpen, setIsDispenseModalOpen] = useState(false);
  const [dispenseTargetMed, setDispenseTargetMed] = useState<MedicineItem | null>(null);
  const [isPrintReportOpen, setIsPrintReportOpen] = useState(false);

  // Form states for Add/Edit Medicine
  const [medForm, setMedForm] = useState({
    name: '',
    dosage: '',
    category: 'Inyeksiya / Ampula',
    quantityLeft: 10,
    unit: 'ampula',
    priceUzs: 0,
    expiryDate: '',
    notes: '',
  });

  // Form states for Dispense (Chiqim qilish)
  const [dispenseForm, setDispenseForm] = useState({
    medicineId: '',
    quantityUsed: 1,
    patientName: '',
    patientId: '',
    reason: 'Shoshilinch tibbiy yordam',
    nurseName: nurseProfile?.fullName || 'Nodira Karimova',
    usedAt: new Date().toISOString().substring(0, 16),
  });

  // External pharmacies state
  const [pharmacySearchQuery, setPharmacySearchQuery] = useState('');
  const [pharmacyFilter, setPharmacyFilter] = useState<'all' | '24_7' | 'orders' | 'map'>('all');
  const [expandedPharmacyId, setExpandedPharmacyId] = useState<number | null>(1);

  // Sync count to parent if provided
  useEffect(() => {
    if (onMedicinesCountChange) {
      onMedicinesCountChange(medicines.length);
    }
  }, [medicines.length, onMedicinesCountChange]);

  // Keep nurse name updated in dispense form
  useEffect(() => {
    if (nurseProfile?.fullName) {
      setDispenseForm((prev) => ({ ...prev, nurseName: nurseProfile.fullName }));
    }
  }, [nurseProfile?.fullName]);

  // Reload medicines & used list helper
  const reloadData = () => {
    const meds = StorageService.getMedicines();
    const used = StorageService.getUsedMedicines();
    setMedicines(meds);
    setUsedMedicines(used);
  };

  // Handlers for Medicine Inventory
  const handleOpenAddMedicine = () => {
    setEditingMedicine(null);
    setMedForm({
      name: '',
      dosage: '',
      category: 'Inyeksiya / Ampula',
      quantityLeft: 10,
      unit: 'ampula',
      priceUzs: 0,
      expiryDate: '',
      notes: '',
    });
    setIsAddMedicineOpen(true);
  };

  const handleOpenEditMedicine = (med: MedicineItem) => {
    setEditingMedicine(med);
    setMedForm({
      name: med.name,
      dosage: med.dosage,
      category: med.category,
      quantityLeft: med.quantityLeft,
      unit: med.unit,
      priceUzs: med.priceUzs,
      expiryDate: med.expiryDate || '',
      notes: med.notes || '',
    });
    setIsAddMedicineOpen(true);
  };

  const handleSaveMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medForm.name.trim()) {
      alert('Iltimos, dori nomini kiriting!');
      return;
    }

    const qty = Number(medForm.quantityLeft) || 0;

    if (editingMedicine) {
      const updated: MedicineItem = {
        ...editingMedicine,
        name: medForm.name.trim(),
        dosage: medForm.dosage.trim(),
        category: medForm.category,
        quantityLeft: qty,
        unit: medForm.unit.trim() || 'dona',
        priceUzs: Number(medForm.priceUzs) || 0,
        expiryDate: medForm.expiryDate,
        notes: medForm.notes.trim(),
        inStock: qty > 0,
      };
      StorageService.updateMedicine(updated);
    } else {
      const newMed: MedicineItem = {
        id: `med-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: medForm.name.trim(),
        dosage: medForm.dosage.trim(),
        category: medForm.category,
        quantityLeft: qty,
        unit: medForm.unit.trim() || 'dona',
        priceUzs: Number(medForm.priceUzs) || 0,
        expiryDate: medForm.expiryDate,
        notes: medForm.notes.trim(),
        inStock: qty > 0,
        createdAt: new Date().toISOString(),
      };
      StorageService.saveMedicine(newMed);
    }

    setIsAddMedicineOpen(false);
    reloadData();
  };

  const handleDeleteMedicine = (id: string, name: string) => {
    if (confirm(`Haqiqatan ham "${name}" dori vositasini zaxiradan o'chirmoqchimisiz?`)) {
      StorageService.deleteMedicine(id);
      reloadData();
    }
  };

  // Handlers for Dispense (Chiqim qilish / Ishlatish)
  const handleOpenDispenseModal = (targetMed?: MedicineItem) => {
    const defaultMed = targetMed || medicines.find((m) => m.quantityLeft > 0) || medicines[0];
    setDispenseTargetMed(defaultMed || null);
    setDispenseForm({
      medicineId: defaultMed ? defaultMed.id : '',
      quantityUsed: 1,
      patientName: patients[0] ? `${patients[0].lastName} ${patients[0].firstName}` : '',
      patientId: patients[0]?.id || '',
      reason: 'Shoshilinch tibbiy yordam',
      nurseName: nurseProfile?.fullName || 'Nodira Karimova',
      usedAt: new Date().toISOString().substring(0, 16),
    });
    setIsDispenseModalOpen(true);
  };

  const handleConfirmDispense = (e: React.FormEvent) => {
    e.preventDefault();
    const currentMed = medicines.find((m) => m.id === dispenseForm.medicineId);
    if (!currentMed) {
      alert('Iltimos, ishlatilayotgan dori vositasini tanlang!');
      return;
    }

    const qtyToUse = Number(dispenseForm.quantityUsed) || 1;
    if (qtyToUse <= 0) {
      alert("Ishlatilgan miqdor 0 dan katta bo'lishi kerak!");
      return;
    }
    if (qtyToUse > currentMed.quantityLeft) {
      alert(
        `Zaxirada yetarli dori yo'q! Mavjud qoldiq: ${currentMed.quantityLeft} ${currentMed.unit}. Siz ${qtyToUse} kiritdingiz.`
      );
      return;
    }

    const usedRecord: UsedMedicineRecord = {
      id: `used-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      medicineId: currentMed.id,
      medicineName: currentMed.name,
      dosage: currentMed.dosage,
      quantityUsed: qtyToUse,
      unit: currentMed.unit,
      patientName: dispenseForm.patientName.trim() || 'Noma‘lum bemor',
      patientId: dispenseForm.patientId || undefined,
      reason: dispenseForm.reason.trim() || 'Tibbiy muolaja',
      nurseName: dispenseForm.nurseName.trim() || (nurseProfile?.fullName ?? 'Hamshira'),
      usedAt: dispenseForm.usedAt || new Date().toISOString(),
    };

    StorageService.useMedicine(usedRecord);
    setIsDispenseModalOpen(false);
    reloadData();
  };

  const handleDeleteUsedRecord = (id: string) => {
    if (confirm('Ushbu chiqim yozuvini jurnaldan o‘chirmoqchimisiz?')) {
      StorageService.deleteUsedMedicine(id);
      reloadData();
    }
  };

  // Export to CSV helper
  const handleExportCSV = () => {
    if (usedMedicines.length === 0) {
      alert('Eksport qilish uchun ishlatilgan dorilar mavjud emas!');
      return;
    }

    const headers = ['ID', 'Dori Nomi', 'Dozasi', 'Miqdori', 'Birligi', 'Bemor', 'Sababi / Muolaja', 'Hamshira', 'Sana'];
    const rows = usedMedicines.map((item, idx) => [
      idx + 1,
      `"${item.medicineName.replace(/"/g, '""')}"`,
      `"${item.dosage.replace(/"/g, '""')}"`,
      item.quantityUsed,
      `"${item.unit}"`,
      `"${item.patientName.replace(/"/g, '""')}"`,
      `"${item.reason.replace(/"/g, '""')}"`,
      `"${item.nurseName.replace(/"/g, '""')}"`,
      item.usedAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ishlatilgan_dorilar_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered medicines list
  const filteredMedicines = medicines.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.dosage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.notes && m.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || m.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Filtered external pharmacies
  const filteredPharmacies = pharmacies.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(pharmacySearchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(pharmacySearchQuery.toLowerCase()) ||
      p.medicines.some((m) => m.name.toLowerCase().includes(pharmacySearchQuery.toLowerCase()));

    if (pharmacyFilter === '24_7') {
      return matchesSearch && p.is24_7;
    }
    return matchesSearch;
  });

  // Summary counts
  const totalStockItems = medicines.reduce((sum, m) => sum + m.quantityLeft, 0);
  const lowStockCount = medicines.filter((m) => m.quantityLeft > 0 && m.quantityLeft <= 5).length;
  const outOfStockCount = medicines.filter((m) => m.quantityLeft === 0).length;
  const totalDispensedUnits = usedMedicines.reduce((sum, u) => sum + u.quantityUsed, 0);

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* 3-WAY SECTION NAVIGATION BAR */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap sm:flex-nowrap items-center gap-1.5">
        <button
          onClick={() => setViewSection('inventory')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
            viewSection === 'inventory'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Package className="w-4 h-4 shrink-0" />
          <span>Punkt Aptechkasi ({medicines.length})</span>
        </button>

        <button
          onClick={() => setViewSection('dispensed')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
            viewSection === 'dispensed'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Receipt className="w-4 h-4 shrink-0" />
          <span>Ishlatilgan dorilar ({usedMedicines.length})</span>
        </button>

        <button
          onClick={() => setViewSection('external')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
            viewSection === 'external'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Building className="w-4 h-4 shrink-0" />
          <span>Dorixonalar ({pharmacies.length})</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* SECTION 1: PUNKT APTECHKASI / DORI ZAXIRASI               */}
      {/* ========================================================= */}
      {viewSection === 'inventory' && (
        <div className="space-y-5">
          {/* Top Banner & Action Bar */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border border-emerald-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
                <Pill className="w-4 h-4" />
                <span>Birlamchi tibbiyot punkti dori zaxirasi</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Dori-darmonlar va sarf materiallari hisobi
              </h2>
              <p className="text-xs text-slate-600 mt-1 max-w-xl">
                Hamshira tomonidan yangi dorilarni kiritish, qoldiqni nazorat qilish va bemorlarga ishlatilgan dorilarni
                hisobdan chiqarish.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={handleOpenAddMedicine}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>YANGI DORI KIRITISH</span>
              </button>

              <button
                onClick={() => handleOpenDispenseModal()}
                disabled={medicines.length === 0}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-sm flex items-center space-x-1.5 cursor-pointer"
              >
                <MinusCircle className="w-4 h-4 stroke-[2.5]" />
                <span>CHIQIM QILISH (ISHLATISH)</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Dori turlari
              </span>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">{medicines.length} xil</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">
                Jami qoldiq
              </span>
              <p className="text-2xl font-bold text-emerald-600 mt-0.5">{totalStockItems} dona</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block">
                Kam qolganlar
              </span>
              <p className="text-2xl font-bold text-amber-600 mt-0.5">{lowStockCount} ta</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block">
                Chiqim qilingan
              </span>
              <p className="text-2xl font-bold text-blue-600 mt-0.5">{totalDispensedUnits} dona</p>
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Dori nomi, dozasi yoki saqlash joyi bo‘yicha izlash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300/80 rounded-lg text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'Barchasi' },
                { id: 'Inyeksiya / Ampula', label: 'Inyeksiya' },
                { id: 'Tabletka / Kapsula', label: 'Tabletka' },
                { id: 'Antiseptik / Bog‘lov', label: 'Antiseptik' },
                { id: 'Shoshilinch yordam', label: 'Shoshilinch' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategoryFilter(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    categoryFilter === c.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Medicines Grid */}
          {filteredMedicines.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200 space-y-3">
              <Pill className="w-10 h-10 text-slate-400 mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">Dori vositalari topilmadi</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {medicines.length === 0
                    ? "Hozircha punkt aptechkasida dori vositalari kiritilmagan. Yuqoridagi tugma orqali birinchi dorini qo'shing."
                    : 'Qidiruv bo‘yicha mos keladigan dori topilmadi.'}
                </p>
              </div>
              <button
                onClick={handleOpenAddMedicine}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition cursor-pointer inline-flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Yangi dori qo‘shish</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredMedicines.map((med) => {
                const isOutOfStock = med.quantityLeft <= 0;
                const isLow = med.quantityLeft > 0 && med.quantityLeft <= 5;

                return (
                  <div
                    key={med.id}
                    className={`p-4 rounded-2xl border bg-white shadow-sm flex flex-col justify-between transition hover:shadow-md ${
                      isOutOfStock ? 'border-red-200 bg-red-50/20' : isLow ? 'border-amber-200' : 'border-slate-200'
                    }`}
                  >
                    <div>
                      {/* Top badging & category */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 truncate">
                          {med.category}
                        </span>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                            isOutOfStock
                              ? 'bg-red-50 text-red-600 border-red-200'
                              : isLow
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {isOutOfStock ? 'Tugagan' : isLow ? 'Kam qoldi' : 'Mavjud'}
                        </span>
                      </div>

                      {/* Name & Dosage */}
                      <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
                        {med.name}
                      </h3>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">
                        Doza / Shakl: <strong className="text-slate-800">{med.dosage || 'Standart'}</strong>
                      </p>

                      {/* Stock count */}
                      <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                        <span className="text-slate-600">Punkt qoldig‘i:</span>
                        <span
                          className={`font-mono font-bold text-sm ${
                            isOutOfStock ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-emerald-700'
                          }`}
                        >
                          {med.quantityLeft} {med.unit}
                        </span>
                      </div>

                      {/* Notes & Expiry date */}
                      <div className="mt-2 space-y-1 text-[11px] text-slate-500">
                        {med.expiryDate && (
                          <p className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>Muddati: {med.expiryDate}</span>
                          </p>
                        )}
                        {med.notes && (
                          <p className="truncate text-slate-600" title={med.notes}>
                            Joylashuv: {med.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleOpenEditMedicine(med)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                          title="Tahrirlash"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMedicine(med.id, med.name)}
                          className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition cursor-pointer"
                          title="O‘chirish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleOpenDispenseModal(med)}
                        disabled={isOutOfStock}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                      >
                        <MinusCircle className="w-3.5 h-3.5" />
                        <span>Ishlatish</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 2: ISHLATILGAN DORILAR JURNALI & CHIQIM HISOBOTI */}
      {/* ========================================================= */}
      {viewSection === 'dispensed' && (
        <div className="space-y-5">
          {/* Top Banner & Print / Export Action Bar */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border border-blue-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">
                <Receipt className="w-4 h-4" />
                <span>Ishlatilgan dori-darmonlar jurnali (Chiqim dalolatnomasi)</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Sarflangan dorilar va hisobotlarni chiqarish
              </h2>
              <p className="text-xs text-slate-600 mt-1 max-w-xl">
                Bemorlarga qilingan muolajalar davomida sarflangan dorilar qaydnomasi. Hisobotni to‘g‘ridan-to‘g‘ri
                chop etish yoki yuklab olish imkoniyati.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => setIsPrintReportOpen(true)}
                disabled={usedMedicines.length === 0}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold transition shadow-sm flex items-center space-x-1.5 cursor-pointer"
                title="Rasmiy chiqim hisobotini printerga chiqarish yoki PDF qilish"
              >
                <Printer className="w-4 h-4" />
                <span>CHIQIM HISOBOTINI CHIQARISH</span>
              </button>

              <button
                onClick={handleExportCSV}
                disabled={usedMedicines.length === 0}
                className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-700 border border-slate-300 text-xs font-bold transition shadow-sm flex items-center space-x-1.5 cursor-pointer"
                title="Excel/CSV faylda saqlash"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">CSV Yuklash</span>
              </button>

              <button
                onClick={() => handleOpenDispenseModal()}
                disabled={medicines.length === 0}
                className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-sm flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Yangi chiqim</span>
              </button>
            </div>
          </div>

          {/* Records Table / List */}
          {usedMedicines.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200 space-y-3">
              <Receipt className="w-10 h-10 text-slate-400 mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">Hozircha ishlatilgan dorilar yo‘q</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Hamshira bemorga dori berganida yoki muolaja qilganida "Chiqim qilish" orqali ro‘yxatdan chiqaradi.
                </p>
              </div>
              <button
                onClick={() => handleOpenDispenseModal()}
                disabled={medicines.length === 0}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition cursor-pointer inline-flex items-center space-x-1.5"
              >
                <MinusCircle className="w-3.5 h-3.5" />
                <span>Dorini hisobdan chiqarish</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Jami hisobdan chiqarilgan yozuvlar ({usedMedicines.length} ta)
                  </h3>
                  <p className="text-xs text-slate-500">Umumiy sarf: {totalDispensedUnits} dona dori-darmon</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3.5">№</th>
                      <th className="py-3 px-3.5">Dori vositasi</th>
                      <th className="py-3 px-3.5 text-center">Sarflangan miqdor</th>
                      <th className="py-3 px-3.5">Bemor F.I.SH</th>
                      <th className="py-3 px-3.5">Muolaja / Sababi</th>
                      <th className="py-3 px-3.5">Hamshira</th>
                      <th className="py-3 px-3.5">Sana / Vaqt</th>
                      <th className="py-3 px-3.5 text-right">Amal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {usedMedicines.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-3.5 font-mono text-slate-500">{index + 1}</td>
                        <td className="py-3 px-3.5 font-semibold text-slate-900">
                          <div>{item.medicineName}</div>
                          <span className="text-[10px] text-slate-500">{item.dosage}</span>
                        </td>
                        <td className="py-3 px-3.5 text-center">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold font-mono text-xs border border-blue-200">
                            {item.quantityUsed} {item.unit}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 font-medium text-slate-800">{item.patientName}</td>
                        <td className="py-3 px-3.5 text-slate-600 max-w-xs truncate" title={item.reason}>
                          {item.reason}
                        </td>
                        <td className="py-3 px-3.5 text-slate-600 text-[11px]">{item.nurseName}</td>
                        <td className="py-3 px-3.5 font-mono text-[11px] text-slate-500">{item.usedAt}</td>
                        <td className="py-3 px-3.5 text-right">
                          <button
                            onClick={() => handleDeleteUsedRecord(item.id)}
                            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                            title="Yozuvni o‘chirish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 3: HUDUDIY DORIXONALAR TARMOG'I                   */}
      {/* ========================================================= */}
      {viewSection === 'external' && (
        <div className="space-y-6">
          {/* Top Banner & Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
                  <Building className="w-4 h-4" />
                  <span>Qishloq Dorixona Tarmog‘i</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Yaqin dorixonalar va elektron retseptlar
                </h2>
                <p className="text-xs text-slate-600 mt-1 max-w-lg">
                  Shifokor yozgan retseptlarni to‘g‘ridan-to‘g‘ri dorixonaga elektron uzatish, dori qoldig‘ini tekshirish.
                </p>
              </div>

              <div className="mt-4 pt-3 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => onOpenSendPrescription()}
                  disabled={reviewedVisits.length === 0}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold tracking-wide transition shadow-sm flex items-center space-x-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>RETSEPTNI DORIXONAGA YUBORISH</span>
                </button>
                {reviewedVisits.length > 0 && (
                  <span className="text-[11px] text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 font-semibold">
                    {reviewedVisits.length} ta tasdiqlangan retsept mavjud
                  </span>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col justify-between">
              <div className="space-y-0.5">
                <span className="text-[11px] text-slate-600 font-semibold uppercase tracking-wider">
                  Yuborilgan retseptlar
                </span>
                <p className="text-2xl font-bold text-emerald-600">{prescriptionOrders.length} ta faol</p>
              </div>
              <p className="text-xs text-slate-500">Dorixonalarga elektron yuborilgan buyurtmalar</p>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Dori nomi yoki dorixona bo‘yicha qidirish..."
                value={pharmacySearchQuery}
                onChange={(e) => setPharmacySearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300/80 rounded-lg text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setPharmacyFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  pharmacyFilter === 'all'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                Barchasi ({pharmacies.length})
              </button>
              <button
                onClick={() => setPharmacyFilter('24_7')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  pharmacyFilter === '24_7'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                24/7 Navbatchi
              </button>
              <button
                onClick={() => setPharmacyFilter('orders')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  pharmacyFilter === 'orders'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                Buyurtmalar ({prescriptionOrders.length})
              </button>
              <button
                onClick={() => setPharmacyFilter('map')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center space-x-1 ${
                  pharmacyFilter === 'map'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Xarita</span>
              </button>
            </div>
          </div>

          {/* Sub-view: Map */}
          {pharmacyFilter === 'map' && <PharmacyMap pharmacies={filteredPharmacies} />}

          {/* Sub-view: Orders */}
          {pharmacyFilter === 'orders' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Dorixonalarga yuborilgan elektron retseptlar
              </h3>
              {prescriptionOrders.length === 0 ? (
                <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-slate-600 text-xs">
                  Hozircha dorixonaga yuborilgan retseptlar mavjud emas.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {prescriptionOrders.map((order) => (
                    <div key={order.id} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-emerald-600 text-sm bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {order.orderCode}
                            </span>
                            <span className="text-xs font-bold text-slate-900">{order.patientName}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1 flex items-center space-x-1">
                            <Building className="w-3 h-3 text-slate-500" />
                            <span>{order.pharmacyName}</span>
                          </p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-blue-50 text-blue-700 border-blue-200">
                          {order.status === 'ready_for_pickup' ? 'Olib ketishga tayyor' : 'Dorixonaga yetkazildi'}
                        </span>
                      </div>

                      <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px]">
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                          Retsept tarkibi:
                        </span>
                        {order.medications.map((m, idx) => (
                          <div key={idx} className="flex items-center justify-between text-slate-700">
                            <span>
                              • {m.medicationName} ({m.dosage})
                            </span>
                            <span className="text-slate-500">{m.frequency}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                        <span>Tel: {order.patientPhone}</span>
                        <span>
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sub-view: Pharmacy List */}
          {pharmacyFilter !== 'orders' && pharmacyFilter !== 'map' && (
            <div className="space-y-4">
              {filteredPharmacies.map((pharmacy) => {
                const isExpanded = expandedPharmacyId === pharmacy.id;
                return (
                  <div
                    key={pharmacy.id}
                    className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden transition"
                  >
                    <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900 tracking-tight">{pharmacy.name}</h3>
                          {pharmacy.is24_7 && (
                            <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>24/7 Navbatchi</span>
                            </span>
                          )}
                          <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 flex items-center space-x-1">
                            <MapPin className="w-3 h-3 text-slate-600" />
                            <span>{pharmacy.distanceKm} km masofada</span>
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">{pharmacy.address}</p>
                      </div>

                      <div className="flex items-center space-x-2 self-start sm:self-center">
                        <a
                          href={`tel:${pharmacy.phone}`}
                          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                        >
                          <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{pharmacy.phone}</span>
                        </a>

                        <button
                          onClick={() => onOpenSendPrescription(pharmacy.id)}
                          disabled={reviewedVisits.length === 0}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition shadow flex items-center space-x-1.5 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Retsept yuborish</span>
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 bg-slate-50/50">
                      <button
                        onClick={() => setExpandedPharmacyId(isExpanded ? null : pharmacy.id)}
                        className="w-full px-4 sm:px-5 py-2.5 flex items-center justify-between text-xs text-slate-600 hover:text-slate-800 transition cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          <Pill className="w-3.5 h-3.5 text-blue-600" />
                          <span className="font-semibold text-slate-700">
                            Dorixonadagi dori vositalari ({pharmacy.medicines.length} xil)
                          </span>
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {isExpanded && (
                        <div className="px-4 sm:px-5 pb-4 pt-1">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {pharmacy.medicines.map((med) => (
                              <div
                                key={med.id}
                                className="p-2.5 rounded-xl border border-slate-200 bg-white text-xs flex items-center justify-between"
                              >
                                <div>
                                  <span className="font-semibold text-slate-800 block">{med.name}</span>
                                  <span className="text-[10px] text-slate-500 block">
                                    Doza: {med.dosage} · Qoldiq: {med.quantityLeft} dona
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="font-bold text-emerald-600 block text-[11px]">
                                    {med.priceUzs.toLocaleString()} so‘m
                                  </span>
                                  <span className="text-[9px] text-slate-500">Mavjud</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: ADD / EDIT MEDICINE (Hamshira o'zi kiritishi)     */}
      {/* ========================================================= */}
      {isAddMedicineOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg text-slate-900 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingMedicine ? 'Dori vositasini tahrirlash' : 'Yangi dori vositasini kiritish'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Birlamchi tibbiyot punkti dori zaxirasini to‘ldirish
                </p>
              </div>
              <button
                onClick={() => setIsAddMedicineOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveMedicine} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Dori nomi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Paratsetamol, Analgin, Seftriakson, Spirt 70%..."
                  value={medForm.name}
                  onChange={(e) => setMedForm({ ...medForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Dozasi / Shakli
                  </label>
                  <input
                    type="text"
                    placeholder="Masalan: 500 mg, 2 ml ampula, 1 g..."
                    value={medForm.dosage}
                    onChange={(e) => setMedForm({ ...medForm, dosage: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Dori toifasi
                  </label>
                  <select
                    value={medForm.category}
                    onChange={(e) => setMedForm({ ...medForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 transition cursor-pointer"
                  >
                    <option value="Inyeksiya / Ampula">Inyeksiya / Ampula</option>
                    <option value="Tabletka / Kapsula">Tabletka / Kapsula</option>
                    <option value="Antiseptik / Bog‘lov">Antiseptik / Bog‘lov materiali</option>
                    <option value="Shoshilinch yordam">Shoshilinch yordam</option>
                    <option value="Infuzion eritma">Infuzion eritma</option>
                    <option value="Vitamin / Qo‘shimcha">Vitamin / Qo‘shimcha</option>
                    <option value="Boshqa">Boshqa</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mavjud miqdor (Qoldiq) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={medForm.quantityLeft}
                    onChange={(e) => setMedForm({ ...medForm, quantityLeft: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    O‘lchov birligi
                  </label>
                  <select
                    value={medForm.unit}
                    onChange={(e) => setMedForm({ ...medForm, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 transition cursor-pointer"
                  >
                    <option value="ampula">ampula</option>
                    <option value="dona">dona (tabletka/shpris)</option>
                    <option value="flakon">flakon</option>
                    <option value="o‘ram">o‘ram / pachka</option>
                    <option value="metr">metr (bint/leykoplastr)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Yaroqlilik muddati
                  </label>
                  <input
                    type="text"
                    placeholder="Masalan: 2027-12 yoki 12.2027"
                    value={medForm.expiryDate}
                    onChange={(e) => setMedForm({ ...medForm, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Narxi (so‘m, bepul bo‘lsa 0)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={medForm.priceUzs}
                    onChange={(e) => setMedForm({ ...medForm, priceUzs: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Saqlash joyi / Izoh
                </label>
                <input
                  type="text"
                  placeholder="Masalan: A javon, 2-polka yoki Muzlatgich..."
                  value={medForm.notes}
                  onChange={(e) => setMedForm({ ...medForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddMedicineOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  {editingMedicine ? 'O‘zgarishlarni saqlash' : 'Zaxiraga qo‘shish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: DISPENSE MEDICINE (Hisobdan chiqarish / Chiqim)   */}
      {/* ========================================================= */}
      {isDispenseModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg text-slate-900 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-200 bg-blue-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Dorini hisobdan chiqarish (Chiqim qilish)</h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Bemorga ishlatilgan dori miqdorini zaxiradan ayirish va jurnalga qayd qilish
                </p>
              </div>
              <button
                onClick={() => setIsDispenseModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleConfirmDispense} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Ishlatilgan dori vositasi *
                </label>
                <select
                  required
                  value={dispenseForm.medicineId}
                  onChange={(e) => {
                    const sel = medicines.find((m) => m.id === e.target.value);
                    setDispenseTargetMed(sel || null);
                    setDispenseForm({ ...dispenseForm, medicineId: e.target.value });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500 transition cursor-pointer"
                >
                  <option value="">-- Dori vositasini tanlang --</option>
                  {medicines.map((m) => (
                    <option key={m.id} value={m.id} disabled={m.quantityLeft <= 0}>
                      {m.name} ({m.dosage}) — Qoldiq: {m.quantityLeft} {m.unit} {m.quantityLeft <= 0 ? '(Tugagan)' : ''}
                    </option>
                  ))}
                </select>
                {dispenseTargetMed && (
                  <p className="text-[11px] text-emerald-700 font-medium mt-1">
                    Mavjud zaxira: <strong>{dispenseTargetMed.quantityLeft} {dispenseTargetMed.unit}</strong>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Sarflangan miqdor *
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max={dispenseTargetMed ? dispenseTargetMed.quantityLeft : 100}
                    required
                    value={dispenseForm.quantityUsed}
                    onChange={(e) => setDispenseForm({ ...dispenseForm, quantityUsed: parseInt(e.target.value) || 1 })}
                    className="w-32 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 transition"
                  />
                  <span className="text-xs text-slate-600 font-semibold">
                    {dispenseTargetMed ? dispenseTargetMed.unit : 'dona/ampula'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Bemor F.I.SH *
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    placeholder="Bemorning to‘liq ismi va familiyasi..."
                    value={dispenseForm.patientName}
                    onChange={(e) => setDispenseForm({ ...dispenseForm, patientName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 transition"
                  />
                  {patients.length > 0 && (
                    <div className="flex items-center space-x-1 overflow-x-auto text-[11px] text-slate-500 pb-0.5">
                      <span className="shrink-0 text-slate-400">Ro‘yxatdan:</span>
                      {patients.slice(0, 4).map((p) => (
                        <button
                          type="button"
                          key={p.id}
                          onClick={() =>
                            setDispenseForm({
                              ...dispenseForm,
                              patientName: `${p.lastName} ${p.firstName}`,
                              patientId: p.id,
                            })
                          }
                          className="px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-100 hover:text-blue-700 border border-slate-200 transition shrink-0 cursor-pointer"
                        >
                          {p.lastName} {p.firstName[0]}.
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Ishlatish sababi / Tibbiy muolaja *
                </label>
                <select
                  value={dispenseForm.reason}
                  onChange={(e) => setDispenseForm({ ...dispenseForm, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 transition cursor-pointer mb-1.5"
                >
                  <option value="Shoshilinch tibbiy yordam">Shoshilinch tibbiy yordam</option>
                  <option value="Inyeksiya (mushak ichiga)">Inyeksiya (mushak ichiga)</option>
                  <option value="Inyeksiya (tomir ichiga)">Inyeksiya (tomir ichiga)</option>
                  <option value="Yuqori qon bosimi krizini pasaytirish">Yuqori qon bosimi krizini pasaytirish</option>
                  <option value="Istima tushiruvchi muolaja">Istima tushiruvchi muolaja</option>
                  <option value="Yarani tozalash va aseptik bog‘lash">Yarani tozalash va aseptik bog‘lash</option>
                  <option value="Allergiyaga qarshi shoshilinch yordam">Allergiyaga qarshi shoshilinch yordam</option>
                  <option value="Rejali shifokor ko‘rsatmasi">Rejali shifokor ko‘rsatmasi</option>
                  <option value="Boshqa muolaja">Boshqa muolaja</option>
                </select>
                <input
                  type="text"
                  placeholder="Yoki qo‘shimcha aniqlik kiriting..."
                  value={dispenseForm.reason}
                  onChange={(e) => setDispenseForm({ ...dispenseForm, reason: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mas‘ul hamshira
                  </label>
                  <input
                    type="text"
                    value={dispenseForm.nurseName}
                    onChange={(e) => setDispenseForm({ ...dispenseForm, nurseName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Sana va vaqt
                  </label>
                  <input
                    type="datetime-local"
                    value={dispenseForm.usedAt}
                    onChange={(e) => setDispenseForm({ ...dispenseForm, usedAt: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsDispenseModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm flex items-center space-x-1.5 cursor-pointer"
                >
                  <MinusCircle className="w-4 h-4" />
                  <span>Chiqimni tasdiqlash</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: OFFICIAL PRINT REPORT (Chop etish / Chiqarish)   */}
      {/* ========================================================= */}
      {isPrintReportOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 print:p-0 print:bg-white print:fixed print:inset-0">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl text-slate-900 flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
            {/* Top Toolbar (Hidden on print) */}
            <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-100 flex items-center justify-between print:hidden">
              <div className="flex items-center space-x-2">
                <Printer className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Ishlatilgan dori-darmonlar chiqim dalolatnomasi (Chop etish ko‘rinishi)
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Chop etish / PDF</span>
                </button>
                <button
                  onClick={() => setIsPrintReportOpen(false)}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official Report Document */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 font-serif text-slate-900 space-y-6 print:p-4 print:overflow-visible">
              {/* Header */}
              <div className="text-center space-y-1 border-b-2 border-slate-800 pb-4">
                <p className="text-xs uppercase tracking-wider font-sans font-bold text-slate-600">
                  O‘ZBEKISTON RESPUBLIKASI SOG‘LIQNI SAQLASH VAZIRLIGI
                </p>
                <p className="text-xs font-sans font-semibold text-slate-800">
                  {nurseProfile?.region || 'Toshkent viloyati'}, {nurseProfile?.facility || 'Birlamchi tibbiyot punkti'}
                </p>
                <h2 className="text-base sm:text-lg font-bold font-sans uppercase tracking-tight text-slate-900 pt-2">
                  ISHLATILGAN DORI VOSITALARI VA SARF MATERIALLARI CHIQIM DALOLATNOMASI
                </h2>
                <div className="flex items-center justify-between text-xs font-sans text-slate-600 pt-2">
                  <span>Hujjat raqami: #CHQ-{new Date().getFullYear()}-{usedMedicines.length}</span>
                  <span>Hisobot sanasi: {new Date().toLocaleDateString('uz-UZ')} {new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              {/* Responsible staff info */}
              <div className="grid grid-cols-2 text-xs font-sans text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 print:bg-white print:border-slate-400">
                <div>
                  <span className="text-slate-500">Tibbiyot punkti:</span>{' '}
                  <strong>{nurseProfile?.facility || 'Birlamchi tibbiyot punkti (FAP / OSHP)'}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Mas‘ul hamshira:</span>{' '}
                  <strong>{nurseProfile?.fullName || 'Nodira Karimova'}</strong>
                </div>
              </div>

              {/* Table */}
              <div className="border border-slate-800 rounded-sm overflow-hidden">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-slate-100 border-b border-slate-800 text-slate-900 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-2 border-r border-slate-800 text-center w-8">№</th>
                      <th className="py-2.5 px-3 border-r border-slate-800">Dori vositasi nomi va dozasi</th>
                      <th className="py-2.5 px-2 border-r border-slate-800 text-center w-24">Sarflangan miqdor</th>
                      <th className="py-2.5 px-3 border-r border-slate-800">Bemor F.I.SH</th>
                      <th className="py-2.5 px-3 border-r border-slate-800">Ishlatilish sababi / Muolaja</th>
                      <th className="py-2.5 px-3">Sana / Vaqt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {usedMedicines.map((item, idx) => (
                      <tr key={item.id}>
                        <td className="py-2 px-2 text-center border-r border-slate-800 font-mono text-[11px]">{idx + 1}</td>
                        <td className="py-2 px-3 border-r border-slate-800 font-semibold">
                          {item.medicineName} ({item.dosage})
                        </td>
                        <td className="py-2 px-2 text-center border-r border-slate-800 font-bold font-mono">
                          {item.quantityUsed} {item.unit}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-800">{item.patientName}</td>
                        <td className="py-2 px-3 border-r border-slate-800 text-slate-700">{item.reason}</td>
                        <td className="py-2 px-3 font-mono text-[10px] text-slate-600">{item.usedAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total summary */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans space-y-1 print:bg-white print:border-slate-400">
                <p>
                  <strong>Jami hisobdan chiqarilgan dori vositalari:</strong> {usedMedicines.length} ta yozuv bo‘yicha{' '}
                  <span className="font-bold underline">{totalDispensedUnits} birlik (dona/ampula)</span>.
                </p>
                <p className="text-slate-600">
                  Ushbu dori vositalari va tibbiy sarf materiallari bemorlarga ko‘rsatilgan birlamchi tibbiy yordam va
                  muolajalar davomida belgilangan klinik me’yorlarga muvofiq sarflandi.
                </p>
              </div>

              {/* Signatures */}
              <div className="pt-8 grid grid-cols-2 gap-8 text-xs font-sans">
                <div className="space-y-6">
                  <p>Moddiy javobgar hamshira:</p>
                  <p className="border-b border-slate-800 pb-1 font-semibold">
                    {nurseProfile?.fullName || 'Nodira Karimova'} _______________ (imzo)
                  </p>
                </div>

                <div className="space-y-6">
                  <p>Muassasa mudiri / Shifokor:</p>
                  <p className="border-b border-slate-800 pb-1">
                    ________________________________ (imzo)
                  </p>
                </div>
              </div>

              <div className="pt-4 text-center text-[10px] font-sans text-slate-500">
                M.O‘. (Muhr o‘rni) • Shifonuri Birlamchi Tibbiyot Tizimi orqali avtomatik shakllantirildi
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
