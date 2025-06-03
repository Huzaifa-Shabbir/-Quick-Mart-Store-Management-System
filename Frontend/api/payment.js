import axios from 'axios';

const API_BASE = 'http://localhost:3001/payment';

// Get all payments
export const getAllPayments = async () => {
  try {
    const res = await axios.get(API_BASE);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch payments');
  }
};

// Get a payment by ID
export const getPaymentById = async (id) => {
  try {
    const res = await axios.get(`${API_BASE}/${id}`);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch payment');
  }
};

// Create a new payment
export const createPayment = async (paymentData) => {
  try {
    const res = await axios.post(API_BASE, paymentData);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create payment');
  }
};

// Update a payment
export const updatePayment = async (id, updatedData) => {
  try {
    const res = await axios.put(`${API_BASE}/${id}`, updatedData);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update payment');
  }
};

// Delete a payment
export const deletePayment = async (id) => {
  try {
    const res = await axios.delete(`${API_BASE}/${id}`);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete payment');
  }
};
