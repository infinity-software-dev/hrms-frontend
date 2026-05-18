import api from './axios';

export const submitComplaint = (data) =>
  api.post('/complaints/apply', data);

export const getMyComplaints = () =>
  api.get('/complaints/my');

export const getDirectorComplaints = (filters) => {
  return api.get('/complaints/director', { params: filters });
};

export const getComplaintById = (id) =>
  api.get(`/complaints/${id}`);

export const directorAction = (id, data) =>
  api.put(`/complaints/${id}/action`, data);