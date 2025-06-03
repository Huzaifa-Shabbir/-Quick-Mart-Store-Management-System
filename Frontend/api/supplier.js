import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/supplier';

// Get all suppliers
export const getAllSuppliers = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    handleError(error, 'fetch suppliers');
  }
};

// Get supplier by ID
export const getSupplierById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    handleError(error, `fetch supplier with ID ${id}`);
  }
};

// Create a new supplier
export const createSupplier = async (supplier) => {
  validateSupplierInput(supplier, true);
  try {
    const response = await axios.post(API_BASE_URL, supplier);
    return response.data;
  } catch (error) {
    handleError(error, 'add supplier');
  }
};

// Update supplier
export const updateSupplier = async (id, supplier) => {
  validateSupplierInput(supplier, false);
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}`, supplier);
    return response.data;
  } catch (error) {
    handleError(error, 'update supplier');
  }
};

// Delete supplier
export const deleteSupplier = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    handleError(error, `delete supplier with ID ${id}`);
  }
};

// Input validation
const validateSupplierInput = (supplier, requireId) => {
  const { supplier_Id, supplier_Name, contact_No } = supplier;

  if (requireId && (!supplier_Id || typeof supplier_Id !== 'string')) {
    throw new Error('Supplier ID is required and must be a string');
  }

  if (!supplier_Name || !supplier_Name.trim()) {
    throw new Error('Supplier Name is required');
  }

  if (!contact_No || !/^[0-9\-+()\s]+$/.test(contact_No)) {
    throw new Error('Contact number is invalid');
  }
};

// Generic error handler
const handleError = (error, context) => {
  const message = error.response?.data?.message || `Failed to ${context}`;
  throw new Error(message);
};
