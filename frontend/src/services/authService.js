import api from './api.js';

const register = async (payload) => {
  const { data } = await api.post('/auth/register', payload);
  return data;
};

const login = async (payload) => {
  const { data } = await api.post('/auth/login', payload);
  return data;
};

const googleSignIn = async (payload) => {
  const { data } = await api.post('/auth/google', payload);
  return data;
};

const verifyOtp = async (payload) => {
  const { data } = await api.post('/auth/verify-otp', payload);
  return data;
};

const resendOtp = async (payload) => {
  const { data } = await api.post('/auth/resend-otp', payload);
  return data;
};

export default {
  googleSignIn,
  login,
  resendOtp,
  register,
  verifyOtp,
};
