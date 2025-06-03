import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/employee';

// Get all employees
export const getEmployees = async () => {
  const response = await axios.get(API_BASE_URL);
  return response.data;
};

// Get single employee (optional)
export const getEmployeeById = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/${id}`);
  return response.data;
};

// Create a new employee
export const createEmployee = async (data) => {
  await axios.post(API_BASE_URL, data);
};

// Update an existing employee
export const updateEmployee = async (id, data) => {
  await axios.put(`${API_BASE_URL}/${id}`, data);
};

// Delete an employee
export const deleteEmployee = async (id) => {
  await axios.delete(`${API_BASE_URL}/${id}`);
};
