
import { collection, getDocs, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User, Role } from '@/types';

export const getCompanyUsers = async (companyId: string) => {
  try {
    const q = query(
      collection(db, 'users'),
      where('companyId', '==', companyId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getCompanyRoles = async (companyId: string) => {
  try {
    const q = query(
      collection(db, 'roles'),
      where('companyId', '==', companyId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Role[];
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
};

export const updateUser = async (userId: string, updates: Partial<User>) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (userId: string) => {
  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};
