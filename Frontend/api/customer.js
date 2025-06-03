import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/customer';

// Get all customers
export const getCustomers = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch customers');
  }
};

// Create a new customer
export const createCustomer = async (customerData) => {
  try {
    await axios.post(API_BASE_URL, customerData);
  } catch (error) {
    throw new Error('Failed to create customer');
  }
};

// Update an existing customer
export const updateCustomer = async (id, customerData) => {
  try {
    await axios.put(`${API_BASE_URL}/${id}`, customerData);
  } catch (error) {
    throw new Error('Failed to update customer');
  }
};

// Delete a customer
export const deleteCustomer = async (id) => {
  try {
    await axios.delete(`${API_BASE_URL}/${id}`);
  } catch (error) {
    throw new Error('Failed to delete customer');
  }
};
