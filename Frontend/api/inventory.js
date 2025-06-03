import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/inventory';

// Get all inventory items
export const getInventory = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching inventory:', error);
    throw new Error('Failed to fetch inventory');
  }
};

// Create a new inventory item
export const createInventoryItem = async (itemData) => {
  try {
    await axios.post(API_BASE_URL, itemData);
  } catch (error) {
    console.error('Error creating inventory item:', error);
    throw new Error('Failed to create inventory item');
  }
};

// Update an inventory item
export const updateInventoryItem = async (id, itemData) => {
  try {
    await axios.put(`${API_BASE_URL}/${id}`, itemData);
  } catch (error) {
    console.error('Error updating inventory item:', error);
    throw new Error('Failed to update inventory item');
  }
};

// Delete an inventory item
export const deleteInventoryItem = async (id) => {
  try {
    await axios.delete(`${API_BASE_URL}/${id}`);
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    throw new Error('Failed to delete inventory item');
  }
};

// OPTIONAL: Search inventory (for server-side search if implemented later)
export const searchInventory = async (query) => {
  try {
    const response = await axios.get(`${API_BASE_URL}?search=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching inventory:', error);
    throw new Error('Failed to search inventory');
  }
};
