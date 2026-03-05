const API_URL = '/api';

const api = {
    // Auth
    register: async (userData) => {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Registration failed');
        return data;
    },

    login: async (userData) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed');
        return data;
    },

    // Notes
    getNotes: async (queryParams = '') => {
        const res = await fetch(`${API_URL}/notes${queryParams}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch notes');
        return data;
    },

    getNoteDetails: async (id) => {
        const res = await fetch(`${API_URL}/notes/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        return data;
    },

    uploadNote: async (formData, token) => {
        const res = await fetch(`${API_URL}/notes`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData // multipart/form-data doesn't need Content-Type header manually set
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Upload failed');
        return data;
    },

    toggleLike: async (noteId, token) => {
        const res = await fetch(`${API_URL}/notes/${noteId}/like`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        return data;
    },

    downloadNote: async (noteId) => {
        window.open(`${API_URL}/notes/${noteId}/download`, '_blank');
    },

    viewNote: async (noteId) => {
        window.open(`${API_URL}/notes/${noteId}/view`, '_blank');
    },

    deleteNote: async (noteId, token) => {
        const res = await fetch(`${API_URL}/notes/${noteId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        return data;
    },

    // Comments
    getComments: async (noteId) => {
        const res = await fetch(`${API_URL}/comments/${noteId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        return data;
    },

    addComment: async (noteId, text, token) => {
        const res = await fetch(`${API_URL}/comments/${noteId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ text })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        return data;
    },

    // User Dashboard
    getUserDashboard: async (token) => {
        const res = await fetch(`${API_URL}/users/dashboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        return data;
    }
};

window.api = api;
