// src/services/planService.js
import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_URL}/api/plans`;

export const getPlans = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const getPlanById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

export const createPlan = async (planData) => {
  const res = await axios.post(API_URL, planData);
  return res.data;
};

export const updatePlan = async (id, planData) => {
  const res = await axios.put(`${API_URL}/${id}`, planData);
  return res.data;
};

export const deletePlan = async (id) => {
  await axios.delete(`${API_URL}/${id}`);
};
