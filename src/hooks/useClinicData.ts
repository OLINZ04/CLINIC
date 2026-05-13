import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  increment,
  runTransaction,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/utils';

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

export function useClinicData() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubMeds = onSnapshot(query(collection(db, 'medicines'), orderBy('name')), 
      (snapshot) => {
        setMedicines(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Medicine)));
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'medicines')
    );

    const unsubPatients = onSnapshot(query(collection(db, 'patients'), orderBy('dateVisit', 'desc')), 
      (snapshot) => {
        setPatients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient)));
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'patients')
    );

    const unsubPrescriptions = onSnapshot(query(collection(db, 'prescriptions'), orderBy('issuedAt', 'desc')), 
      (snapshot) => {
        setPrescriptions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prescription)));
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'prescriptions')
    );

    setLoading(false);
    return () => {
      unsubMeds();
      unsubPatients();
      unsubPrescriptions();
    };
  }, [auth.currentUser]);

  const addMedicine = async (data: Omit<Medicine, 'id' | 'dateAdded'>) => {
    try {
      await addDoc(collection(db, 'medicines'), {
        ...data,
        dateAdded: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'medicines');
    }
  };

  const updateMedicine = async (id: string, data: Partial<Medicine>) => {
    try {
      await updateDoc(doc(db, 'medicines', id), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `medicines/${id}`);
    }
  };

  const deleteMedicine = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'medicines', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `medicines/${id}`);
    }
  };

  const addPatient = async (data: Omit<Patient, 'id'>) => {
    try {
      const { dateVisit, ...rest } = data;
      await addDoc(collection(db, 'patients'), {
        ...rest,
        dateVisit: dateVisit ? Timestamp.fromDate(new Date(dateVisit)) : serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'patients');
    }
  };

  const updatePatient = async (id: string, data: Partial<Patient>) => {
    try {
      const { dateVisit, ...rest } = data;
      const updateData = { ...rest };
      if (dateVisit) {
        (updateData as any).dateVisit = Timestamp.fromDate(new Date(dateVisit));
      }
      await updateDoc(doc(db, 'patients', id), updateData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `patients/${id}`);
    }
  };

  const deletePatient = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'patients', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `patients/${id}`);
    }
  };

  const issuePrescription = async (patientId: string, medicineId: string, quantity: number) => {
    try {
      await runTransaction(db, async (transaction) => {
        const medRef = doc(db, 'medicines', medicineId);
        const medDoc = await transaction.get(medRef);
        
        if (!medDoc.exists()) throw new Error("Medicine does not exist");
        
        const currentStock = medDoc.data().stock;
        if (currentStock < quantity) throw new Error("Insufficient stock");

        // Use addDoc logic manually in transaction or just setDoc
        const presRef = doc(collection(db, 'prescriptions'));
        transaction.set(presRef, {
          patientId,
          medicineId,
          quantity,
          issuedAt: serverTimestamp()
        });

        transaction.update(medRef, {
          stock: increment(-quantity)
        });
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'prescriptions/transaction');
    }
  };

  const updatePrescription = async (id: string, data: Partial<Prescription>) => {
    try {
      await updateDoc(doc(db, 'prescriptions', id), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `prescriptions/${id}`);
    }
  };

  const deletePrescription = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'prescriptions', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `prescriptions/${id}`);
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
