
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, Role, Company } from '@/types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: User | null;
  userRole: Role | null;
  company: Company | null;
  loading: boolean;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
    setUserRole(null);
    setCompany(null);
  };

  const hasPermission = (permission: string): boolean => {
    return userRole?.permissions.includes(permission) || false;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Get user profile
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = { id: userDoc.id, ...userDoc.data() } as User;
            setUserProfile(userData);

            // Get user role
            const roleDoc = await getDoc(doc(db, 'roles', userData.roleId));
            if (roleDoc.exists()) {
              const roleData = { id: roleDoc.id, ...roleDoc.data() } as Role;
              setUserRole(roleData);
            }

            // Get company
            const companyDoc = await getDoc(doc(db, 'companies', userData.companyId));
            if (companyDoc.exists()) {
              const companyData = { id: companyDoc.id, ...companyDoc.data() } as Company;
              setCompany(companyData);
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUserProfile(null);
        setUserRole(null);
        setCompany(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    userRole,
    company,
    loading,
    logout,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
