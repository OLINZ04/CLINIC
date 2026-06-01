import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { auth } from '../lib/firebase';

export interface Medicine {
  id: string;
  name: string;
  category: string;
  stock: number;
  expirationDate: string;
  dateAdded: any;
}

export interface Patient {
  id: string;
  fullname: string;
  age: number;
  gender: string;
  department: string;
  complaint: string;
  diagnosis: string;
  dateVisit: any;
}

export interface Prescription {
  id: string;
  patientId: string;
  medicineId: string;
  quantity: number;
  issuedAt: any;
  patientName?: string;
  medicineName?: string;
}

// Emulate Firebase firestore Timestamp object format (with a .toDate() method)
// to ensure the UI views remain completely untouched and fully functional.
function toFirebaseTimestamp(dateVal: any) {
  if (!dateVal) return null;
  const parsedDate = new Date(dateVal);
  return {
    toDate: () => parsedDate,
    seconds: Math.floor(parsedDate.getTime() / 1000),
    nanoseconds: (parsedDate.getTime() % 1000) * 1000000
  };
}

// Normalize dates returned from Supabase to YYYY-MM-DD string format for safe HTML input binding
function normalizeDateString(dateVal: any): string {
  if (!dateVal) return '';
  try {
    const parsedDate = new Date(dateVal);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString().split('T')[0];
    }
  } catch (err) {
    console.error('Error normalizing date:', err);
  }
  return '';
}

// Column mapping cache to handle PostgreSQL case-folding variations automatically
const columnMappings = {
  medicines: {
    expirationDate: 'expirationDate',
    dateAdded: 'dateAdded'
  },
  patients: {
    dateVisit: 'dateVisit'
  },
  prescriptions: {
    patientId: 'patientId',
    medicineId: 'medicineId',
    issuedAt: 'issuedAt'
  }
};

function detectAndCacheMappings(tableName: 'medicines' | 'patients' | 'prescriptions', sampleItem: any) {
  if (!sampleItem) return;
  const keys = Object.keys(sampleItem);
  
  if (tableName === 'medicines') {
    const expKey = keys.find(k => ['expirationdate', 'expiration_date', 'expirationDate'].includes(k) || k.toLowerCase() === 'expirationdate' || k.toLowerCase() === 'expiration_date');
    if (expKey) columnMappings.medicines.expirationDate = expKey;
    
    const addedKey = keys.find(k => ['dateadded', 'date_added', 'dateAdded'].includes(k) || k.toLowerCase() === 'dateadded' || k.toLowerCase() === 'date_added');
    if (addedKey) columnMappings.medicines.dateAdded = addedKey;
  }
  
  if (tableName === 'patients') {
    const visitKey = keys.find(k => ['datevisit', 'date_visit', 'dateVisit'].includes(k) || k.toLowerCase() === 'datevisit' || k.toLowerCase() === 'date_visit');
    if (visitKey) columnMappings.patients.dateVisit = visitKey;
  }
  
  if (tableName === 'prescriptions') {
    const patKey = keys.find(k => ['patientid', 'patient_id', 'patientId'].includes(k) || k.toLowerCase() === 'patientid' || k.toLowerCase() === 'patient_id');
    if (patKey) columnMappings.prescriptions.patientId = patKey;
    
    const medKey = keys.find(k => ['medicineid', 'medicine_id', 'medicineId'].includes(k) || k.toLowerCase() === 'medicineid' || k.toLowerCase() === 'medicine_id');
    if (medKey) columnMappings.prescriptions.medicineId = medKey;
    
    const issKey = keys.find(k => ['issuedat', 'issued_at', 'issuedAt'].includes(k) || k.toLowerCase() === 'issuedat' || k.toLowerCase() === 'issued_at');
    if (issKey) columnMappings.prescriptions.issuedAt = issKey;
  }
}

export function useClinicData() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMedicines = async () => {
    try {
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .order('name');
      
      if (error) throw error;
      if (data) {
        if (data.length > 0) detectAndCacheMappings('medicines', data[0]);
        setMedicines(data.map(item => ({
          id: String(item.id),
          name: item.name,
          category: item.category || 'General',
          stock: Number(item.stock),
          expirationDate: normalizeDateString(item.expirationDate || item.expiration_date || item.expirationdate || ''),
          dateAdded: toFirebaseTimestamp(item.dateAdded || item.date_added || item.dateadded || item.created_at || new Date())
        })));
      }
    } catch (err) {
      console.error('Supabase Error fetching medicines:', err);
    }
  };

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*');
      
      if (error) throw error;
      if (data) {
        if (data.length > 0) detectAndCacheMappings('patients', data[0]);
        const mapped = data.map(item => ({
          id: String(item.id),
          fullname: item.fullname,
          age: Number(item.age),
          gender: item.gender,
          department: item.department,
          complaint: item.complaint,
          diagnosis: item.diagnosis,
          dateVisit: toFirebaseTimestamp(item.dateVisit || item.date_visit || item.datevisit || item.created_at || new Date())
        }));

        mapped.sort((a, b) => b.dateVisit.toDate().getTime() - a.dateVisit.toDate().getTime());
        setPatients(mapped);
      }
    } catch (err) {
      console.error('Supabase Error fetching patients:', err);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*');
      
      if (error) throw error;
      if (data) {
        if (data.length > 0) detectAndCacheMappings('prescriptions', data[0]);
        const mapped = data.map(item => ({
          id: String(item.id),
          patientId: String(item.patientId || item.patient_id || item.patientid || ''),
          medicineId: String(item.medicineId || item.medicine_id || item.medicineid || ''),
          quantity: Number(item.quantity),
          issuedAt: toFirebaseTimestamp(item.issuedAt || item.issued_at || item.issuedat || item.created_at || new Date())
        }));

        mapped.sort((a, b) => b.issuedAt.toDate().getTime() - a.issuedAt.toDate().getTime());
        setPrescriptions(mapped);
      }
    } catch (err) {
      console.error('Supabase Error fetching prescriptions:', err);
    }
  };

  const seedDummyDataIfEmpty = async () => {
    try {
      // Check if medicines are empty
      const { data: currentMeds, error: medCheckError } = await supabase
        .from('medicines')
        .select('id, name');
      
      if (medCheckError) {
        console.error('Error checking medicines for seeding:', medCheckError);
        return;
      }

      let seededMeds = currentMeds || [];

      if (seededMeds.length === 0) {
        const medsToInsert = [
          { name: 'Paracetamol 500mg', category: 'Painkiller', stock: 150, expirationDate: '2026-12-31' },
          { name: 'Amoxicillin 250mg', category: 'Antibiotic', stock: 85, expirationDate: '2026-06-15' },
          { name: 'Cetirizine 10mg', category: 'Antihistamine', stock: 120, expirationDate: '2026-09-20' },
          { name: 'Ibuprofen 400mg', category: 'Painkiller', stock: 3, expirationDate: '2026-11-10' },
          { name: 'Mefenamic Acid', category: 'Analgesic', stock: 4, expirationDate: '2026-08-05' }
        ];

        const { data: insertedMeds, error: medInsertError } = await supabase
          .from('medicines')
          .insert(medsToInsert)
          .select();

        if (medInsertError) {
          console.error('Error seeding medicines:', medInsertError);
        } else if (insertedMeds) {
          seededMeds = insertedMeds;
        }
      }

      // Check if patients are empty
      const { data: currentPatients, error: patientCheckError } = await supabase
        .from('patients')
        .select('id, fullname');

      if (patientCheckError) {
        console.error('Error checking patients for seeding:', patientCheckError);
        return;
      }

      let seededPatients = currentPatients || [];

      if (seededPatients.length === 0) {
        const patientsToInsert = [
          { fullname: 'John Student Doe', age: 20, gender: 'Male', department: 'Engineering Department', complaint: 'Headache and minor fever', diagnosis: 'General Fatigue' },
          { fullname: 'Jane Smith', age: 19, gender: 'Female', department: 'Information Technology Department', complaint: 'Stomach ache', diagnosis: 'Hyperacidity' },
          { fullname: 'Michael Brown', age: 21, gender: 'Male', department: 'Education Department', complaint: 'Sprained ankle during sports', diagnosis: 'Minor Sprain' }
        ];

        const { data: insertedPatients, error: patientInsertError } = await supabase
          .from('patients')
          .insert(patientsToInsert)
          .select();

        if (patientInsertError) {
          console.error('Error seeding patients:', patientInsertError);
        } else if (insertedPatients) {
          seededPatients = insertedPatients;
        }
      }

      // Check if prescriptions are empty
      const { data: currentPrescriptions, error: presCheckError } = await supabase
        .from('prescriptions')
        .select('id');

      if (presCheckError) {
        console.error('Error checking prescriptions for seeding:', presCheckError);
        return;
      }

      if ((currentPrescriptions || []).length === 0 && seededMeds.length > 0 && seededPatients.length > 0) {
        const studentDoe = seededPatients.find(p => p.fullname.includes('Doe')) || seededPatients[0];
        const janeSmith = seededPatients.find(p => p.fullname.includes('Smith')) || seededPatients[1] || seededPatients[0];
        const michaelBrown = seededPatients.find(p => p.fullname.includes('Brown')) || seededPatients[2] || seededPatients[0];

        const paracetamol = seededMeds.find(m => m.name.includes('Paracetamol')) || seededMeds[0];
        const mefenamic = seededMeds.find(m => m.name.includes('Mefenamic')) || seededMeds[4] || seededMeds[0];
        const ibuprofen = seededMeds.find(m => m.name.includes('Ibuprofen')) || seededMeds[3] || seededMeds[0];

        const prescriptionsToInsert = [
          { patientId: Number(studentDoe.id), medicineId: Number(paracetamol.id), quantity: 2 },
          { patientId: Number(janeSmith.id), medicineId: Number(mefenamic.id), quantity: 1 },
          { patientId: Number(michaelBrown.id), medicineId: Number(ibuprofen.id), quantity: 3 }
        ];

        const { error: presInsertError } = await supabase
          .from('prescriptions')
          .insert(prescriptionsToInsert);

        if (presInsertError) {
          console.error('Error seeding prescriptions:', presInsertError);
        }
      }
    } catch (err) {
      console.error('Generic error in seeding data:', err);
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    await seedDummyDataIfEmpty();
    await Promise.all([
      fetchMedicines(),
      fetchPatients(),
      fetchPrescriptions()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    if (!auth.currentUser) return;
    fetchAll();

    // Subscribe to supabase realtime changes for reactive updates
    const medsChannel = supabase
      .channel('medicines_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'medicines' }, () => {
        fetchMedicines();
      })
      .subscribe();

    const patientsChannel = supabase
      .channel('patients_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, () => {
        fetchPatients();
      })
      .subscribe();

    const prescriptionsChannel = supabase
      .channel('prescriptions_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prescriptions' }, () => {
        // Since custom transactions alter medicine stock, fetch medicines too
        fetchMedicines();
        fetchPrescriptions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(medsChannel);
      supabase.removeChannel(patientsChannel);
      supabase.removeChannel(prescriptionsChannel);
    };
  }, [auth.currentUser]);

  const addMedicine = async (data: Omit<Medicine, 'id' | 'dateAdded'>) => {
    try {
      const payload: any = {
        name: data.name,
        category: data.category,
        stock: Number(data.stock),
      };
      payload[columnMappings.medicines.expirationDate] = data.expirationDate || null;

      const { error } = await supabase
        .from('medicines')
        .insert(payload);
      if (error) throw error;
      await fetchMedicines();
    } catch (error) {
      console.error('Supabase Error adding medicine:', error);
      throw error;
    }
  };

  const updateMedicine = async (id: string, data: Partial<Medicine>) => {
    try {
      const payload: any = {};
      if (data.name !== undefined) payload.name = data.name;
      if (data.category !== undefined) payload.category = data.category;
      if (data.stock !== undefined) payload.stock = Number(data.stock);
      if (data.expirationDate !== undefined) {
        payload[columnMappings.medicines.expirationDate] = data.expirationDate || null;
      }
      
      const { error } = await supabase
        .from('medicines')
        .update(payload)
        .eq('id', isNaN(Number(id)) ? id : Number(id));
      if (error) throw error;
      await fetchMedicines();
    } catch (error) {
      console.error(`Supabase Error updating medicine ${id}:`, error);
      throw error;
    }
  };

  const deleteMedicine = async (id: string) => {
    try {
      const { error } = await supabase
        .from('medicines')
        .delete()
        .eq('id', isNaN(Number(id)) ? id : Number(id));
      if (error) throw error;
      await fetchMedicines();
    } catch (error) {
      console.error(`Supabase Error deleting medicine ${id}:`, error);
      throw error;
    }
  };

  const addPatient = async (data: Omit<Patient, 'id'>) => {
    try {
      const { dateVisit, ...rest } = data;
      const payload: any = { ...rest };
      const isoDate = dateVisit ? new Date(dateVisit).toISOString() : new Date().toISOString();
      payload[columnMappings.patients.dateVisit] = isoDate;

      const { error } = await supabase
        .from('patients')
        .insert(payload);
      if (error) throw error;
      await fetchPatients();
    } catch (error) {
      console.error('Supabase Error adding patient:', error);
      throw error;
    }
  };

  const updatePatient = async (id: string, data: Partial<Patient>) => {
    try {
      const { dateVisit, ...rest } = data;
      const payload: any = { ...rest };
      if (dateVisit) {
        payload[columnMappings.patients.dateVisit] = new Date(dateVisit).toISOString();
      }
      delete payload.id;
      
      const { error } = await supabase
        .from('patients')
        .update(payload)
        .eq('id', isNaN(Number(id)) ? id : Number(id));
      if (error) throw error;
      await fetchPatients();
    } catch (error) {
      console.error(`Supabase Error updating patient ${id}:`, error);
      throw error;
    }
  };

  const deletePatient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', isNaN(Number(id)) ? id : Number(id));
      if (error) throw error;
      await fetchPatients();
    } catch (error) {
      console.error(`Supabase Error deleting patient ${id}:`, error);
      throw error;
    }
  };

  const issuePrescription = async (patientId: string, medicineId: string, quantity: number) => {
    try {
      // Fetch medicine to check stock
      const { data: med, error: medErr } = await supabase
        .from('medicines')
        .select('stock')
        .eq('id', isNaN(Number(medicineId)) ? medicineId : Number(medicineId))
        .single();
      
      if (medErr || !med) throw new Error(medErr?.message || "Medicine does not exist");
      if (med.stock < quantity) throw new Error("Insufficient stock");

      const payload: any = {
        quantity: Number(quantity)
      };
      payload[columnMappings.prescriptions.patientId] = isNaN(Number(patientId)) ? patientId : Number(patientId);
      payload[columnMappings.prescriptions.medicineId] = isNaN(Number(medicineId)) ? medicineId : Number(medicineId);

      // Insert prescription
      const { error: insErr } = await supabase
        .from('prescriptions')
        .insert(payload);
      if (insErr) throw insErr;

      // Deduct medicine stock
      const { error: updErr } = await supabase
        .from('medicines')
        .update({ stock: med.stock - quantity })
        .eq('id', isNaN(Number(medicineId)) ? medicineId : Number(medicineId));
      if (updErr) throw updErr;

      await Promise.all([fetchMedicines(), fetchPrescriptions()]);
    } catch (error) {
      console.error('Supabase Error writing prescription transaction:', error);
      throw error;
    }
  };

  const updatePrescription = async (id: string, data: Partial<Prescription>) => {
    try {
      const payload: any = {};
      if (data.quantity !== undefined) payload.quantity = Number(data.quantity);
      if (data.patientId !== undefined) {
        payload[columnMappings.prescriptions.patientId] = isNaN(Number(data.patientId)) ? data.patientId : Number(data.patientId);
      }
      if (data.medicineId !== undefined) {
        payload[columnMappings.prescriptions.medicineId] = isNaN(Number(data.medicineId)) ? data.medicineId : Number(data.medicineId);
      }

      const { error } = await supabase
        .from('prescriptions')
        .update(payload)
        .eq('id', isNaN(Number(id)) ? id : Number(id));
      if (error) throw error;
      await fetchPrescriptions();
    } catch (error) {
      console.error(`Supabase Error updating prescription ${id}:`, error);
      throw error;
    }
  };

  const deletePrescription = async (id: string) => {
    try {
      const { error } = await supabase
        .from('prescriptions')
        .delete()
        .eq('id', isNaN(Number(id)) ? id : Number(id));
      if (error) throw error;
      await Promise.all([fetchMedicines(), fetchPrescriptions()]);
    } catch (error) {
      console.error(`Supabase Error deleting prescription ${id}:`, error);
      throw error;
    }
  };

  return { 
    medicines, 
    patients, 
    prescriptions, 
    loading,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    addPatient,
    updatePatient,
    deletePatient,
    issuePrescription,
    updatePrescription,
    deletePrescription
  };
}
