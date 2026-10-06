import React, { useState, useRef } from 'react';
import {
  Camera,
  Image,
  Trash2,
  ZoomIn,
  X,
  FileText,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { ClinicalPhoto } from '../types';

interface ClinicalPhotoUploadProps {
  photos: ClinicalPhoto[];
  onPhotosChange: (photos: ClinicalPhoto[]) => void;
}

const CATEGORIES = [
  { id: 'ecg', labelUz: 'EKG tasmasi' },
  { id: 'skin_rash', labelUz: 'Teri toshmasi / dog‘lar' },
  { id: 'wound', labelUz: 'Yara / jarohat' },
  { id: 'throat', labelUz: 'Tomoq / murtaklar' },
  { id: 'swelling', labelUz: 'Shish / bo‘g‘im' },
  { id: 'other', labelUz: 'Boshqa klinik holat' },
] as const;

export const ClinicalPhotoUpload: React.FC<ClinicalPhotoUploadProps> = ({
  photos,
  onPhotosChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<ClinicalPhoto['category']>('ecg');
  const [photoNote, setPhotoNote] = useState('');
  const [previewPhoto, setPreviewPhoto] = useState<ClinicalPhoto | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const catObj = CATEGORIES.find((c) => c.id === selectedCategory);

        const newPhoto: ClinicalPhoto = {
          id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          url: result,
          fileName: file.name,
          category: selectedCategory,
          categoryUz: catObj?.labelUz || 'Klinik surat',
          notes: photoNote.trim() || undefined,
          capturedAt: new Date().toISOString(),
        };

        onPhotosChange([...photos, newPhoto]);
        setPhotoNote('');
      };
      reader.readAsDataURL(file);
    });

    // Reset input value so same file can be re-selected if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = (id: string) => {
    onPhotosChange(photos.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-3 p-4 rounded-xl bg-white border border-slate-200">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-700">
          <Camera className="w-4 h-4 text-blue-600" />
          <span>Klinik fotosuratlar va EKG tasmasi</span>
        </div>
        <span className="text-[11px] text-slate-600 font-medium">
          {photos.length} ta surat biriktirilgan
        </span>
      </div>

      <p className="text-[11px] text-slate-600">
        Bemorning EKG lentasi, teridagi toshmalar, jarohat yoki tomoq ko‘rinishini rasmga olib biriktiring. Shifokor ushbu suratlarni yuqori sifatda ko‘ra oladi.
      </p>

      {/* Category selector & Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
        <div className="sm:col-span-1 space-y-1">
          <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
            Surat turi / Sohasi:
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.labelUz}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2 space-y-1">
          <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
            Qisqa izoh (ixtiyoriy):
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={photoNote}
              onChange={(e) => setPhotoNote(e.target.value)}
              placeholder="Masalan: 12 tarmoqli EKG, V1-V3 ko‘tarilishi..."
              className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
            {/* Hidden file input with camera capture support */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 transition shadow cursor-pointer shrink-0"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Suratga olish</span>
            </button>
          </div>
        </div>
      </div>

      {/* Thumbnails Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative rounded-xl overflow-hidden bg-slate-50 border border-slate-200 shadow-sm transition hover:border-slate-300"
            >
              <img
                src={photo.url}
                alt={photo.categoryUz}
                className="w-full h-24 sm:h-28 object-cover bg-white"
              />

              {/* Overlay controls */}
              <div className="absolute inset-0 bg-slate-50/80 opacity-0 group-hover:opacity-100 transition flex items-center justify-center space-x-2">
                <button
                  type="button"
                  onClick={() => setPreviewPhoto(photo)}
                  className="p-1.5 rounded-lg bg-slate-200 text-slate-800 hover:text-slate-900 hover:bg-blue-600 transition"
                  title="Kattalashtirib ko‘rish"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeletePhoto(photo.id)}
                  className="p-1.5 rounded-lg bg-slate-200 text-red-600 hover:text-slate-900 hover:bg-red-600 transition"
                  title="O‘chirish"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Bottom label */}
              <div className="p-1.5 bg-slate-50 border-t border-slate-200">
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
      )}

      {/* Fullscreen Preview Modal */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/90 backdrop-blur-md"
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-100">
              <div className="flex items-center space-x-2">
                <Camera className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-900">
                  {previewPhoto.categoryUz}
                </span>
                {previewPhoto.notes && (
                  <span className="text-[11px] text-slate-600">
                    — {previewPhoto.notes}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 flex items-center justify-center bg-black max-h-[75vh]">
              <img
                src={previewPhoto.url}
                alt={previewPhoto.categoryUz}
                className="max-h-[70vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
