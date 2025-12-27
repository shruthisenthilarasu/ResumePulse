import api from './client';

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
  username?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const authApi = {
  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  login: async (data: LoginData) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
};

