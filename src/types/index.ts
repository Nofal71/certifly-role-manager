
export interface User {
  id: number;
  email: string;
  roleId: number;
  role: string;
  company: {
    id: number;
    companyName: string;
  };
}

export interface Employee {
  id: number;
  fullName: string;
  department: string;
  userId: number;
  user: {
    id: number;
    email: string;
    roleId: number;
    role: string;
  };
}

export interface Role {
  id: number;
  name: string;
}

export interface Certificate {
  id: number;
  courseName: string;
  courseLink?: string;
  organization?: string;
  certificateName?: string;
  level?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  demo?: string;
  userId: number;
}
