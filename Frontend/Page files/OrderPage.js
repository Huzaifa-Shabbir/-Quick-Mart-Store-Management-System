import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Custom Modal for delete confirmation
const DeleteConfirmationModal = ({ show, onConfirm, onCancel, orderNo }) => {
  if (!show) return null;

  return (
    <div className="modal-backdrop" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
      justifyContent: 'center', alignItems: 'center', zIndex: 1050
    }}>
      <div className="bg-white p-4 rounded shadow-lg" style={{ minWidth: '300px' }}>
        <h5 className="mb-3">Confirm Deletion</h5>
        <p>Are you sure you want to delete order <strong>#{orderNo}</strong>?</p>
        <div className="d-flex justify-content-end gap-2 mt-3">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
};

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [formData, setFormData] = useState({
    orderNo: '',
    orderDate: '',
    customerId: '',
    address: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  const API_BASE_URL = 'http://localhost:4000/orders';

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(API_BASE_URL);
      setOrders(data);
    } catch {
      setError('Failed to fetch orders');
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    const { orderNo, orderDate, customerId, address } = formData;

    if (!orderNo || !orderDate || !customerId || !address.trim()) {
      return setError('All fields are required');
    }

    if (isNaN(orderNo) || isNaN(customerId)) {
      return setError('Order No and Customer ID must be valid numbers');
    }

    const enteredDate = new Date(orderDate);
    if (isNaN(enteredDate.getTime())) {
      return setError('Invalid date format');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (enteredDate > today) {
      return setError('Order date cannot be in the future');
    }

    try {
      if (editingId) {
        await axios.put(`${API_BASE_URL}/${editingId}`, {
          orderDate,
          customerId,
          address
        });
        setSuccessMessage('Order updated successfully');
      } else {
        const existing = orders.find(order => order.order_No.toString() === orderNo.toString());
        if (existing) return setError(`Order No ${orderNo} already exists`);

        await axios.post(API_BASE_URL, {
          orderNo,
          orderDate,
          customerId,
          address
        });
        setSuccessMessage('Order added successfully');
      }

      resetForm();
      fetchOrders();
    } catch {
      setError('Operation failed. Please try again.');
    }
  };

  const handleEdit = order => {
    setFormData({
      orderNo: order.order_No,
      orderDate: order.order_Date?.split('T')[0] || '',
      customerId: order.customer_Id,
      address: order.Address
    });
    setEditingId(order.order_No);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/${orderToDelete}`);
      setSuccessMessage('Order deleted successfully');
      fetchOrders();
    } catch {
      setError('Failed to delete order');
    } finally {
      setShowDeleteModal(false);
      setOrderToDelete(null);
    }
  };

  const requestDelete = id => {
    setOrderToDelete(id);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({ orderNo: '', orderDate: '', customerId: '', address: '' });
    setEditingId(null);
    setError('');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const filteredOrders = orders.filter(order =>
    (order.order_No && order.order_No.toString().includes(debouncedSearchTerm)) ||
    (order.customer_Id && order.customer_Id.toString().includes(debouncedSearchTerm)) ||
    (order.Address && order.Address.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
  );

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4 fw-bold text-success">Order Management</h2>

      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Search by Order No, Customer ID, or Address"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <form
        className="row gx-5 gy-4 bg-light p-4 rounded shadow-sm align-items-end mb-5"
        onSubmit={handleSubmit}
      >
        <div className="col-md-3">
          <label htmlFor="orderNo" className="form-label">Order No</label>
          <input
            id="orderNo"
            name="orderNo"
            type="number"
            className="form-control"
            placeholder="Enter Order No"
            value={formData.orderNo}
            onChange={handleChange}
            disabled={!!editingId}
            required
          />
        </div>
        <div className="col-md-3">
          <label htmlFor="orderDate" className="form-label">Order Date</label>
          <input
            id="orderDate"
            name="orderDate"
            type="date"
            className="form-control"
            value={formData.orderDate}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-3">
          <label htmlFor="customerId" className="form-label">Customer ID</label>
          <input
            id="customerId"
            name="customerId"
            type="number"
            className="form-control"
            placeholder="Enter Customer ID"
            value={formData.customerId}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-3">
          <label htmlFor="address" className="form-label">Address</label>
          <input
            id="address"
            name="address"
            type="text"
            className="form-control"
            placeholder="Enter Address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-2 d-flex gap-2 mt-3">
          <button type="submit" className="btn btn-success w-100">
            {editingId ? 'Update' : 'Add'} Order
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
        <table className="table table-striped table-bordered text-center shadow-sm">
          <thead className="table-success sticky-top">
            <tr>
              <th>Order No</th>
              <th>Date</th>
              <th>Customer ID</th>
              <th>Address</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="6">No orders found.</td>
              </tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order.order_No}>
                  <td>{order.order_No}</td>
                  <td>{order.order_Date?.split('T')[0] || 'N/A'}</td>
                  <td>{order.customer_Id}</td>
                  <td>{order.Address}</td>
                  <td>
                    {typeof order.amount === 'number'
                      ? `$ ${order.amount.toFixed(2)}`
                      : 'N/A'}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => handleEdit(order)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => requestDelete(order.order_No)}
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

      <DeleteConfirmationModal
        show={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        orderNo={orderToDelete}
      />
    </div>
  );
};

export default OrderManagement;
