
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { collection, doc, setDoc, addDoc, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, Role, Company, DEFAULT_PERMISSIONS } from '@/types';

export const signupCompany = async (companyData: {
  companyName: string;
  adminName: string;
  email: string;
  password: string;
}) => {
  try {
    // Create Firebase auth user
    const userCredential = await createUserWithEmailAndPassword(auth, companyData.email, companyData.password);
    const user = userCredential.user;

    // Create company document
    const companyRef = doc(collection(db, 'companies'));
    const company: Omit<Company, 'id'> = {
      name: companyData.companyName,
      email: companyData.email,
      adminUserId: user.uid,
      createdAt: new Date(),
      isActive: true
    };
    await setDoc(companyRef, company);

    // Create default admin role
    const adminRoleRef = doc(collection(db, 'roles'));
    const adminRole: Omit<Role, 'id'> = {
      name: 'Admin',
      permissions: DEFAULT_PERMISSIONS.map(p => p.id),
      companyId: companyRef.id,
      isDefault: true,
      createdAt: new Date()
    };
    await setDoc(adminRoleRef, adminRole);

    // Create default employee role
    const employeeRoleRef = doc(collection(db, 'roles'));
    const employeeRole: Omit<Role, 'id'> = {
      name: 'Employee',
      permissions: ['manage-certificates'],
      companyId: companyRef.id,
      isDefault: true,
      createdAt: new Date()
    };
    await setDoc(employeeRoleRef, employeeRole);

    // Create user profile
    const userProfile: Omit<User, 'id'> = {
      email: companyData.email,
      name: companyData.adminName,
      companyId: companyRef.id,
      roleId: adminRoleRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };
    await setDoc(doc(db, 'users', user.uid), userProfile);

    return { user, company: { id: companyRef.id, ...company } };
  } catch (error) {
    console.error('Company signup error:', error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const createEmployee = async (employeeData: {
  name: string;
  email: string;
  companyId: string;
  roleId?: string;
}) => {
  try {
    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    
    // Create Firebase auth user
    const userCredential = await createUserWithEmailAndPassword(auth, employeeData.email, tempPassword);
    const user = userCredential.user;

    // Get default employee role if no role specified
    let roleId = employeeData.roleId;
    if (!roleId) {
      const rolesQuery = query(
        collection(db, 'roles'),
        where('companyId', '==', employeeData.companyId),
        where('name', '==', 'Employee')
      );
      const rolesSnapshot = await getDocs(rolesQuery);
      if (!rolesSnapshot.empty) {
        roleId = rolesSnapshot.docs[0].id;
      }
    }

    // Create user profile
    const userProfile: Omit<User, 'id'> = {
      email: employeeData.email,
      name: employeeData.name,
      companyId: employeeData.companyId,
      roleId: roleId!,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };
    await setDoc(doc(db, 'users', user.uid), userProfile);

    // Send password reset email for the employee to set their password
    await sendPasswordResetEmail(auth, employeeData.email);

    return { user, tempPassword };
  } catch (error) {
    console.error('Create employee error:', error);
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};
