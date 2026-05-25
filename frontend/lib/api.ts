import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

console.log('API baseURL:', process.env.NEXT_PUBLIC_API_URL);
// Employee APIs
export const employeeApi = {
getAll: (params?: Record<string, any>) =>
    api.get('/api/v1/employees', { params }).then(r => {
      return {
        data: r.data.data.data ?? [],
        total: r.data.data.total ?? 0,
        page: r.data.data.page ?? 1,
        limit: r.data.data.limit ?? 20,
      };
    }),

  getOne: (id: string) =>
    api.get(`/api/v1/employees/${id}`).then(r => r.data),

  create: (data: any) =>
    api.post('/api/v1/employees', data).then(r => r.data),

  update: (id: string, data: any) =>
    api.patch(`/api/v1/employees/${id}`, data).then(r => r.data),

  remove: (id: string) =>
    api.delete(`/api/v1/employees/${id}`).then(r => r.data),
};

// Insights APIs
export const insightsApi = {
  getCountry: (country: string) =>
    api.get(`/api/v1/insights/country/${country}`).then(r => r.data.data),

  getJobTitle: (title: string, country: string) =>
    api.get('/api/v1/insights/job-title', { params: { title, country } }).then(r => r.data.data),

  getDepartment: (country: string) =>
    api.get('/api/v1/insights/department', { params: { country } }).then(r => r.data.data),

  getTopEarners: (country: string, limit = 5) =>
    api.get('/api/v1/insights/top-earners', { params: { country, limit } }).then(r => r.data.data),
};

export default api; 