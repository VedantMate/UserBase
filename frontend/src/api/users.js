import { apiClient } from './client';

export const getMyProfile = async () => {
  const { data } = await apiClient.get('/users/me');
  return data;
};

export const updateMyProfile = async (updates) => {
  const { data } = await apiClient.patch('/users/me', updates);
  return data;
};

export const listUsers = async (params) => {
  const { data } = await apiClient.get('/users', { params });
  return data;
};

export const getUserById = async (id) => {
  const { data } = await apiClient.get(`/users/${id}`);
  return data;
};

export const createUser = async (userData) => {
  const { data } = await apiClient.post('/users', userData);
  return data;
};

export const updateUser = async (id, updates) => {
  const { data } = await apiClient.patch(`/users/${id}`, updates);
  return data;
};

export const deactivateUser = async (id) => {
  const { data } = await apiClient.delete(`/users/${id}`);
  return data;
};
