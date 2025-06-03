import React, { useEffect, useState, useRef } from 'react';
import {
  getFeedbacks,
  createFeedback,
  updateFeedback,
  deleteFeedback,
} from '../api/feedback';

const FeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState({
    feedback_Id: '',
    customer_Id: '',
    order_No: '',
    rating: '',
    feedback_Message: '',
  });
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showModal, setShowModal] = useState(false); // Modal visibility state
  const [feedbackToDelete, setFeedbackToDelete] = useState(null); // Feedback to delete
  const formRef = useRef(null);

  const fetchData = async () => {
    try {
      const data = await getFeedbacks();
      setFeedbacks(data);
    } catch (err) {
      setApiError('Failed to fetch feedbacks.');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setApiError('');
  };

  const validateForm = () => {
    const { feedback_Id, customer_Id, order_No, rating, feedback_Message } = form;
    if (!feedback_Id || !customer_Id || !order_No || !rating || !feedback_Message) {
      return 'All fields are required.';
    }
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return 'Rating must be a number between 1 and 5.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      formRef.current.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    try {
      if (editing) {
        await updateFeedback(form.feedback_Id, {
          rating: form.rating,
          feedback_Message: form.feedback_Message,
        });
        setSuccessMsg('Feedback updated successfully!');
      } else {
        await createFeedback(form);
        setSuccessMsg('Feedback added successfully!');
      }

      setForm({
        feedback_Id: '',
        customer_Id: '',
        order_No: '',
        rating: '',
        feedback_Message: '',
      });
      setEditing(false);
      fetchData();

      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setApiError('Something went wrong. Please try again.');
    }
  };

  const handleEdit = (fb) => {
    setForm(fb);
    setEditing(true);
    setError('');
    setApiError('');
  };

  const handleDeleteConfirmation = (feedbackId) => {
    setFeedbackToDelete(feedbackId);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!feedbackToDelete) return;
    try {
      await deleteFeedback(feedbackToDelete);
      fetchData();
      setShowModal(false); // Hide modal after deleting
    } catch (err) {
      setApiError('Failed to delete feedback.');
    }
  };

  const handleCancelDelete = () => {
    setShowModal(false); // Close modal without deleting
  };

  const filteredFeedbacks = feedbacks.filter((fb) => {
    const query = searchQuery.toLowerCase();
    return (
      fb.customer_Id.toString().includes(query) ||
      fb.order_No.toString().includes(query) ||
      fb.feedback_Message.toLowerCase().includes(query)
    );
  });

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4 fw-bold text-success">Feedback Management</h2>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Search by Customer ID, Order No, or Message..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Error/Success Messages */}
      {error && <div className="alert alert-warning">{error}</div>}
      {apiError && <div className="alert alert-danger">{apiError}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {/* Form */}
      <form
        ref={formRef}
        className="row gx-4 gy-3 bg-light p-4 rounded shadow-sm align-items-end mb-5"
        onSubmit={handleSubmit}
      >
        <div className="col-md-2">
          <label className="form-label">Feedback ID</label>
          <input
            type="text"
            className="form-control"
            name="feedback_Id"
            value={form.feedback_Id}
            onChange={handleChange}
            required
            disabled={editing}
          />
        </div>
        <div className="col-md-2">
          <label className="form-label">Customer ID</label>
          <input
            type="text"
            className="form-control"
            name="customer_Id"
            value={form.customer_Id}
            onChange={handleChange}
            required
            disabled={editing}
          />
        </div>
        <div className="col-md-2">
          <label className="form-label">Order No</label>
          <input
            type="text"
            className="form-control"
            name="order_No"
            value={form.order_No}
            onChange={handleChange}
            required
            disabled={editing}
          />
        </div>
        <div className="col-md-2">
          <label className="form-label">Rating</label>
          <input
            type="number"
            className="form-control"
            name="rating"
            value={form.rating}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Message</label>
          <input
            type="text"
            className="form-control"
            name="feedback_Message"
            value={form.feedback_Message}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-2 d-flex gap-2">
          <button type="submit" className="btn btn-success w-100">
            {editing ? 'Update' : 'Add'}
          </button>
          {editing && (
            <button
              type="button"
              className="btn btn-secondary w-100"
              onClick={() => {
                setForm({
                  feedback_Id: '',
                  customer_Id: '',
                  order_No: '',
                  rating: '',
                  feedback_Message: '',
                });
                setEditing(false);
                setError('');
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Table */}
      <div className="table-responsive rounded shadow-sm">
        <table className="table table-hover align-middle text-center">
          <thead className="table-success sticky-top">
            <tr>
              <th>Feedback ID</th>
              <th>Customer ID</th>
              <th>Order No</th>
              <th>Rating</th>
              <th>Message</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFeedbacks.map((fb) => (
              <tr key={fb.feedback_Id}>
                <td>{fb.feedback_Id}</td>
                <td>{fb.customer_Id}</td>
                <td>{fb.order_No}</td>
                <td>{fb.rating}</td>
                <td>{fb.feedback_Message}</td>
                <td>
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => handleEdit(fb)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteConfirmation(fb.feedback_Id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredFeedbacks.length === 0 && (
              <tr>
                <td colSpan="6" className="text-muted">
                  No feedbacks found.
                </td>
              </tr>
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
                <p>Are you sure you want to delete this feedback?</p>
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

export default FeedbackPage;
