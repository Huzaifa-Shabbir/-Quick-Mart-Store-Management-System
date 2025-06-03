import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/ordered_Items';

// Get all ordered items
export const getOrderedItems = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch ordered items');
  }
};

// Get items by order number
export const getOrderedItemsByOrderNo = async (orderNo) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${orderNo}`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch items for this order');
  }
};

// Add a new ordered item
export const createOrderedItem = async (itemData) => {
  try {
    await axios.post(API_BASE_URL, itemData);
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to add ordered item');
  }
};

// Update an ordered item quantity
export const updateOrderedItem = async (orderNo, itemNo, itemData) => {
  try {
    await axios.put(`${API_BASE_URL}/${orderNo}/${itemNo}`, itemData);
  } catch (error) {
    throw new Error('Failed to update ordered item');
  }
};

// Delete an ordered item
export const deleteOrderedItem = async (orderNo, itemNo) => {
  try {
    await axios.delete(`${API_BASE_URL}/${orderNo}/${itemNo}`);
  } catch (error) {
    throw new Error('Failed to delete ordered item');
  }
};
