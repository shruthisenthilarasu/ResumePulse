import api from './client';

export interface Resume {
  id: string;
  filename: string;
  originalFilename: string;
  fileSize: number;
  extractionQuality: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    analyses: number;
  };
}

export const resumeApi = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('resume', file);
    const response = await api.post('/resumes', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  getAll: async (): Promise<Resume[]> => {
    const response = await api.get('/resumes');
    return response.data;
  },
  getOne: async (id: string) => {
    const response = await api.get(`/resumes/${id}`);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/resumes/${id}`);
    return response.data;
  },
};

