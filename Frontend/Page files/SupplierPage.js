import React, { useEffect, useState } from 'react';
import {
  getAllSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierById
} from '../api/supplier';

const SupplierPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({
    supplier_Id: '',
    supplier_Name: '',
    contact_No: '',
    supplier_Address: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchId, setSearchId] = useState('');

  const fetchSuppliers = async () => {
    try {
      const data = await getAllSuppliers();
      setSuppliers(data);
    } catch {
      setError('Failed to load suppliers');
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const { supplier_Id, supplier_Name, contact_No } = form;
    if (!supplier_Id || !supplier_Name.trim() || !contact_No.trim()) {
      setError('Supplier ID, Name, and Contact are required');
      return;
    }

    try {
      if (editingId) {
        await updateSupplier(editingId, form);
        setSuccessMessage('Supplier updated successfully');
      } else {
        await createSupplier(form);
        setSuccessMessage('Supplier added successfully');
      }
      setForm({ supplier_Id: '', supplier_Name: '', contact_No: '', supplier_Address: '' });
      setEditingId(null);
      fetchSuppliers();
    } catch {
      setError('Operation failed');
    }
  };

  const handleEdit = async id => {
    try {
      const supplier = await getSupplierById(id);
      setForm(supplier);
      setEditingId(id);
    } catch {
      setError('Failed to load supplier');
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this supplier?')) return;
    try {
      await deleteSupplier(id);
      setSuccessMessage('Supplier deleted successfully');
      fetchSuppliers();
    } catch {
      setError('Delete failed');
    }
  };

  const handleSearch = async () => {
    setError('');
    setSuccessMessage('');
    if (!searchId.trim()) {
      setError('Please enter an ID to search');
      return;
    }

    try {
      const supplier = await getSupplierById(searchId);
      setSuppliers([supplier]);
    } catch {
      setSuppliers([]);
      setError('Supplier not found');
    }
  };

  const handleReset = () => {
    setSearchId('');
    setError('');
    setSuccessMessage('');
    fetchSuppliers();
  };

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4 fw-bold text-success">Supplier Management</h2>

      {/* Search Section */}
      <div className="row mb-4">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search by Supplier ID"
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
          />
        </div>
        <div className="col-md-2 d-flex gap-2">
          <button className="btn btn-info w-100" onClick={handleSearch}>Search</button>
          <button className="btn btn-secondary w-100" onClick={handleReset}>Reset</button>
        </div>
      </div>

      {/* Alerts */}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Form */}
      <form
        className="row gx-4 gy-3 bg-light p-4 rounded shadow-sm mb-5 align-items-end"
        onSubmit={handleSubmit}
      >
        <div className="col-md-3">
          <label htmlFor="supplier_Id" className="form-label">Supplier ID</label>
          <input
            id="supplier_Id"
            name="supplier_Id"
            type="text"
            className="form-control"
            placeholder="Enter Supplier ID"
            value={form.supplier_Id}
            onChange={handleChange}
            disabled={!!editingId}
            required
          />
        </div>
        <div className="col-md-3">
          <label htmlFor="supplier_Name" className="form-label">Name</label>
          <input
            id="supplier_Name"
            name="supplier_Name"
            type="text"
            className="form-control"
            placeholder="Enter Name"
            value={form.supplier_Name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-3">
          <label htmlFor="contact_No" className="form-label">Contact</label>
          <input
            id="contact_No"
            name="contact_No"
            type="text"
            className="form-control"
            placeholder="Enter Contact No"
            value={form.contact_No}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-3">
          <label htmlFor="supplier_Address" className="form-label">Address</label>
          <input
            id="supplier_Address"
            name="supplier_Address"
            type="text"
            className="form-control"
            placeholder="Enter Address"
            value={form.supplier_Address}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-2 mt-3">
          <button type="submit" className="btn btn-success w-100">
            {editingId ? 'Update' : 'Add'}
          </button>
        </div>
        {editingId && (
          <div className="col-md-2 mt-3">
            <button
              type="button"
              className="btn btn-outline-secondary w-100"
              onClick={() => {
                setForm({ supplier_Id: '', supplier_Name: '', contact_No: '', supplier_Address: '' });
                setEditingId(null);
                setError('');
                setSuccessMessage('');
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </form>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-striped table-bordered text-center align-middle shadow-sm">
          <thead className="table-success">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan="5">No suppliers found</td>
              </tr>
            ) : (
              suppliers.map(s => (
                <tr key={s.supplier_Id}>
                  <td>{s.supplier_Id}</td>
                  <td>{s.supplier_Name}</td>
                  <td>{s.contact_No}</td>
                  <td>{s.supplier_Address}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => handleEdit(s.supplier_Id)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(s.supplier_Id)}
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
    </div>
  );
};

export default SupplierPage;
