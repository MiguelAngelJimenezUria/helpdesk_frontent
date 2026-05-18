import api from './axiosInstance';

export const login = (username, password) =>
  api.post('/api/users/login/', { username, password });

export const register = (data) =>
  api.post('/api/users/register/', data);

export const getMe = () =>
  api.get('/api/users/me/');

export const updateMe = (data) =>
  api.patch('/api/users/me/', data);

export const changePassword = (data) =>
  api.post('/api/users/me/change-password/', data);
