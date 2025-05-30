import { api } from './api';

export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    console.log('Login attempt for:', email);
    const response = await api.post('/auth/login', { email, password });
    console.log('Login response:', response.data);
    
    if (response.data.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      console.log('Login successful, token saved');
    } else {
      console.error('Login failed:', response.data.error);
      throw new Error(response.data.error || 'Login failed');
    }
    return response.data;
  } catch (error: any) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (
  fullName: string,
  email: string,
  password: string,
  phone: string
): Promise<AuthResponse> => {
  const response = await api.post('/auth/register', {
    username: fullName,
    email,
    password,
    phone
  });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem('token') !== null;
};