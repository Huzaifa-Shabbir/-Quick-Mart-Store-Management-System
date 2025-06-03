import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/feedback';

// Get all feedback entries
export const getFeedbacks = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch feedback');
  }
};

// Create a new feedback entry
export const createFeedback = async (feedbackData) => {
  try {
    await axios.post(API_BASE_URL, feedbackData);
  } catch (error) {
    throw new Error('Failed to create feedback');
  }
};

// Update an existing feedback entry
export const updateFeedback = async (id, feedbackData) => {
  try {
    await axios.put(`${API_BASE_URL}/${id}`, feedbackData);
  } catch (error) {
    throw new Error('Failed to update feedback');
  }
};

// Delete a feedback entry
export const deleteFeedback = async (id) => {
  try {
    await axios.delete(`${API_BASE_URL}/${id}`);
  } catch (error) {
    throw new Error('Failed to delete feedback');
  }
};
