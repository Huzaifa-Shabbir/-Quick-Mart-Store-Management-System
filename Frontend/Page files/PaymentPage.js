import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PaymentPage = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [formData, setFormData] = useState({
    payment_Id: '',
    order_No: '',
    payment_Type: '',
    payment_Date: ''
  });
  const [searchId, setSearchId] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);

  const API_BASE_URL = 'http://localhost:4000/payment';

  const fetchPayments = async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      setPayments(response.data);
      setFilteredPayments(response.data);
    } catch {
      setError('Failed to fetch payments');
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const { payment_Id, order_No, payment_Type, payment_Date } = formData;

    if (!payment_Id || !order_No || !payment_Type || !payment_Date) {
      setError('All fields are required');
      return;
    }

    if (!['credit card', 'cash on delivery', 'bank transfer'].includes(payment_Type.toLowerCase())) {
      setError('Payment type must be one of: card, cash, or bank transfer');
      return;
    }

    const currentDate = new Date().toISOString().slice(0, 10);
    if (payment_Date > currentDate) {
      setError('Payment date cannot be in the future');
      return;
    }

    try {
      if (editingId) {
        await axios.put(`${API_BASE_URL}/${editingId}`, {
          payment_Type,
          payment_Date
        });
        setSuccessMessage('Payment updated successfully');
      } else {
        await axios.post(API_BASE_URL, {
          payment_Id,
          order_No,
          payment_Type,
          payment_Date
        });
        setSuccessMessage('Payment added successfully');
      }

      resetForm();
      fetchPayments();
    } catch {
      setError('Operation failed');
    }
  };

  const handleEdit = (payment) => {
    setFormData({
      payment_Id: payment.payment_Id,
      order_No: payment.order_No,
      payment_Type: payment.payment_Type,
      payment_Date: payment.payment_Date.slice(0, 10)
    });
    setEditingId(payment.payment_Id);
  };

  const handleDelete = (payment) => {
    setPaymentToDelete(payment);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!paymentToDelete) return;
    try {
      await axios.delete(`${API_BASE_URL}/${paymentToDelete.payment_Id}`);
      setSuccessMessage('Payment deleted successfully');
      fetchPayments();
    } catch {
      setError('Failed to delete payment');
    } finally {
      setShowDeleteModal(false);
      setPaymentToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData({
      payment_Id: '',
      order_No: '',
      payment_Type: '',
      payment_Date: ''
    });
    setEditingId(null);
    setError('');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchId(value);
    if (value.trim() === '') {
      setFilteredPayments(payments);
    } else {
      const filtered = payments.filter(p =>
        String(p.payment_Id).toLowerCase().includes(value.toLowerCase())
      );
      setFilteredPayments(filtered);
    }
  };

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4 fw-bold text-success">Payment Management</h2>

      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-4">
        <input
          type="text"
          className="form-control w-50 mx-auto"
          placeholder="Search by Payment ID"
          value={searchId}
          onChange={handleSearchChange}
        />
      </div>

      <form
        className="row gx-5 gy-4 bg-light p-4 rounded shadow-sm align-items-end mb-5"
        onSubmit={handleSubmit}
      >
        <div className="col-md-2">
          <label htmlFor="payment_Id" className="form-label">Payment ID</label>
          <input
            id="payment_Id"
            name="payment_Id"
            type="text"
            className="form-control"
            placeholder="Payment ID"
            value={formData.payment_Id}
            onChange={handleInputChange}
            disabled={!!editingId}
            required
          />
        </div>
        <div className="col-md-2">
          <label htmlFor="order_No" className="form-label">Order No</label>
          <input
            id="order_No"
            name="order_No"
            type="text"
            className="form-control"
            placeholder="Order No"
            value={formData.order_No}
            onChange={handleInputChange}
            disabled={!!editingId}
            required
          />
        </div>
        <div className="col-md-2">
          <label htmlFor="payment_Type" className="form-label">Payment Type</label>
          <input
            id="payment_Type"
            name="payment_Type"
            type="text"
            className="form-control"
            placeholder="Type"
            value={formData.payment_Type}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="col-md-2">
          <label htmlFor="payment_Date" className="form-label">Date</label>
          <input
            id="payment_Date"
            name="payment_Date"
            type="date"
            className="form-control"
            value={formData.payment_Date}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="col-md-2 d-flex gap-2">
          <button type="submit" className="btn btn-success w-100">
            {editingId ? 'Update' : 'Add'}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn btn-outline-secondary w-100"
              onClick={resetForm}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="table-responsive">
        <table className="table table-bordered table-striped align-middle text-center shadow-sm">
          <thead className="table-success">
            <tr>
              <th>Payment ID</th>
              <th>Order No</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length > 0 ? (
              filteredPayments.map(payment => (
                <tr key={payment.payment_Id}>
                  <td>{payment.payment_Id}</td>
                  <td>{payment.order_No}</td>
                  <td>{payment.payment_Type}</td>
                  <td>$ {parseFloat(payment.amount).toFixed(2)}</td>
                  <td>{new Date(payment.payment_Date).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => handleEdit(payment)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(payment)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-muted">No payments found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Custom Delete Modal */}
      {showDeleteModal && paymentToDelete && (
        <div className="modal show fade d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content border-danger">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">Confirm Deletion</h5>
                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)} />
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete Payment ID <strong>{paymentToDelete.payment_Id}</strong>?</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
