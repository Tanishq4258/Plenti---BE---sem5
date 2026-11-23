/**
 * PLENTI SURPLUS FOOD MARKETPLACE — API CLIENT
 * Connects frontend client pages with the Node.js / Express / MongoDB backend.
 */

const API_BASE_URL = window.PLENTI_API_URL || 'http://localhost:5000/api';

const PlentiAPI = {
  baseUrl: API_BASE_URL,

  // Helper for authenticated HTTP requests
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('plenti_access_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.warn(`[PlentiAPI] Request to ${endpoint} failed:`, error.message);
      throw error;
    }
  },

  // Health check to detect if the backend server is online
  async checkHealth() {
    try {
      const res = await fetch(`${this.baseUrl}/health`, { method: 'GET', cache: 'no-cache' });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Auth Endpoints
  auth: {
    async register(userData) {
      return PlentiAPI.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
    },

    async login(email, password) {
      return PlentiAPI.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
    },

    async getMe() {
      return PlentiAPI.request('/auth/me', { method: 'GET' });
    }
  },

  // Surplus Food Listings
  listings: {
    async getAll(params = {}) {
      const query = new URLSearchParams(params).toString();
      return PlentiAPI.request(`/listings${query ? `?${query}` : ''}`, { method: 'GET' });
    },

    async getById(id) {
      return PlentiAPI.request(`/listings/${id}`, { method: 'GET' });
    },

    async create(listingData) {
      return PlentiAPI.request('/listings', {
        method: 'POST',
        body: JSON.stringify(listingData)
      });
    },

    async update(id, listingData) {
      return PlentiAPI.request(`/listings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(listingData)
      });
    },

    async delete(id) {
      return PlentiAPI.request(`/listings/${id}`, {
        method: 'DELETE'
      });
    },

    async updateStock(id, deltaOrQuantity) {
      return PlentiAPI.request(`/listings/${id}/stock`, {
        method: 'PATCH',
        body: JSON.stringify(deltaOrQuantity)
      });
    }
  },

  // Orders
  orders: {
    async create(orderData) {
      return PlentiAPI.request('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
      });
    },

    async getMyOrders() {
      return PlentiAPI.request('/orders/my-orders', { method: 'GET' });
    },

    async getStoreOrders(status) {
      const query = status && status !== 'all' ? `?status=${status}` : '';
      return PlentiAPI.request(`/orders/store-orders${query}`, { method: 'GET' });
    },

    async updateStatus(id, status) {
      return PlentiAPI.request(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
    },

    async verifyCode(orderId, pickupCode) {
      return PlentiAPI.request('/orders/verify-code', {
        method: 'POST',
        body: JSON.stringify({ orderId, pickupCode })
      });
    }
  },

  // Businesses
  businesses: {
    async getAll(params = {}) {
      const query = new URLSearchParams(params).toString();
      return PlentiAPI.request(`/businesses${query ? `?${query}` : ''}`, { method: 'GET' });
    },

    async getById(id) {
      return PlentiAPI.request(`/businesses/${id}`, { method: 'GET' });
    },

    async getMyStats() {
      return PlentiAPI.request('/businesses/current/stats', { method: 'GET' });
    },

    async updateMyProfile(profileData) {
      return PlentiAPI.request('/businesses/current/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });
    }
  },

  // Admin Management
  admin: {
    async getOverview() {
      return PlentiAPI.request('/admin/overview', { method: 'GET' });
    },

    async getAllBusinesses(params = {}) {
      const query = new URLSearchParams(params).toString();
      return PlentiAPI.request(`/admin/businesses${query ? `?${query}` : ''}`, { method: 'GET' });
    },

    async updateBusinessStatus(id, statusPayload) {
      return PlentiAPI.request(`/admin/businesses/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(statusPayload)
      });
    },

    async getAllCustomers(params = {}) {
      const query = new URLSearchParams(params).toString();
      return PlentiAPI.request(`/admin/customers${query ? `?${query}` : ''}`, { method: 'GET' });
    },

    async updateCustomerStatus(id, status) {
      return PlentiAPI.request(`/admin/customers/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
    }
  }
};

window.PlentiAPI = PlentiAPI;
