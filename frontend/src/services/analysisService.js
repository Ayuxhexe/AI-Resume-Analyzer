import api from './api.js';

const analyzeResume = async (payload) => {
  const { data } = await api.post('/analysis/analyze', payload);
  return data;
};

const matchResumeToJob = async (payload) => {
  const { data } = await api.post('/analysis/job-match', payload);
  return data;
};

const getUserAnalyses = async (userId) => {
  const { data } = await api.get(`/analysis/${userId}`);
  return data;
};

export default {
  analyzeResume,
  getUserAnalyses,
  matchResumeToJob,
};
