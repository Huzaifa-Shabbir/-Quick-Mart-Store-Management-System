import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/delivery';

// Get all deliveries
export const getDeliveries = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch deliveries');
  }
};

// Get a delivery by ID
export const getDeliveryById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch delivery by ID');
  }
};

// Create a new delivery
export const createDelivery = async (deliveryData) => {
  try {
    await axios.post(API_BASE_URL, deliveryData);
  } catch (error) {
    throw new Error('Failed to create delivery');
  }
};

// Update an existing delivery
export const updateDelivery = async (id, deliveryData) => {
  try {
    await axios.put(`${API_BASE_URL}/${id}`, deliveryData);
  } catch (error) {
    throw new Error('Failed to update delivery');
  }
};

// Delete a delivery
export const deleteDelivery = async (id) => {
  try {
    await axios.delete(`${API_BASE_URL}/${id}`);
  } catch (error) {
    throw new Error('Failed to delete delivery');
  }
};
