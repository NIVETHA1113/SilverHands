import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('silverhands_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for clear error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      message: error.response?.data?.message || 'Something went wrong. Please check your connection.',
      status: error.response?.status || 500
    };
    return Promise.reject(customError);
  }
);

export default api;

// ─── Opportunity API ─────────────────────────────────────────────────────────

export const opportunityAPI = {
  // Public browse
  getAll: (params = {}) => api.get('/opportunities', { params }),
  getById: (id) => api.get(`/opportunities/${id}`),

  // Protected — customer
  create: (data) => api.post('/opportunities', data),
  update: (id, data) => api.put(`/opportunities/${id}`, data),
  updateStatus: (id, status) => api.patch(`/opportunities/${id}/status`, { status }),
  delete: (id) => api.delete(`/opportunities/${id}`),
  getMy: () => api.get('/opportunities/my'),

  // Protected — view applications on an opportunity (customer only)
  getApplications: (opportunityId) => api.get(`/opportunities/${opportunityId}/applications`),

  // Protected — provider applies
  apply: (opportunityId, data) => api.post(`/opportunities/${opportunityId}/apply`, data),
};

// ─── Application API ──────────────────────────────────────────────────────────

export const applicationAPI = {
  // Provider: get all own applications
  getMy: () => api.get('/applications/my'),

  // Get application details by ID
  getById: (id) => api.get(`/applications/${id}`),

  // Customer: accept / reject
  accept: (id) => api.patch(`/applications/${id}/accept`),
  reject: (id) => api.patch(`/applications/${id}/reject`),

  // Provider: withdraw
  withdraw: (id) => api.patch(`/applications/${id}/withdraw`),

  // Customer: mark complete
  complete: (id) => api.patch(`/applications/${id}/complete`),

  // Customer: post review after completion
  createReview: (id, data) => {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    return api.post(`/applications/${id}/review`, data, isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined);
  },
};

// ─── Review / Trust API ───────────────────────────────────────────────────────

export const reviewAPI = {
  getProviderReviews: (providerId) => api.get(`/users/${providerId}/reviews`),
  getProviderTrust: (providerId) => api.get(`/users/${providerId}/trust`),
};

// ─── AI API ───────────────────────────────────────────────────────────────────

export const aiAPI = {
  extractSkills: (text) => api.post('/ai/extract-skills', { text }),
  generateProfile: (data) => api.post('/ai/generate-profile', data),
  generateServiceDescription: (data) => api.post('/ai/generate-service-description', data),
  extractRequirement: (text) => api.post('/ai/extract-requirement', { text }),
  explainMatch: (data) => api.post('/ai/explain-match', data),
  improveDescription: (data) => api.post('/ai/improve-description', data),
};

// ─── Message API ──────────────────────────────────────────────────────────────

export const messageAPI = {
  send: (data) => api.post('/messages', data),
  getMy: () => api.get('/messages/my'),
  markRead: (id) => api.patch(`/messages/${id}/read`),
};
