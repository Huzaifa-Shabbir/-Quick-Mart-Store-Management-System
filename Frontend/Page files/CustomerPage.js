import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Custom Modal Component for Deletion Confirmation
const ConfirmationModal = ({ isVisible, onConfirm, onCancel }) => {
  return (
    isVisible && (
      <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="deleteModalLabel">Confirm Deletion</h5>
              <button type="button" className="btn-close" onClick={onCancel} aria-label="Close"></button>
            </div>
            <div className="modal-body">
              Are you sure you want to delete this customer?
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
              <button type="button" className="btn btn-danger" onClick={onConfirm}>Delete</button>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    customer_Id: '',
    name: '',
    phone_Number: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchId, setSearchId] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);  // State for showing the delete modal
  const [customerToDelete, setCustomerToDelete] = useState(null);  // Store the customer to delete

  const API_BASE_URL = 'http://localhost:4000/customer';

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      setCustomers(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch customers');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const isValidPhone = (phone) => /^\d{10,15}$/.test(phone);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!formData.customer_Id || !formData.name || !formData.phone_Number) {
      setError('All fields are required');
      return;
    }

    if (isNaN(formData.customer_Id)) {
      setError('Customer ID must be a number');
      return;
    }

    if (!isValidPhone(formData.phone_Number)) {
      setError('Phone number must be 10–15 digits');
      return;
    }

    try {
      if (editingId) {
        // Update existing customer
        await axios.put(`${API_BASE_URL}/${editingId}`, {
          name: formData.name,
          phone: formData.phone_Number
        });
        setSuccessMessage('Customer updated successfully');
      } else {
        // Create new customer
        await axios.post(API_BASE_URL, {
          id: formData.customer_Id,
          name: formData.name,
          phone: formData.phone_Number
        });
        setSuccessMessage('Customer added successfully');
      }

      resetForm();
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
      console.error(err);
    }
  };

  const handleEdit = (customer) => {
    setFormData({
      customer_Id: customer.customer_Id,
      name: customer.name,
      phone_Number: customer.phone_Number
    });
    setEditingId(customer.customer_Id);
  };

  const handleDelete = (id) => {
    setCustomerToDelete(id);  // Set the customer to delete
    setShowDeleteModal(true);  // Show the modal
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/${customerToDelete}`);
      setSuccessMessage('Customer deleted successfully');
      fetchCustomers();
    } catch (err) {
      setError('Failed to delete customer');
      console.error(err);
    }
    setShowDeleteModal(false);  // Hide the modal after confirmation
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);  // Hide the modal
  };

  const resetForm = () => {
    setFormData({
      customer_Id: '',
      name: '',
      phone_Number: ''
    });
    setEditingId(null);
    setError('');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSearch = async () => {
    if (!searchId.trim()) {
      setError('Please enter a valid Customer ID');
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/${searchId}`);
      setCustomers([response.data]);
      setError('');
    } catch (err) {
      setError('Customer not found');
      setCustomers([]);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Customer Management</h2>

      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Form Section */}
      <div className="card mb-4">
        <div className="card-header">{editingId ? 'Edit Customer' : 'Add New Customer'}</div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Customer ID</label>
              <input
                type="text"
                className="form-control"
                name="customer_Id"
                value={formData.customer_Id}
                onChange={handleInputChange}
                disabled={editingId !== null}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-control"
                name="phone_Number"
                value={formData.phone_Number}
                onChange={handleInputChange}
                required
              />
              <small className="text-muted">10–15 digits only</small>
            </div>
            <button type="submit" className="btn btn-primary me-2">
              {editingId ? 'Update' : 'Save'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Search Section */}
      <div className="mb-3">
        <label className="form-label">Search by Customer ID</label>
        <div className="d-flex">
          <input
            type="text"
            className="form-control me-2"
            placeholder="Enter Customer ID"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
          <button className="btn btn-info" onClick={handleSearch}>Search</button>
          <button className="btn btn-secondary ms-2" onClick={fetchCustomers}>Reset</button>
        </div>
      </div>

      {/* List Section */}
      <div className="card">
        <div className="card-header">Customer List</div>
        <div className="card-body">
          {customers.length === 0 ? (
            <p>No customers found</p>
          ) : (
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Phone Number</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.customer_Id}>
                    <td>{customer.customer_Id}</td>
                    <td>{customer.name}</td>
                    <td>{customer.phone_Number}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => handleEdit(customer)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(customer.customer_Id)}
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isVisible={showDeleteModal}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
};

export default CustomerManagement;
