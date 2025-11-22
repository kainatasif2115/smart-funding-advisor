import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auth API
export const authApi = {
  register: async (email: string, password: string) => {
    const response = await api.post('/auth/register', { email, password });
    return response.data;
  },
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
};

// Companies API
export const companiesApi = {
  getAll: async () => {
    const response = await api.get('/companies');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/companies/${id}`);
    return response.data;
  },
  add: async (companyData: any) => {
    const response = await api.post('/companies', companyData);
    return response.data;
  },
  update: async (id: number, companyData: any) => {
    const response = await api.put(`/companies/${id}`, companyData);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/companies/${id}`);
    return response.data;
  },
  searchByName: async (name: string) => {
    const response = await api.post('/companies/search-name', { name });
    return response.data;
  },
  previewByBusinessId: async (businessId: string) => {
    const response = await api.post('/companies/preview-by-id', { business_id: businessId });
    return response.data;
  },
  fetchByBusinessId: async (businessId: string) => {
    const response = await api.post('/companies/fetch-by-id', { business_id: businessId });
    return response.data;
  },
  fetchBySelection: async (businessId: string, companyData?: any) => {
    const response = await api.post('/companies/fetch-by-selection', {
      business_id: businessId,
      company_data: companyData,
    });
    return response.data;
  },
};

// Investors API
export const investorsApi = {
  fetch: async (companyId: number) => {
    const response = await api.post('/investors/fetch', { company_id: companyId });
    return response.data;
  },
  getCached: async (companyId: number) => {
    const response = await api.get(`/investors/${companyId}`);
    return response.data;
  },
};

export default api;
