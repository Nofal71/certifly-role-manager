
import axiosInstance from '../../axiosinstance';
import { User } from '@/types';

export interface SignupData {
  companyName: string;
  ownerName: string;
  adminEmail: string;
  adminPassword: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export const signupCompany = async (data: SignupData) => {
  try {
    const response = await axiosInstance.post('/Company/signup', {
      companyName: data.companyName,
      ownerName: data.ownerName,
      adminEmail: data.adminEmail,
      adminPassword: data.adminPassword
    });
    return response.data;
  } catch (error: any) {
    console.error('Company signup error:', error);
    throw new Error(error.response?.data?.message || 'Failed to create company account');
  }
};

export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await axiosInstance.post('/Auth/signin', {
      email,
      password
    });
    
    const token = response.data.token;
    localStorage.setItem('token', token);
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Get user profile after login
    const userProfile = await getCurrentUser();
    
    return {
      token,
      user: userProfile
    };
  } catch (error: any) {
    console.error('Login error:', error);
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await axiosInstance.get('/Auth/me');
    return response.data;
  } catch (error: any) {
    console.error('Get current user error:', error);
    throw new Error(error.response?.data?.message || 'Failed to get user profile');
  }
};

export const resetPassword = async (newPassword: string) => {
  try {
    const response = await axiosInstance.post('/Auth/reset-password', {
      newPassword
    });
    return response.data;
  } catch (error: any) {
    console.error('Password reset error:', error);
    throw new Error(error.response?.data?.message || 'Failed to reset password');
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  delete axiosInstance.defaults.headers.common['Authorization'];
};
