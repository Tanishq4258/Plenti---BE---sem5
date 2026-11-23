const API_BASE = '/api';

export const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('plenti_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }

    return data;
  },

  // Auth API
  auth: {
    login: (email, password) =>
      api.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }),
    register: (userData) =>
      api.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      }),
    getMe: () => api.request('/auth/me')
  },

  // Listings API
  listings: {
    getAll: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return api.request(`/listings${q ? `?${q}` : ''}`);
    },
    getById: (id) => api.request(`/listings/${id}`),
    create: (data) =>
      api.request('/listings', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    updateStock: (id, payload) =>
      api.request(`/listings/${id}/stock`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      }),
    delete: (id) =>
      api.request(`/listings/${id}`, {
        method: 'DELETE'
      })
  },

  // Orders API
  orders: {
    create: (data) =>
      api.request('/orders', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    getMyOrders: () => api.request('/orders/my-orders'),
    getStoreOrders: (status) =>
      api.request(`/orders/store-orders${status ? `?status=${status}` : ''}`),
    updateStatus: (id, status) =>
      api.request(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      }),
    verifyCode: (orderId, pickupCode) =>
      api.request('/orders/verify-code', {
        method: 'POST',
        body: JSON.stringify({ orderId, pickupCode })
      })
  },

  // Businesses API
  businesses: {
    getAll: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return api.request(`/businesses${q ? `?${q}` : ''}`);
    },
    getMyStats: () => api.request('/businesses/current/stats'),
    updateMyProfile: (data) =>
      api.request('/businesses/current/profile', {
        method: 'PUT',
        body: JSON.stringify(data)
      })
  },

  // Admin API
  admin: {
    getOverview: () => api.request('/admin/overview'),
    getBusinesses: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return api.request(`/admin/businesses${q ? `?${q}` : ''}`);
    },
    updateBusinessStatus: (id, payload) =>
      api.request(`/admin/businesses/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      }),
    getCustomers: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return api.request(`/admin/customers${q ? `?${q}` : ''}`);
    },
    updateCustomerStatus: (id, status) =>
      api.request(`/admin/customers/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      })
  }
};
