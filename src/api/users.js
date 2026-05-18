import api from './axiosInstance';

export const getUsers = (params) =>
  api.get('/api/users/', { params });

export const getUser = (id) =>
  api.get(`/api/users/${id}/`);

export const updateUser = (id, data) =>
  api.patch(`/api/users/${id}/`, data);
