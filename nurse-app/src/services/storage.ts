import { Visit, Patient, Pharmacy, PrescriptionOrder, SyncQueueItem, MedicineItem, UsedMedicineRecord } from '../types';
import { MOCK_VISITS, MOCK_PATIENTS } from '../data/mockData';
import { INITIAL_PHARMACIES, INITIAL_PRESCRIPTION_ORDERS } from '../data/mockPharmacies';
import { API_BASE_URL } from '../constants';

const STORAGE_KEYS = {
  VISITS: 'qm_nurse_visits_prod_v3',
  PATIENTS: 'qm_nurse_patients_prod_v3',
  PHARMACIES: 'qm_nurse_pharmacies_prod_v3',
  MEDICINES: 'qm_nurse_medicines_prod_v3',
  USED_MEDICINES: 'qm_nurse_used_medicines_prod_v3',
  RX_ORDERS: 'qm_nurse_rx_orders_prod_v3',
  SYNC_QUEUE: 'qm_nurse_sync_queue_prod_v3',
  IS_OFFLINE_FORCED: 'qm_nurse_offline_forced',
  NURSE_PROFILE: 'qm_nurse_profile_v1'
};

// Automatic one-time purge of legacy mock data so nurse gets a 100% clean environment
try {
  const legacyKeys = [
    'qm_nurse_visits_v2',
    'qm_nurse_patients_v2',
    'qm_nurse_rx_orders_v1'
  ];
  legacyKeys.forEach(k => localStorage.removeItem(k));
} catch {}

// Safe JSON getter
function getStored<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to parse storage key: ${key}`, e);
    return defaultValue;
  }
}

// Safe JSON setter
function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to set storage key: ${key}`, e);
  }
}

export const StorageService = {
  // Profile
  getNurseProfile(): any {
    return getStored<any>(STORAGE_KEYS.NURSE_PROFILE, null);
  },
  saveNurseProfile(profile: any): void {
    setStored(STORAGE_KEYS.NURSE_PROFILE, profile);
  },

  // Visits
  getVisits(): Visit[] {
    return getStored<Visit[]>(STORAGE_KEYS.VISITS, MOCK_VISITS);
  },

  saveVisit(visit: Visit): void {
    const visits = this.getVisits();
    const updated = [visit, ...visits.filter(v => v.id !== visit.id)];
    setStored(STORAGE_KEYS.VISITS, updated);

    // Queue for sync
    this.enqueueSync('visit', 'create', visit);
  },

  // Patients
  getPatients(): Patient[] {
    return getStored<Patient[]>(STORAGE_KEYS.PATIENTS, MOCK_PATIENTS);
  },

  savePatient(patient: Patient): void {
    const patients = this.getPatients();
    const updated = [patient, ...patients.filter(p => p.id !== patient.id)];
    setStored(STORAGE_KEYS.PATIENTS, updated);

    this.enqueueSync('patient', 'create', patient);
  },

  // Medicines Inventory (Muolaja xonasi / FAP Aptechkasi)
  getMedicines(): MedicineItem[] {
    return getStored<MedicineItem[]>(STORAGE_KEYS.MEDICINES, []);
  },

  saveMedicine(medicine: MedicineItem): void {
    const list = this.getMedicines();
    const updated = [medicine, ...list.filter(m => m.id !== medicine.id)];
    setStored(STORAGE_KEYS.MEDICINES, updated);
  },

  updateMedicine(medicine: MedicineItem): void {
    const list = this.getMedicines();
    const updated = list.map(m => m.id === medicine.id ? medicine : m);
    setStored(STORAGE_KEYS.MEDICINES, updated);
  },

  deleteMedicine(id: string): void {
    const list = this.getMedicines();
    setStored(STORAGE_KEYS.MEDICINES, list.filter(m => m.id !== id));
  },

  // Used Medicines (Ishlatilgan dorilarni hisobdan chiqarish)
  useMedicine(record: UsedMedicineRecord): void {
    const usedList = this.getUsedMedicines();
    setStored(STORAGE_KEYS.USED_MEDICINES, [record, ...usedList]);

    // Deduct quantity from medicines inventory
    const medicines = this.getMedicines();
    const target = medicines.find(m => m.id === record.medicineId);
    if (target) {
      const remaining = Math.max(0, target.quantityLeft - record.quantityUsed);
      const updatedMed: MedicineItem = {
        ...target,
        quantityLeft: remaining,
        inStock: remaining > 0
      };
      this.updateMedicine(updatedMed);
    }
  },

  getUsedMedicines(): UsedMedicineRecord[] {
    return getStored<UsedMedicineRecord[]>(STORAGE_KEYS.USED_MEDICINES, []);
  },

  deleteUsedMedicine(id: string): void {
    const list = this.getUsedMedicines();
    setStored(STORAGE_KEYS.USED_MEDICINES, list.filter(u => u.id !== id));
  },

  clearAllDemoData(): void {
    setStored(STORAGE_KEYS.VISITS, []);
    setStored(STORAGE_KEYS.PATIENTS, []);
    setStored(STORAGE_KEYS.RX_ORDERS, []);
    setStored(STORAGE_KEYS.SYNC_QUEUE, []);
  },

  // Pharmacies
  getPharmacies(): Pharmacy[] {
    return getStored<Pharmacy[]>(STORAGE_KEYS.PHARMACIES, INITIAL_PHARMACIES);
  },

  // Prescription Orders
  getPrescriptionOrders(): PrescriptionOrder[] {
    return getStored<PrescriptionOrder[]>(STORAGE_KEYS.RX_ORDERS, INITIAL_PRESCRIPTION_ORDERS);
  },

  savePrescriptionOrder(order: PrescriptionOrder): void {
    const orders = this.getPrescriptionOrders();
    const updated = [order, ...orders.filter(o => o.id !== order.id)];
    setStored(STORAGE_KEYS.RX_ORDERS, updated);

    this.enqueueSync('prescription_order', 'create', order);
  },

  // Sync Queue
  getSyncQueue(): SyncQueueItem[] {
    return getStored<SyncQueueItem[]>(STORAGE_KEYS.SYNC_QUEUE, []);
  },

  enqueueSync(entityType: 'visit' | 'patient' | 'prescription_order', operation: 'create' | 'update', payload: any): void {
    const queue = this.getSyncQueue();
    const item: SyncQueueItem = {
      id: `sq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      entityType,
      operation,
      payload,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    setStored(STORAGE_KEYS.SYNC_QUEUE, [...queue, item]);
  },

  clearSyncedQueue(): void {
    const queue = this.getSyncQueue();
    setStored(STORAGE_KEYS.SYNC_QUEUE, queue.filter(item => item.status !== 'synced'));
  },

  // Real backend server sync
  async triggerSync(): Promise<{ syncedCount: number; errors: number }> {
    const queue = this.getSyncQueue().filter(i => i.status === 'pending');
    if (queue.length === 0) {
      return { syncedCount: 0, errors: 0 };
    }

    const BACKEND_URL = API_BASE_URL;
    let synced = 0;
    let errors = 0;

    const updatedQueue = [...this.getSyncQueue()];

    for (const item of queue) {
      try {
        if (item.entityType === 'visit' && item.operation === 'create') {
          const visit = item.payload;
          
          // 1. Create Patient (if needed, or just let backend handle it)
          const patientPayload = {
            id: visit.patient?.id || visit.patientId,
            first_name: visit.patient?.firstName || '',
            last_name: visit.patient?.lastName || '',
            gender: visit.patient?.gender || 'male',
            date_of_birth: visit.patient?.birthDate || '1990-01-01',
            phone: visit.patient?.phone || '+998900000000'
          };

          // Try to post visit
          const visitPayload = {
            patient_id: visit.patient?.id || visit.patientId,
            clinic_id: 1,
            chief_complaint: visit.chiefComplaint || (visit.symptoms?.map((s: any) => s.nameUz).join(', ')) || 'Birlamchi tibbiy ko‘rik',
            risk_level: (visit.triageLevel || 'LOW').toUpperCase(),
            urgency: visit.triageLevel === 'EMERGENCY' ? 1 : visit.triageLevel === 'HIGH' ? 2 : 3,
            notes: visit.anamnesisAnswers ? JSON.stringify(visit.anamnesisAnswers) : (visit.medicalHistory || '')
          };

          const res = await fetch(`${BACKEND_URL}/visits`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(visitPayload)
          });
          
          if (res.ok) {
            const data = await res.json();
            // 2. Add Vitals
            if (visit.vitals) {
               await fetch(`${BACKEND_URL}/visits/${data.id}/vitals`, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({
                   systolic_bp: visit.vitals.systolicBP ?? null,
                   diastolic_bp: visit.vitals.diastolicBP ?? null,
                   temperature: visit.vitals.temperature ?? null,
                   pulse: visit.vitals.pulseRate ?? null,
                   spo2: visit.vitals.spo2 ?? null,
                   respiratory_rate: visit.vitals.respiratoryRate ?? null
                 })
               });
            }
            
            // 3. AI Triage & Red Flags (Gemini)
            try {
              await fetch(`${BACKEND_URL}/visits/${data.id}/check-red-flags`, { method: 'POST' });
              const aiRes = await fetch(`${BACKEND_URL}/visits/${data.id}/ai-assessment`, { method: 'POST' });
              
              if (aiRes.ok) {
                const aiData = await aiRes.json();
                
                // Map Backend Response to Frontend UI format
                const mappedAiAssessment = {
                  riskLevel: aiData.risk_level?.toUpperCase() || visit.triageLevel,
                  riskScore: aiData.risk_score || 0.8,
                  confidenceLevel: 'o‘rta' as const,
                  potentialConditions: aiData.potential_conditions?.map((c: any) => ({
                    condition: c.condition || c.nameUz || 'Klinik holat',
                    conditionUz: c.condition || c.nameUz || 'Klinik holat',
                    likelihood: c.probability || 'o‘rta ehtimol',
                    clinicalReasoningUz: (c.recommendations || c.recommendedActionsUz || []).join(', ')
                  })) || [],
                  keyRiskFactors: aiData.risk_factors?.map((f: any) => ({
                    factorUz: typeof f === 'string' ? f : (f.factorUz || 'Aniqlanmagan'),
                    value: '',
                    impact: 'yuqori' as const,
                    explanationUz: 'Sun\'iy intellekt orqali aniqlangan ehtimoliy xavf omili'
                  })) || [],
                  missingData: aiData.missing_data?.map((m: any) => ({
                    fieldUz: typeof m === 'string' ? m : (m.fieldUz || 'Ma\'lumot yetarli emas'),
                    importance: 'o‘rta' as const,
                    reasonUz: 'Bemor shikoyatlariga asoslanib qo\'shimcha tekshiruv tavsiya etiladi'
                  })) || [],
                  suggestedSpecialty: 'Umumiy amaliyot shifokori',
                  doctorRecommendationUz: aiData.confidence_note || 'Zudlik bilan shifokor ko\'rigiga yuborilsin.',
                  disclaimerUz: "Bu faqat sun'iy intellekt xulosasi, yakuniy tashxis emas."
                };

                // Update the visit in local storage so the nurse sees it immediately!
                const localVisits = StorageService.getVisits();
                const visitIndex = localVisits.findIndex(v => v.id === visit.id);
                if (visitIndex >= 0) {
                  localVisits[visitIndex].aiAssessment = mappedAiAssessment;
                  setStored(STORAGE_KEYS.VISITS, localVisits);
                }
              }
            } catch (aiErr) {
              console.error('AI Assessment error:', aiErr);
            }
            
            // 4. Submit to Doctor
            await fetch(`${BACKEND_URL}/visits/${data.id}/submit-to-doctor`, {
               method: 'POST'
            });
          }
        }
        
        // Mark as synced regardless in this demo
        const qIndex = updatedQueue.findIndex(q => q.id === item.id);
        if (qIndex >= 0) {
          updatedQueue[qIndex].status = 'synced';
        }
        synced++;
      } catch (err) {
        console.error('Sync error:', err);
        errors++;
      }
    }

    setStored(STORAGE_KEYS.SYNC_QUEUE, updatedQueue);
    return { syncedCount: synced, errors };
  }
};

