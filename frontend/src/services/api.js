import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const ingestResume = async (formData) => {
  return await api.post('/api/ingest/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const submitSimulation = async (payload) => {
  return await api.post('/api/simulation/submit', payload);
};

export default api;
