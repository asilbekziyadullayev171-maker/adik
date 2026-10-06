import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronDown, Check, X, Search, Building } from 'lucide-react';
import {
  UZBEKISTAN_REGIONS,
  searchRegions,
  searchDistricts,
  findRegionByName,
  type RegionData,
} from '../data/uzbekistanRegions';

interface RegionDistrictSelectorProps {
  selectedRegion: string;
  selectedDistrict: string;
  onRegionChange: (region: string) => void;
  onDistrictChange: (district: string) => void;
  required?: boolean;
  className?: string;
  regionLabel?: string;
  districtLabel?: string;
}

export const RegionDistrictSelector: React.FC<RegionDistrictSelectorProps> = ({
  selectedRegion,
  selectedDistrict,
  onRegionChange,
  onDistrictChange,
  required = false,
  className = '',
  regionLabel = 'Viloyat / Hudud',
  districtLabel = 'Tuman / Shahar',
}) => {
  // Region state
  const [regionInput, setRegionInput] = useState(selectedRegion || '');
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [matchedRegions, setMatchedRegions] = useState<RegionData[]>(UZBEKISTAN_REGIONS);

  // District state
  const [districtInput, setDistrictInput] = useState(selectedDistrict || '');
  const [isDistrictOpen, setIsDistrictOpen] = useState(false);
  const [matchedDistricts, setMatchedDistricts] = useState<string[]>([]);

  const regionWrapperRef = useRef<HTMLDivElement>(null);
  const districtWrapperRef = useRef<HTMLDivElement>(null);

  // Sync with prop changes
  useEffect(() => {
    setRegionInput(selectedRegion || '');
  }, [selectedRegion]);

  useEffect(() => {
    setDistrictInput(selectedDistrict || '');
  }, [selectedDistrict]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        regionWrapperRef.current &&
        !regionWrapperRef.current.contains(e.target as Node)
      ) {
        setIsRegionOpen(false);
      }
      if (
        districtWrapperRef.current &&
        !districtWrapperRef.current.contains(e.target as Node)
      ) {
        setIsDistrictOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update region query
  const handleRegionInputChange = (value: string) => {
    setRegionInput(value);
    onRegionChange(value);
    const filtered = searchRegions(value);
    setMatchedRegions(filtered);
    setIsRegionOpen(true);

    // If query matches a region exactly, update districts
    const exact = findRegionByName(value);
    if (exact) {
      setMatchedDistricts(exact.districts);
    }
  };

  const handleSelectRegion = (region: RegionData) => {
    setRegionInput(region.name);
    onRegionChange(region.name);
    setIsRegionOpen(false);
    setMatchedDistricts(region.districts);

    // If district doesn't belong to this region, reset district
    if (districtInput && !region.districts.includes(districtInput)) {
      setDistrictInput('');
      onDistrictChange('');
    }
  };

  // Update district query
  const handleDistrictInputChange = (value: string) => {
    setDistrictInput(value);
    onDistrictChange(value);

    // Filter districts
    const filtered = searchDistricts(regionInput, value);
    setMatchedDistricts(filtered);
    setIsDistrictOpen(true);

    // Auto-detect region if user typed a distinct district without selecting region first
    if (!regionInput && value.length >= 3) {
      for (const reg of UZBEKISTAN_REGIONS) {
        const found = reg.districts.find((d) =>
          d.toLowerCase().includes(value.toLowerCase())
        );
        if (found) {
          setRegionInput(reg.name);
          onRegionChange(reg.name);
          break;
        }
      }
    }
  };

  const handleSelectDistrict = (district: string) => {
    setDistrictInput(district);
    onDistrictChange(district);
    setIsDistrictOpen(false);

    // If region was not selected, auto-fill region for this district
    if (!regionInput) {
      for (const reg of UZBEKISTAN_REGIONS) {
        if (reg.districts.includes(district)) {
          setRegionInput(reg.name);
          onRegionChange(reg.name);
          break;
        }
      }
    }
  };

  const handleOpenDistrictList = () => {
    const list = searchDistricts(regionInput, districtInput);
    setMatchedDistricts(list);
    setIsDistrictOpen(true);
  };

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${className}`}>
      {/* 1. VILOYAT (REGION) INPUT */}
      <div className="relative space-y-1.5" ref={regionWrapperRef}>
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            {regionLabel} {required && <span className="text-red-500">*</span>}
          </span>
          {regionInput && (
            <button
              type="button"
              onClick={() => {
                setRegionInput('');
                onRegionChange('');
                setMatchedRegions(UZBEKISTAN_REGIONS);
              }}
              className="text-[10px] text-slate-600 hover:text-slate-800 transition"
            >
              Tozalash
            </button>
          )}
        </label>

        <div className="relative">
          <input
            type="text"
            required={required}
            value={regionInput}
            onChange={(e) => handleRegionInputChange(e.target.value)}
            onFocus={() => {
              setMatchedRegions(searchRegions(regionInput));
              setIsRegionOpen(true);
            }}
            placeholder="Masalan: Samarqand yoki Toshkent..."
            className="w-full bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl pl-3.5 pr-8 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-600 outline-none transition-all shadow-2xs"
          />

          <button
            type="button"
            onClick={() => {
              setMatchedRegions(searchRegions(regionInput));
              setIsRegionOpen(!isRegionOpen);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-800 p-0.5 cursor-pointer"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isRegionOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {/* Region Autocomplete Dropdown */}
        {isRegionOpen && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
            {matchedRegions.length > 0 ? (
              matchedRegions.map((reg) => {
                const isSelected =
                  regionInput.toLowerCase() === reg.name.toLowerCase() ||
                  regionInput.toLowerCase() === reg.shortName.toLowerCase();

                return (
                  <div
                    key={reg.id}
                    onClick={() => handleSelectRegion(reg)}
                    className={`px-3.5 py-2.5 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'hover:bg-slate-50 text-slate-800 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      <span>{reg.name}</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-normal">
                      {reg.districts.length} tuman
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="p-3 text-center text-xs text-slate-500">
                "{regionInput}" bo‘yicha viloyat topilmadi
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. TUMAN / SHAHAR (DISTRICT) INPUT */}
      <div className="relative space-y-1.5" ref={districtWrapperRef}>
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-blue-600" />
            {districtLabel} {required && <span className="text-red-500">*</span>}
          </span>
          {districtInput && (
            <button
              type="button"
              onClick={() => {
                setDistrictInput('');
                onDistrictChange('');
              }}
              className="text-[10px] text-slate-600 hover:text-slate-800 transition"
            >
              Tozalash
            </button>
          )}
        </label>

        <div className="relative">
          <input
            type="text"
            required={required}
            value={districtInput}
            onChange={(e) => handleDistrictInputChange(e.target.value)}
            onFocus={handleOpenDistrictList}
            placeholder={
              regionInput
                ? `${regionInput} tumanini kiriting...`
                : 'Masalan: Urgut tumani yoki Chilonzor...'
            }
            className="w-full bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl pl-3.5 pr-8 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-600 outline-none transition-all shadow-2xs"
          />

          <button
            type="button"
            onClick={() => {
              if (!isDistrictOpen) handleOpenDistrictList();
              else setIsDistrictOpen(false);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-800 p-0.5 cursor-pointer"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isDistrictOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {/* District Autocomplete Dropdown */}
        {isDistrictOpen && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
            {matchedDistricts.length > 0 ? (
              matchedDistricts.map((dist, idx) => {
                const isSelected =
                  districtInput.toLowerCase() === dist.toLowerCase();

                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectDistrict(dist)}
                    className={`px-3.5 py-2.5 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'hover:bg-slate-50 text-slate-800 font-medium'
                    }`}
                  >
                    <span>{dist}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </div>
                );
              })
            ) : (
              <div className="p-3 text-center text-xs text-slate-500">
                {regionInput
                  ? `${regionInput}da bunday tuman/shahar topilmadi`
                  : `"${districtInput}" bo‘yicha tuman topilmadi`}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
