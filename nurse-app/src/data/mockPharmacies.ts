import { Pharmacy, PrescriptionOrder } from '../types';

export const INITIAL_PHARMACIES: Pharmacy[] = [
  {
    id: 1,
    name: "Dori-Darmon №14 Markaziy Dorixona",
    address: "Do'stlik MFY, Mustaqillik ko'chasi 12-uy (Markaziy poliklinika yonida)",
    phone: "+998901239901",
    is24_7: true,
    distanceKm: 0.8,
    medicines: [
      { id: 1, name: "Amoksitsillin", dosage: "500 mg", inStock: true, priceUzs: 18000, quantityLeft: 45 },
      { id: 2, name: "Paratsetamol", dosage: "500 mg", inStock: true, priceUzs: 4500, quantityLeft: 120 },
      { id: 3, name: "Ibuprofen", dosage: "400 mg", inStock: true, priceUzs: 8500, quantityLeft: 80 },
      { id: 4, name: "Kaptopril", dosage: "25 mg", inStock: true, priceUzs: 7000, quantityLeft: 60 },
      { id: 5, name: "Enalapril", dosage: "10 mg", inStock: true, priceUzs: 12000, quantityLeft: 50 },
      { id: 6, name: "Aspirin Kardio", dosage: "100 mg", inStock: true, priceUzs: 14000, quantityLeft: 90 },
      { id: 7, name: "Salbutamol aerozol", dosage: "100 mkg", inStock: true, priceUzs: 42000, quantityLeft: 15 },
      { id: 8, name: "Omeprazol", dosage: "20 mg", inStock: true, priceUzs: 15000, quantityLeft: 85 },
      { id: 9, name: "Regidron kukun", dosage: "1 paket", inStock: true, priceUzs: 5000, quantityLeft: 150 },
    ]
  },
  {
    id: 2,
    name: "Grand Pharm Qishloq Shoxobchasi",
    address: "Mirzacho'l MFY, Shifoxona bekati ro'parasi",
    phone: "+998914442211",
    is24_7: false,
    distanceKm: 2.4,
    medicines: [
      { id: 10, name: "Amoksitsillin", dosage: "500 mg", inStock: true, priceUzs: 19500, quantityLeft: 20 },
      { id: 11, name: "Azitromitsin", dosage: "500 mg", inStock: true, priceUzs: 32000, quantityLeft: 25 },
      { id: 12, name: "Kaptopril", dosage: "25 mg", inStock: true, priceUzs: 7500, quantityLeft: 30 },
      { id: 13, name: "Metformin", dosage: "850 mg", inStock: true, priceUzs: 16000, quantityLeft: 70 },
      { id: 14, name: "Seftriakson flakon", dosage: "1.0 g", inStock: true, priceUzs: 11000, quantityLeft: 100 },
      { id: 15, name: "Paratsetamol", dosage: "500 mg", inStock: false, priceUzs: 5000, quantityLeft: 0 },
    ]
  },
  {
    id: 3,
    name: "Nika Farm 24/7 Navbatchi Dorixona",
    address: "Qorasuv qishlog'i, Markaziy bozor ro'parasi",
    phone: "+998935558833",
    is24_7: true,
    distanceKm: 4.1,
    medicines: [
      { id: 16, name: "Paratsetamol", dosage: "500 mg", inStock: true, priceUzs: 4500, quantityLeft: 200 },
      { id: 17, name: "Ibuprofen", dosage: "400 mg", inStock: true, priceUzs: 9000, quantityLeft: 55 },
      { id: 18, name: "Aspirin Kardio", dosage: "100 mg", inStock: true, priceUzs: 14500, quantityLeft: 60 },
      { id: 19, name: "Enalapril", dosage: "10 mg", inStock: true, priceUzs: 12500, quantityLeft: 40 },
      { id: 20, name: "Omeprazol", dosage: "20 mg", inStock: true, priceUzs: 16000, quantityLeft: 40 },
    ]
  }
];

export const INITIAL_PRESCRIPTION_ORDERS: PrescriptionOrder[] = [];
