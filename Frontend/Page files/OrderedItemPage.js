import React, { useEffect, useState } from 'react';
import {
  getOrderedItems,
  createOrderedItem,
  updateOrderedItem,
  deleteOrderedItem
} from '../api/orderedItem';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const OrderedItemPage = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [form, setForm] = useState({ order_No: '', item_No: '', item_Quantity: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // Track modal visibility
  const [itemToDelete, setItemToDelete] = useState(null); // Track the item to delete

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await getOrderedItems();
      setItems(data);
      setFilteredItems(data);
    } catch (err) {
      setErrorMessage('Failed to load items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!form.order_No || !form.item_No || !form.item_Quantity) {
      setErrorMessage('All fields are required');
      return;
    }

    if (form.item_Quantity <= 0) {
      setErrorMessage('Quantity must be a positive number');
      return;
    }

    try {
      setLoading(true);
      if (isEditing) {
        await updateOrderedItem(form.order_No, form.item_No, {
          item_Quantity: form.item_Quantity
        });
        setSuccessMessage('Item updated successfully');
      } else {
        await createOrderedItem(form);
        setSuccessMessage('Item added successfully');
      }
      resetForm();
      loadItems();
    } catch (err) {
      setErrorMessage('Failed to save item');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setForm(item);
    setIsEditing(true);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteOrderedItem(itemToDelete.order_No, itemToDelete.item_No);
        setSuccessMessage('Item deleted successfully');
        loadItems();
        setIsModalOpen(false); // Close modal after deletion
      } catch (err) {
        setErrorMessage('Failed to delete item');
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setForm({ order_No: '', item_No: '', item_Quantity: '' });
    setIsEditing(false);
    setErrorMessage('');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (!value.trim()) {
      setFilteredItems(items);
      return;
    }

    const filtered = items.filter(
      (item) =>
        item.order_No.toString().includes(value) ||
        item.item_No.toString().includes(value)
    );
    setFilteredItems(filtered);
  };

  const getChartData = () => {
    const itemMap = new Map();

    items.forEach(item => {
      const itemName = item.item_Name || `Item ${item.item_No}`;
      const quantity = Number(item.item_Quantity);

      if (itemMap.has(itemName)) {
        itemMap.set(itemName, itemMap.get(itemName) + quantity);
      } else {
        itemMap.set(itemName, quantity);
      }
    });

    return Array.from(itemMap.entries()).map(([name, qty]) => ({
      name,
      quantity: qty
    }));
  };

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4 fw-bold text-primary">Ordered Items</h2>

      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      <div className="mb-4 text-center">
        <input
          type="text"
          className="form-control w-50 mx-auto"
          placeholder="Search by Order No or Item No"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <form
        className="row gx-5 gy-4 bg-light p-4 rounded shadow-sm align-items-end mb-5"
        onSubmit={handleSubmit}
      >
        <div className="col-md-3 d-flex flex-column">
          <label htmlFor="orderNo" className="form-label">Order No</label>
          <input
            id="orderNo"
            type="number"
            className="form-control"
            placeholder="Enter Order No"
            value={form.order_No}
            onChange={(e) => setForm({ ...form, order_No: e.target.value })}
            required
            disabled={isEditing}
          />
        </div>
        <div className="col-md-3 d-flex flex-column">
          <label htmlFor="itemNo" className="form-label">Item No</label>
          <input
            id="itemNo"
            type="number"
            className="form-control"
            placeholder="Enter Item No"
            value={form.item_No}
            onChange={(e) => setForm({ ...form, item_No: e.target.value })}
            required
            disabled={isEditing}
          />
        </div>
        <div className="col-md-3 d-flex flex-column">
          <label htmlFor="quantity" className="form-label">Quantity</label>
          <input
            id="quantity"
            type="number"
            className="form-control"
            placeholder="Enter Quantity"
            value={form.item_Quantity}
            onChange={(e) => setForm({ ...form, item_Quantity: e.target.value })}
            required
          />
        </div>
        <div className="col-md-3 d-flex gap-2">
          <button type="submit" className="btn btn-primary w-100">
            {isEditing ? 'Update' : 'Add'} Item
          </button>
          {isEditing && (
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
        <table className="table table-bordered table-hover align-middle text-center shadow-sm">
          <thead className="table-primary">
            <tr>
              <th>Order No</th>
              <th>Item No</th>
              <th>Item Name</th>
              <th>Quantity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5">Loading items...</td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan="5">No items found</td>
              </tr>
            ) : (
              filteredItems.map((item, idx) => (
                <tr key={`${item.order_No}-${item.item_No}-${idx}`}>
                  <td>{item.order_No}</td>
                  <td>{item.item_No}</td>
                  <td>{item.item_Name || 'N/A'}</td>
                  <td>{item.item_Quantity}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => {
                        setItemToDelete(item); // Set the item to delete
                        setIsModalOpen(true);  // Open the confirmation modal
                      }}
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

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="modal show" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Deletion</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsModalOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this item?</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Graph Section */}
      <div className="my-5">
        <h3 className="text-center">Ordered Items Chart</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={getChartData()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="quantity" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default OrderedItemPage;
