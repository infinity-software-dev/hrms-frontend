import axios from './axios';

export const applyResignation = async (data) => {
  const response = await axios.post('/resignations/apply', data);
  return response.data;
};

export const getMyResignations = async () => {
  const response = await axios.get('/resignations/my');
  return response.data;
};

export const getPendingApprovals = async () => {
  const response = await axios.get('/resignations/pending');
  return response.data;
};

export const getAllResignations = async () => {
  const response = await axios.get('/resignations/all');
  return response.data;
};

export const getResignationById = async (id) => {
  const response = await axios.get(`/resignations/${id}`);
  return response.data;
};

export const takeResignationAction = async (id, actionData) => {
  const response = await axios.put(`/resignations/${id}/action`, actionData);
  return response.data;
};

export const updateResignation = async (id, data) => {
  const response = await axios.put(`/resignations/${id}/update`, data);
  return response.data;
};
