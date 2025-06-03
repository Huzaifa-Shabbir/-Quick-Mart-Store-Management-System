import React, { useEffect, useState } from 'react';
import {
  getInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from '../api/inventory';

const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [form, setForm] = useState({
    item_No: '',
    item_Name: '',
    category: '',
    price: '',
    item_Quantity: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // New state for sorting
  const [sortOrder, setSortOrder] = useState('asc');  // 'asc' or 'desc'

  const fetchInventory = async () => {
    try {
      const data = await getInventory();
      setInventory(data);
    } catch (err) {
      alert('Failed to load inventory');
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Sorting function for quantity
  const sortInventory = (items) => {
    return items.sort((a, b) => {
      const quantityA = parseInt(a.item_Quantity);
      const quantityB = parseInt(b.item_Quantity);
      
      if (sortOrder === 'asc') {
        return quantityA - quantityB;
      } else {
        return quantityB - quantityA;
      }
    });
  };

  // Filter inventory based on search term
  const filteredInventory = inventory.filter(item =>
    item.item_No.toString().includes(searchTerm) ||
    item.item_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Apply sorting to filtered inventory
  const sortedInventory = sortInventory(filteredInventory);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const { item_No, item_Name, price, item_Quantity } = form;

    if (!item_No || !item_Name || !form.category || !price || !item_Quantity) {
      return alert('Please fill in all fields');
    }
    if (isNaN(price) || parseFloat(price) <= 0) {
      return alert('Price must be a valid number greater than 0');
    }
    if (isNaN(item_Quantity) || parseInt(item_Quantity) < 0) {
      return alert('Quantity must be a non-negative number');
    }

    try {
      if (isEditing) {
        await updateInventoryItem(item_No, form);
      } else {
        await createInventoryItem(form);
      }
      setForm({ item_No: '', item_Name: '', category: '', price: '', item_Quantity: '' });
      setIsEditing(false);
      fetchInventory();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = item => {
    setForm(item);
    setIsEditing(true);
  };

  const handleDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteInventoryItem(itemToDelete.item_No);
        setShowDeleteModal(false); // Close the modal after deleting
        fetchInventory(); // Reload inventory after deletion
      } catch (err) {
        alert(err.message);
        setShowDeleteModal(false); // Close the modal in case of error
      }
    }
  };

  const handleShowDeleteModal = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  // Toggle sort order when clicking the button
  const toggleSortOrder = () => {
    setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  return (
    <div className="container py-5">
      <h2 className="text-center mb-5">Inventory Management</h2>

      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Search by Item No, Name, or Category"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <button
        className="btn btn-primary mb-3"
        onClick={toggleSortOrder}
      >
        Sort by Quantity ({sortOrder === 'asc' ? 'Ascending' : 'Descending'})
      </button>

      <form
        className="row gx-5 gy-4 bg-light p-4 rounded shadow-sm align-items-end mb-5"
        onSubmit={handleSubmit}
      >
        <div className="col-md-2 d-flex flex-column">
          <label htmlFor="item_No" className="form-label">Item No</label>
          <input
            id="item_No"
            name="item_No"
            type="text"
            className="form-control"
            placeholder="Enter Item No"
            value={form.item_No}
            onChange={handleChange}
            disabled={isEditing}
            required
          />
        </div>

        <div className="col-md-3 d-flex flex-column">
          <label htmlFor="item_Name" className="form-label">Name</label>
          <input
            id="item_Name"
            name="item_Name"
            type="text"
            className="form-control"
            placeholder="Enter Item Name"
            value={form.item_Name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-2 d-flex flex-column">
          <label htmlFor="category" className="form-label">Category</label>
          <input
            id="category"
            name="category"
            type="text"
            className="form-control"
            placeholder="Enter Category"
            value={form.category}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-2 d-flex flex-column">
          <label htmlFor="price" className="form-label">Price</label>
          <input
            id="price"
            name="price"
            type="number"
            className="form-control"
            placeholder="Enter Price"
            value={form.price}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-2 d-flex flex-column">
          <label htmlFor="item_Quantity" className="form-label">Quantity</label>
          <input
            id="item_Quantity"
            name="item_Quantity"
            type="number"
            className="form-control"
            placeholder="Enter Quantity"
            value={form.item_Quantity}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-1 d-flex gap-2">
          <button type="submit" className="btn btn-success w-100">
            {isEditing ? 'Update' : 'Add'}
          </button>
          {isEditing && (
            <button
              type="button"
              className="btn btn-outline-secondary w-100"
              onClick={() => {
                setForm({ item_No: '', item_Name: '', category: '', price: '', item_Quantity: '' });
                setIsEditing(false);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="table-responsive">
        <table
          className="table table-bordered table-hover align-middle text-center shadow-sm"
          style={{ borderCollapse: 'separate', borderSpacing: '1.5rem' }}
        >
          <thead className="table-success">
            <tr>
              <th>Item No</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedInventory.length === 0 ? (
              <tr>
                <td colSpan="6">No items found.</td>
              </tr>
            ) : (
              sortedInventory.map(item => (
                <tr key={item.item_No}>
                  <td>{item.item_No}</td>
                  <td>{item.item_Name}</td>
                  <td>{item.category}</td>
                  <td>{item.price}</td>
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
                      onClick={() => handleShowDeleteModal(item)}
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

      {/* Custom Delete Modal */}
      {showDeleteModal && (
        <div className="modal show" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Deletion</h5>
                <button type="button" className="btn-close" onClick={handleCloseDeleteModal}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete <strong>{itemToDelete?.item_Name}</strong> (Item No: {itemToDelete?.item_No})?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseDeleteModal}>Cancel</button>
                <button type="button" className="btn btn-danger" onClick={handleDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
