
import axiosInstance from '../../axiosinstance';
import { Employee, Role } from '@/types';

export interface CreateEmployeeData {
  email: string;
  password: string;
  fullName: string;
  department: string;
  role: string;
}

export interface UpdateEmployeeData {
  email: string;
  password?: string;
  fullName: string;
  department: string;
  role: string;
}

export const getAllEmployees = async (): Promise<Employee[]> => {
  try {
    const response = await axiosInstance.get('/Employee/all');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching employees:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch employees');
  }
};

export const createEmployee = async (data: CreateEmployeeData) => {
  try {
    const response = await axiosInstance.post('/Employee/create', data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating employee:', error);
    throw new Error(error.response?.data?.message || 'Failed to create employee');
  }
};

export const updateEmployee = async (id: number, data: UpdateEmployeeData) => {
  try {
    const response = await axiosInstance.put(`/Employee/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating employee:', error);
    throw new Error(error.response?.data?.message || 'Failed to update employee');
  }
};

export const deleteEmployee = async (id: number) => {
  try {
    await axiosInstance.delete(`/Employee/${id}`);
  } catch (error: any) {
    console.error('Error deleting employee:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete employee');
  }
};

export const getAllRoles = async (): Promise<Role[]> => {
  try {
    const response = await axiosInstance.get('/Role/all');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching roles:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch roles');
  }
};
