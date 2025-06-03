import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/orders';

// Get all orders
export const getOrders = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch orders';
    throw new Error(message);
  }
};

// Create a new order
export const createOrder = async (orderData) => {
  try {
    // Ensure price is included and valid
    if (!orderData.price || isNaN(orderData.price)) {
      throw new Error('Price must be a valid number');
    }

    const response = await axios.post(API_BASE_URL, orderData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to create order';
    throw new Error(message);
  }
};

// Update an existing order
export const updateOrder = async (orderNo, orderData) => {
  try {
    // Ensure price is included and valid
    if (!orderData.price || isNaN(orderData.price)) {
      throw new Error('Price must be a valid number');
    }

    const response = await axios.put(`${API_BASE_URL}/${orderNo}`, orderData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to update order';
    throw new Error(message);
  }
};

// Delete an order
export const deleteOrder = async (orderNo) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${orderNo}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to delete order';
    throw new Error(message);
  }
};
