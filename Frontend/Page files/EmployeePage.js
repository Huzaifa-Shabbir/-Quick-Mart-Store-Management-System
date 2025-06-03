import React, { useEffect, useState } from 'react';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
} from '../api/employee';

const EmployeePage = () => {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    employee_Id: '',
    employee_Name: '',
    salary: '',
    contact: ''
  });
  const [searchId, setSearchId] = useState('');
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(data);
      setError('');
    } catch (error) {
      setError('Failed to fetch employees');
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const { employee_Id, employee_Name, salary, contact } = formData;

    if (!employee_Id || isNaN(employee_Id)) {
      setError('Employee ID must be a valid number');
      return false;
    }

    if (!employee_Name.trim()) {
      setError('Employee Name is required');
      return false;
    }

    if (!salary || isNaN(salary) || Number(salary) <= 0) {
      setError('Salary must be a positive number');
      return false;
    }

    if (!contact.trim() || contact.length < 10) {
      setError('Contact must be at least 10 characters');
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const payload = {
      ...formData,
      employee_Id: parseInt(formData.employee_Id),
      salary: parseFloat(formData.salary),
    };

    try {
      if (isEditing) {
        await updateEmployee(payload.employee_Id, payload);
        alert('Employee updated');
      } else {
        await createEmployee(payload);
        alert('Employee created');
      }

      fetchEmployees();
      resetForm();
    } catch (error) {
      alert(error.message || 'Something went wrong');
    }
  };

  const handleEdit = (emp) => {
    setFormData({
      ...emp,
      employee_Id: emp.employee_Id.toString(), // make sure it's editable
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteEmployee(deleteId);
      fetchEmployees();
      setShowDeleteModal(false);
    } catch (error) {
      alert('Error deleting employee');
    }
  };

  const handleSearch = async () => {
    if (!searchId.trim()) {
      setError('Please enter an ID to search');
      return;
    }

    try {
      const result = await getEmployeeById(searchId);
      setEmployees([result]);
      setError('');
    } catch (err) {
      setEmployees([]);
      setError('Employee not found');
    }
  };

  const handleReset = () => {
    setSearchId('');
    setError('');
    fetchEmployees();
  };

  const resetForm = () => {
    setFormData({ employee_Id: '', employee_Name: '', salary: '', contact: '' });
    setIsEditing(false);
  };

  return (
    <div className="container mt-5 px-4 py-3">
      <h2 className="fw-bold text-center">Employee Management</h2>

      {/* Search Section */}
      <div className="row mb-4">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search by Employee ID"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <button className="btn btn-info w-100" onClick={handleSearch}>Search</button>
        </div>
        <div className="col-md-2">
          <button className="btn btn-secondary w-100" onClick={handleReset}>Reset</button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Form Section */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-gradient bg-primary text-white fw-semibold">
          <span role="img" aria-label="edit">✏️</span> {isEditing ? 'Edit Employee' : 'Add New Employee'}
        </div>
        <div className="card-body">
          <div className="mb-3">
            <input
              type="number"
              name="employee_Id"
              className="form-control"
              placeholder="Employee ID"
              value={formData.employee_Id}
              onChange={handleChange}
              disabled={isEditing}
            />
          </div>
          <div className="mb-3">
            <input
              type="text"
              name="employee_Name"
              className="form-control"
              placeholder="Employee Name"
              value={formData.employee_Name}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <input
              type="number"
              name="salary"
              className="form-control"
              placeholder="Salary"
              value={formData.salary}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <input
              type="text"
              name="contact"
              className="form-control"
              placeholder="Contact"
              value={formData.contact}
              onChange={handleChange}
            />
          </div>
          <div className="d-flex justify-content-end">
            <button onClick={handleSubmit} className="btn btn-success me-2">
              {isEditing ? 'Update' : 'Save'}
            </button>
            {isEditing && (
              <button className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Employee Table */}
      <h3 className="fw-semibold">All Employees</h3>
      <div className="card shadow-sm">
        <div className="card-body">
          {employees.length === 0 ? (
            <p>No employees found</p>
          ) : (
            <table className="table table-striped table-bordered text-center align-middle">
              <thead className="table-primary">
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Salary</th>
                  <th>Contact</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.employee_Id}>
                    <td>{emp.employee_Id}</td>
                    <td>{emp.employee_Name}</td>
                    <td>{emp.salary}</td>
                    <td>{emp.contact}</td>
                    <td>
                      <button
                        onClick={() => handleEdit(emp)}
                        className="btn btn-warning btn-sm me-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(emp.employee_Id)}
                        className="btn btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" aria-labelledby="deleteModal" aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Deletion</h5>
                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this employee?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger" onClick={confirmDelete}>
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeePage;
