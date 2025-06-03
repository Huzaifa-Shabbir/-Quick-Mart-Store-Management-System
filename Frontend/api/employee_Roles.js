import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/employee_Roles';

// Get all employee roles
export const getEmployeeRoles = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch employee roles');
  }
};

// Get roles for a specific employee
export const getEmployeeRolesById = async (employeeId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${employeeId}`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch employee roles for this employee');
  }
};

// Create a new role for an employee
export const createEmployeeRole = async (employeeRoleData) => {
  try {
    await axios.post(API_BASE_URL, employeeRoleData);
  } catch (error) {
    throw new Error('Failed to create employee role');
  }
};

// Update an existing employee role
export const updateEmployeeRole = async (employeeId, roleData) => {
  try {
    await axios.put(`${API_BASE_URL}/${employeeId}`, roleData);
  } catch (error) {
    throw new Error('Failed to update employee role');
  }
};

// Delete an employee role
export const deleteEmployeeRole = async (employeeId, role) => {
  try {
    await axios.delete(`${API_BASE_URL}`, {
      data: {
        employee_Id: employeeId,
        role_of_Employee: role,
      },
    });
  } catch (error) {
    throw new Error('Failed to delete employee role');
  }
};
