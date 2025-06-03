import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/supplied_item';

// Fetch all supplied items
export const getSuppliedItems = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching supplied items:', error);
    throw new Error('Failed to fetch supplied items');
  }
};

// Create a new supplied item
export const createSuppliedItem = async (itemData) => {
  try {
    const response = await axios.post(API_BASE_URL, itemData);
    return response.data; // Returning the created item or success message
  } catch (error) {
    console.error('Error creating supplied item:', error);
    throw new Error('Failed to create supplied item');
  }
};

// Update an existing supplied item
export const updateSuppliedItem = async (id, itemData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}`, itemData);
    return response.data; // Returning the updated item or success message
  } catch (error) {
    console.error(`Error updating supplied item with ID ${id}:`, error);
    throw new Error('Failed to update supplied item');
  }
};

// Delete a supplied item by ID
export const deleteSuppliedItem = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.data; // Returning success message or status
  } catch (error) {
    console.error(`Error deleting supplied item with ID ${id}:`, error);
    throw new Error('Failed to delete supplied item');
  }
};
