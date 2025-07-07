
import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Certificate } from '@/types';

export const getCertificates = async (userId: string, companyId: string, isAdmin: boolean = false) => {
  try {
    let q;
    if (isAdmin) {
      // Admin can see all certificates in the company
      q = query(
        collection(db, 'certificates'),
        where('companyId', '==', companyId),
        orderBy('createdAt', 'desc')
      );
    } else {
      // Employee can only see their own certificates
      q = query(
        collection(db, 'certificates'),
        where('userId', '==', userId),
        where('companyId', '==', companyId),
        orderBy('createdAt', 'desc')
      );
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Certificate[];
  } catch (error) {
    console.error('Error fetching certificates:', error);
    throw error;
  }
};

export const addCertificate = async (certificateData: Omit<Certificate, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const certificate = {
      ...certificateData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await addDoc(collection(db, 'certificates'), certificate);
    return { id: docRef.id, ...certificate };
  } catch (error) {
    console.error('Error adding certificate:', error);
    throw error;
  }
};

export const updateCertificate = async (certificateId: string, updates: Partial<Omit<Certificate, 'id' | 'createdAt'>>) => {
  try {
    const certificateRef = doc(db, 'certificates', certificateId);
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };
    await updateDoc(certificateRef, updateData);
  } catch (error) {
    console.error('Error updating certificate:', error);
    throw error;
  }
};

export const deleteCertificate = async (certificateId: string) => {
  try {
    await deleteDoc(doc(db, 'certificates', certificateId));
  } catch (error) {
    console.error('Error deleting certificate:', error);
    throw error;
  }
};
