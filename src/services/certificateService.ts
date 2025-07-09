
import axiosInstance from '../../axiosinstance';
import { Certificate } from '@/types';

export interface CreateCertificateData {
  courseName: string;
  courseLink?: string;
  organization?: string;
  certificateName?: string;
  level?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  demo?: string;
  userId?: number;
}

export const getAllCertificates = async (): Promise<Certificate[]> => {
  try {
    const response = await axiosInstance.get('/Certification/all');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching all certificates:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch certificates');
  }
};

export const getMyCertificates = async (): Promise<Certificate[]> => {
  try {
    const response = await axiosInstance.get('/Certification/my');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching my certificates:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch certificates');
  }
};

export const createCertificate = async (data: CreateCertificateData) => {
  try {
    const response = await axiosInstance.post('/Certification/create', data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating certificate:', error);
    throw new Error(error.response?.data?.message || 'Failed to create certificate');
  }
};

export const updateCertificate = async (id: number, data: CreateCertificateData) => {
  try {
    const response = await axiosInstance.put(`/Certification/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating certificate:', error);
    throw new Error(error.response?.data?.message || 'Failed to update certificate');
  }
};

export const deleteCertificate = async (id: number) => {
  try {
    await axiosInstance.delete(`/Certification/${id}`);
  } catch (error: any) {
    console.error('Error deleting certificate:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete certificate');
  }
};

export const getAllUsers = async () => {
  try {
    const response = await axiosInstance.get('/Employee/all');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching users:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch users');
  }
};
