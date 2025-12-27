import api from './client';

export interface Analysis {
  id: string;
  resumeId: string;
  targetRole?: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  report?: any;
  metrics?: any;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
  resume?: {
    id: string;
    originalFilename: string;
  };
}

export interface CreateAnalysisData {
  resumeId: string;
  targetRole?: string;
}

export const analysisApi = {
  create: async (data: CreateAnalysisData): Promise<Analysis> => {
    const response = await api.post('/analyses', data);
    return response.data;
  },
  getAll: async (): Promise<Analysis[]> => {
    const response = await api.get('/analyses');
    return response.data;
  },
  getOne: async (id: string): Promise<Analysis> => {
    const response = await api.get(`/analyses/${id}`);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/analyses/${id}`);
    return response.data;
  },
};

