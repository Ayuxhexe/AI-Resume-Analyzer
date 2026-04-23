import api from './api.js';

const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append('resume', file);

  const { data } = await api.post('/resume/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return data;
};

const getResume = async (resumeId) => {
  const { data } = await api.get(`/resume/${resumeId}`);
  return data;
};

export default {
  getResume,
  uploadResume,
};
