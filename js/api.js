window.TestHiveApi = (() => {
  async function request(url, options = {}) {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || 'Request failed.');
    }

    return data;
  }

  function formatLongDate(value) {
    return new Date(`${value}T00:00:00`).toLocaleDateString('en-KE', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function formatShortDate(value) {
    return new Date(`${value}T00:00:00`).toLocaleDateString('en-KE', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  return {
    getHomeContent() {
      return request('/api/content/home');
    },
    getEvents(params = '') {
      return request(`/api/events${params}`);
    },
    getMembers(params = '') {
      return request(`/api/members${params}`);
    },
    getGallery(params = '') {
      return request(`/api/gallery${params}`);
    },
    submitApplication(payload) {
      return request('/api/applications', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },
    submitDonation(payload) {
      return request('/api/donations', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },
    submitSponsorship(payload) {
      return request('/api/sponsorships', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },
    getAdminSession() {
      return request('/api/admin/session');
    },
    adminLogin(payload) {
      return request('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },
    adminLogout() {
      return request('/api/admin/logout', {
        method: 'POST'
      });
    },
    getAdminDashboard() {
      return request('/api/admin/dashboard');
    },
    getAdminSubmissions(type) {
      return request(`/api/admin/submissions?type=${encodeURIComponent(type)}`);
    },
    updateAdminSubmissionStatus(type, id, status) {
      return request(`/api/admin/submissions/${encodeURIComponent(type)}/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
    },
    getAdminCollection(type) {
      return request(`/api/admin/${type}`);
    },
    createAdminCollectionItem(type, payload) {
      return request(`/api/admin/${type}`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },
    updateAdminCollectionItem(type, id, payload) {
      return request(`/api/admin/${type}/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
    },
    deleteAdminCollectionItem(type, id) {
      return request(`/api/admin/${type}/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    },
    formatLongDate,
    formatShortDate
  };
})();
