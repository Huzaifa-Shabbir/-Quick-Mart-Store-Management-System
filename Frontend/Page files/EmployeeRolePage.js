import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EmployeePage = () => {
  const [employeeRoles, setEmployeeRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [formData, setFormData] = useState({
    employee_Id: '',
    role_of_Employee: '',
  });
  const [originalRole, setOriginalRole] = useState(null);
  const [editing, setEditing] = useState(false);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);  // Modal visibility state
  const [roleToDelete, setRoleToDelete] = useState(null);  // Role to delete

  const API_BASE_URL = 'http://localhost:4000/employee_Roles';

  const fetchEmployeeRoles = async () => {
    try {
      const { data } = await axios.get(API_BASE_URL);
      setEmployeeRoles(data);
      setFilteredRoles(data);
    } catch {
      alert('Failed to fetch roles');
    }
  };

  useEffect(() => {
    fetchEmployeeRoles();
  }, []);

  useEffect(() => {
    if (search) {
      const filtered = employeeRoles.filter(role =>
        role.employee_Id.toString().includes(search) ||
        role.role_of_Employee.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredRoles(filtered);
    } else {
      setFilteredRoles(employeeRoles);
    }
  }, [search, employeeRoles]);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.employee_Id || !formData.role_of_Employee) {
      return alert('Both fields are required');
    }

    try {
      if (editing) {
        await axios.put(API_BASE_URL, {
          originalEmployee_Id: originalRole.employee_Id,
          originalRole: originalRole.role_of_Employee,
          updatedEmployee_Id: formData.employee_Id,
          updatedRole: formData.role_of_Employee,
        });
        alert('Role updated');
      } else {
        await axios.post(API_BASE_URL, formData);
        alert('Role added');
      }

      fetchEmployeeRoles();
      setFormData({ employee_Id: '', role_of_Employee: '' });
      setEditing(false);
      setOriginalRole(null);
    } catch {
      alert('Operation failed');
    }
  };

  const handleEdit = role => {
    setFormData(role);
    setOriginalRole(role);
    setEditing(true);
  };

  const handleDeleteConfirmation = (employee_Id, role) => {
    // Set the role to delete and show the modal
    setRoleToDelete({ employee_Id, role });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!roleToDelete) return;
    const { employee_Id, role } = roleToDelete;

    try {
      await axios.delete(API_BASE_URL, {
        data: { employee_Id, role_of_Employee: role },
      });
      alert('Role deleted');
      fetchEmployeeRoles();
      setShowModal(false);  // Hide modal after deleting
    } catch {
      alert('Delete failed');
    }
  };

  const handleCancelDelete = () => {
    setShowModal(false);  // Close the modal without deleting
  };

  return (
    <div className="container py-5">
      <h2 className="text-center mb-5 fw-bold text-success">Employee Role Management</h2>

      <div className="row mb-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search by Employee ID or Role"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <form
        className="row gx-5 gy-4 bg-light p-4 rounded shadow-sm align-items-end"
        onSubmit={handleSubmit}
      >
        <div className="col-md-4 d-flex flex-column">
          <label htmlFor="employee_Id" className="form-label">Employee ID</label>
          <input
            id="employee_Id"
            name="employee_Id"
            type="text"
            className="form-control"
            placeholder="Enter Employee ID"
            value={formData.employee_Id}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-4 d-flex flex-column">
          <label htmlFor="role_of_Employee" className="form-label">Role</label>
          <input
            id="role_of_Employee"
            name="role_of_Employee"
            type="text"
            className="form-control"
            placeholder="Enter Role"
            value={formData.role_of_Employee}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-4 d-flex gap-2">
          <button type="submit" className="btn btn-success w-100">
            {editing ? 'Update Role' : 'Add Role'}
          </button>
          {editing && (
            <button
              type="button"
              className="btn btn-outline-secondary w-100"
              onClick={() => {
                setFormData({ employee_Id: '', role_of_Employee: '' });
                setEditing(false);
                setOriginalRole(null);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="table-responsive mt-5">
        <table className="table table-bordered table-hover align-middle text-center shadow-sm">
          <thead className="table-success">
            <tr>
              <th>Employee ID</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRoles.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center">No roles found</td>
              </tr>
            ) : (
              filteredRoles.map(role => (
                <tr key={`${role.employee_Id}-${role.role_of_Employee}`}>
                  <td>{role.employee_Id}</td>
                  <td>{role.role_of_Employee}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => handleEdit(role)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteConfirmation(role.employee_Id, role.role_of_Employee)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {showModal && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button type="button" className="btn-close" onClick={handleCancelDelete}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this role?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCancelDelete}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger" onClick={handleDelete}>
                  Delete
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
