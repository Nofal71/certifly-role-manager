
export interface User {
  id: string;
  email: string;
  name: string;
  companyId: string;
  roleId: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  companyId: string;
  isDefault: boolean;
  createdAt: Date;
}

export interface Company {
  id: string;
  name: string;
  email: string;
  adminUserId: string;
  createdAt: Date;
  isActive: boolean;
}

export interface Certificate {
  id: string;
  name: string;
  organization: string;
  level: string;
  certificateId: string;
  outputType: string;
  duration: string;
  status: 'active' | 'expired' | 'pending';
  userId: string;
  companyId: string;
  issueDate: Date;
  expiryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export const DEFAULT_PERMISSIONS = [
  { id: 'manage-certificates', name: 'Manage Certificates', description: 'Can view, add, edit, and delete certificates' },
  { id: 'manage-users', name: 'Manage Users', description: 'Can create, edit, and delete users' },
  { id: 'manage-roles', name: 'Manage Roles', description: 'Can create, edit, and delete roles' },
  { id: 'view-reports', name: 'View Reports', description: 'Can view company reports and analytics' }
];
