import React, { useState, useEffect } from 'react';
import {
  getSuppliedItems,
  createSuppliedItem,
  updateSuppliedItem,
  deleteSuppliedItem
} from '../api/supplied_Items';

const SuppliedItemManagement = () => {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    item_No: '',
    supplier_Id: '',
    item_Quantity: '',
    purchase_Date: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  const fetchItems = async () => {
    try {
      const data = await getSuppliedItems();
      setItems(data);
    } catch {
      setError('Failed to load supplied items');
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const isPastOrToday = (dateStr) => {
    const selected = new Date(dateStr);
    const today = new Date();
    selected.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return selected <= today;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const { item_No, supplier_Id, item_Quantity, purchase_Date } = formData;

    if (!item_No || !supplier_Id || !item_Quantity || !purchase_Date) {
      setError('All fields are required');
      return;
    }

    if (isNaN(item_No) || Number(item_No) <= 0) {
      setError('Item No must be a positive number');
      return;
    }

    if (isNaN(supplier_Id) || Number(supplier_Id) <= 0) {
      setError('Supplier ID must be a positive number');
      return;
    }

    if (isNaN(item_Quantity) || Number(item_Quantity) <= 0) {
      setError('Quantity must be a positive number');
      return;
    }

    if (!isPastOrToday(purchase_Date)) {
      setError('Purchase date must be today or earlier');
      return;
    }

    try {
      if (editingId) {
        await updateSuppliedItem(editingId, formData);
        setSuccessMessage('Item updated successfully');
      } else {
        await createSuppliedItem(formData);
        setSuccessMessage('Item added successfully');
      }

      setFormData({ item_No: '', supplier_Id: '', item_Quantity: '', purchase_Date: '' });
      setEditingId(null);
      fetchItems();
    } catch {
      setError('Operation failed');
    }
  };

  const handleEdit = item => {
    setFormData({
      item_No: item.item_No,
      supplier_Id: item.supplier_Id,
      item_Quantity: item.item_Quantity,
      purchase_Date: item.purchase_Date.slice(0, 10)
    });
    setEditingId(item.Sr_No);
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirmed = async () => {
    try {
      await deleteSuppliedItem(deleteId);
      setSuccessMessage('Item deleted successfully');
      fetchItems();
    } catch {
      setError('Delete failed');
    } finally {
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  const filteredItems = items.filter(item =>
    item.item_No.toString().includes(searchTerm) ||
    item.supplier_Id.toString().includes(searchTerm) ||
    item.item_Quantity.toString().includes(searchTerm) ||
    item.purchase_Date.slice(0, 10).includes(searchTerm)
  );

  const sortedItems = [...filteredItems].sort((a, b) => {
    const dateA = new Date(a.purchase_Date);
    const dateB = new Date(b.purchase_Date);
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  return (
    <div className="container py-5">
      <h2 className="text-center mb-5 fw-bold text-success">Supplied Items Management</h2>

      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-4 d-flex justify-content-between">
        <input
          type="text"
          className="form-control w-75 me-3"
          placeholder="Search by Item No, Supplier ID, Quantity, or Date"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="btn btn-outline-primary" onClick={toggleSortOrder}>
          Sort by Date ({sortOrder === 'asc' ? 'Oldest First' : 'Newest First'})
        </button>
      </div>

      <form
        className="row gx-5 gy-4 bg-light p-4 rounded shadow-sm align-items-end mb-5"
        onSubmit={handleSubmit}
      >
        <div className="col-md-3 d-flex flex-column">
          <label htmlFor="item_No" className="form-label">Item No</label>
          <input
            id="item_No"
            name="item_No"
            className="form-control"
            placeholder="Enter Item No"
            value={formData.item_No}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-3 d-flex flex-column">
          <label htmlFor="supplier_Id" className="form-label">Supplier ID</label>
          <input
            id="supplier_Id"
            name="supplier_Id"
            className="form-control"
            placeholder="Enter Supplier ID"
            value={formData.supplier_Id}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-3 d-flex flex-column">
          <label htmlFor="item_Quantity" className="form-label">Quantity</label>
          <input
            id="item_Quantity"
            name="item_Quantity"
            type="number"
            className="form-control"
            placeholder="Enter Quantity"
            value={formData.item_Quantity}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-3 d-flex flex-column">
          <label htmlFor="purchase_Date" className="form-label">Purchase Date</label>
          <input
            id="purchase_Date"
            name="purchase_Date"
            type="date"
            className="form-control"
            value={formData.purchase_Date}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-3 d-flex gap-2">
          <button type="submit" className="btn btn-success w-100">
            {editingId ? 'Update' : 'Add'} Item
          </button>
          {editingId && (
            <button
              type="button"
              className="btn btn-outline-secondary w-100"
              onClick={() => {
                setFormData({ item_No: '', supplier_Id: '', item_Quantity: '', purchase_Date: '' });
                setEditingId(null);
                setError('');
                setSuccessMessage('');
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle text-center shadow-sm">
          <thead className="table-success">
            <tr>
              <th>Sr No</th>
              <th>Item No</th>
              <th>Supplier ID</th>
              <th>Quantity</th>
              <th>Purchase Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.length === 0 ? (
              <tr>
                <td colSpan="6">No items found</td>
              </tr>
            ) : (
              sortedItems.map(item => (
                <tr key={item.Sr_No}>
                  <td>{item.Sr_No}</td>
                  <td>{item.item_No}</td>
                  <td>{item.supplier_Id}</td>
                  <td>{item.item_Quantity}</td>
                  <td>{item.purchase_Date.slice(0, 10)}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => confirmDelete(item.Sr_No)}
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

      {showDeleteModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Deletion</h5>
                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this item?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button type="button" className="btn btn-danger" onClick={handleDeleteConfirmed}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuppliedItemManagement;