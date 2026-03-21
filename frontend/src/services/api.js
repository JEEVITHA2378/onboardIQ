import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const ingestResume = async (formData) => {
  return await api.post('/api/ingest', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const getSimulationTasks = async (sessionId) => {
  return await api.get(`/api/simulation-tasks/${sessionId}`);
};

export const submitSimulation = async (payload) => {
  return await api.post('/api/submit-observation', payload);
};

export const generatePathway = async (sessionId) => {
  return await api.get(`/api/generate-pathway/${sessionId}`);
};

export default api;
