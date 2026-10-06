import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Pharmacy } from '../types';
import L from 'leaflet';
import { PhoneCall } from 'lucide-react';

// Fix Leaflet's default icon issue with React
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// We will generate random coordinates near an arbitrary rural center if none exist
// Bo'stonliq (Tashkent viloyati)
const CENTER: [number, number] = [41.5647, 69.9572]; 

const AutoFitBounds = ({ pharmacies, coords }: { pharmacies: Pharmacy[], coords: Record<number, [number, number]> }) => {
  const map = useMap();
  useEffect(() => {
    if (pharmacies.length > 0) {
      const bounds = L.latLngBounds(pharmacies.map(p => coords[p.id] || [
        CENTER[0] + (Math.random() - 0.5) * 0.05,
        CENTER[1] + (Math.random() - 0.5) * 0.05
      ]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, pharmacies, coords]);
  return null;
};

export const PharmacyMap: React.FC<{ pharmacies: Pharmacy[] }> = ({ pharmacies }) => {
  // Mock coordinates for demo
  const mockCoords: Record<number, [number, number]> = {
    1: [41.5700, 69.9500], // Bog'iston
    2: [41.5600, 69.9700], // Oltinsoy
    3: [41.5900, 69.9900], // Chorbog'
  };

  return (
    <div className="h-[450px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-xl relative z-0">
      <MapContainer
        center={CENTER}
        zoom={12}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <AutoFitBounds pharmacies={pharmacies} coords={mockCoords} />

        {pharmacies.map((pharmacy) => {
          const position = mockCoords[pharmacy.id] || [
            CENTER[0] + (Math.random() - 0.5) * 0.05,
            CENTER[1] + (Math.random() - 0.5) * 0.05
          ];

          return (
            <Marker key={pharmacy.id} position={position as [number, number]}>
              <Popup>
                <div className="p-1 min-w-[180px]">
                  <h4 className="font-bold text-slate-800 mb-1 leading-tight">{pharmacy.name}</h4>
                  <p className="text-xs text-slate-600 mb-2">{pharmacy.address}</p>
                  {pharmacy.is24_7 && (
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded border border-blue-200 inline-block mb-2">
                      24/7 Navbatchi
                    </span>
                  )}
                  <a
                    href={`tel:${pharmacy.phone}`}
                    className="flex items-center space-x-1.5 text-xs text-emerald-700 font-semibold hover:text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 transition"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{pharmacy.phone}</span>
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
