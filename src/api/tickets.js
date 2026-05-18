import api from './axiosInstance';

export const getTickets = (params) =>
  api.get('/api/tickets/', { params });

export const createTicket = (data) =>
  api.post('/api/tickets/', data);

export const getTicket = (id) =>
  api.get(`/api/tickets/${id}/`);

export const updateTicket = (id, data) =>
  api.patch(`/api/tickets/${id}/`, data);

export const getComments = (ticketId) =>
  api.get(`/api/tickets/${ticketId}/comments/`);

export const createComment = (ticketId, data) =>
  api.post(`/api/tickets/${ticketId}/comments/`, data);
