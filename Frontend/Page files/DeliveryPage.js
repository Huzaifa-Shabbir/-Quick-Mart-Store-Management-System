import React, { useEffect, useState } from 'react';
import {
  getDeliveries,
  getDeliveryById,
  createDelivery,
  updateDelivery,
  deleteDelivery,
} from '../api/delivery';

const DeliveryPage = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [form, setForm] = useState({
    delivery_Id: '',
    order_No: '',
    employee_Id: '',
    delivery_Status: 'Pending',
    expected_time: '',
  });
  const [editing, setEditing] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchData = async () => {
    try {
      const data = await getDeliveries();
      setDeliveries(data);
      setError('');
    } catch (err) {
      setError('Failed to load deliveries');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedDate = new Date(form.expected_time);
    const currentDate = new Date();

    if (selectedDate < currentDate) {
      setError('Expected time must be in the future');
      return;
    }

    try {
      if (editing) {
        await updateDelivery(form.delivery_Id, form);
        setMessage('Delivery updated successfully');
      } else {
        await createDelivery(form);
        setMessage('Delivery created successfully');
      }
      setForm({
        delivery_Id: '',
        order_No: '',
        employee_Id: '',
        delivery_Status: 'Pending',
        expected_time: '',
      });
      setEditing(false);
      setError('');
      fetchData();
    } catch (err) {
      setError('Failed to save delivery');
    }
  };

  const handleEdit = (dlv) => {
    setForm(dlv);
    setEditing(true);
  };

  const handleDelete = async (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteDelivery(deleteId);
      setMessage('Delivery deleted successfully');
      setShowDeleteModal(false);
      fetchData();
    } catch (err) {
      setError('Failed to delete delivery');
    }
  };

  const handleSearch = async () => {
    if (!searchId.trim()) {
      setError('Please enter a Delivery ID');
      return;
    }

    try {
      const result = await getDeliveryById(searchId);
      setDeliveries([result]);
      setError('');
    } catch (err) {
      setError('Delivery not found');
      setDeliveries([]);
    }
  };

  const resetSearch = () => {
    setSearchId('');
    fetchData();
  };

  return (
    <div className="container py-5">
      <h2 className="text-center mb-5 fw-bold text-success">Delivery Management</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      {/* Search Section */}
      <div className="mb-4 row">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search by Delivery ID"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <button className="btn btn-info w-100" onClick={handleSearch}>
            Search
          </button>
        </div>
        <div className="col-md-2">
          <button className="btn btn-secondary w-100" onClick={resetSearch}>
            Reset
          </button>
        </div>
      </div>

      {/* Form Section */}
      <form
        className="row gx-5 gy-4 bg-light p-4 rounded shadow-sm align-items-end"
        onSubmit={handleSubmit}
      >
        {['delivery_Id', 'order_No', 'employee_Id'].map((field) => (
          <div key={field} className="col-md-2 d-flex flex-column">
            <label className="form-label text-capitalize">{field.replace('_', ' ')}</label>
            <input
              type="text"
              name={field}
              className="form-control"
              placeholder={`Enter ${field.replace('_', ' ')}`}
              value={form[field]}
              onChange={handleChange}
              required
            />
          </div>
        ))}

        {/* Status Dropdown */}
        <div className="col-md-2 d-flex flex-column">
          <label className="form-label">Status</label>
          <select
            name="delivery_Status"
            className="form-select"
            value={form.delivery_Status}
            onChange={handleChange}
            required
          >
            <option value="Pending">Pending</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>

        {/* Expected Time */}
        <div className="col-md-2 d-flex flex-column">
          <label className="form-label">Expected Time</label>
          <input
            type="datetime-local"
            name="expected_time"
            className="form-control"
            value={form.expected_time}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-2 d-flex gap-2">
          <button type="submit" className="btn btn-success w-100">
            {editing ? 'Update' : 'Add'} Delivery
          </button>
          {editing && (
            <button
              type="button"
              className="btn btn-outline-secondary w-100"
              onClick={() => {
                setForm({
                  delivery_Id: '',
                  order_No: '',
                  employee_Id: '',
                  delivery_Status: 'Pending',
                  expected_time: '',
                });
                setEditing(false);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Table Section */}
      <div className="table-responsive mt-5">
        <table className="table table-bordered table-hover align-middle text-center shadow-sm">
          <thead className="table-success">
            <tr>
              <th>Delivery ID</th>
              <th>Order No</th>
              <th>Employee ID</th>
              <th>Status</th>
              <th>Expected Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map((dlv) => (
              <tr key={dlv.delivery_Id}>
                <td>{dlv.delivery_Id}</td>
                <td>{dlv.order_No}</td>
                <td>{dlv.employee_Id}</td>
                <td>{dlv.delivery_Status}</td>
                <td>{new Date(dlv.expected_time).toLocaleString()}</td>
                <td>
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => handleEdit(dlv)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(dlv.delivery_Id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {deliveries.length === 0 && (
              <tr>
                <td colSpan="6">No delivery records found</td>
              </tr>
            )}
          </tbody>
        </table>
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
                <p>Are you sure you want to delete this delivery?</p>
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

export default DeliveryPage;
