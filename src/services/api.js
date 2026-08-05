const getHostname = () => {
    if (typeof window !== 'undefined' && window.location.hostname) {
        return window.location.hostname;
    }
    return 'localhost';
};

export const SERVER_BASE_URL = import.meta.env.VITE_SERVER_URL || `http://${getHostname()}:5000`;
export const API_BASE_URL = import.meta.env.VITE_API_URL || `${SERVER_BASE_URL}/api`;

class ApiClient {
    static getToken() {
        return localStorage.getItem('accessToken') || '';
    }

    static setTokens(accessToken, refreshToken) {
        if (accessToken) localStorage.setItem('accessToken', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    }

    static clearTokens() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }

    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const token = this.getToken();

        const headers = {
            ...options.headers,
        };

        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers,
            credentials: 'include',
        };

        try {
            let response = await fetch(url, config);

            // Handle token expiration
            if (response.status === 401 && !endpoint.includes('/auth/')) {
                const refreshed = await this.refreshToken();
                if (refreshed) {
                    config.headers['Authorization'] = `Bearer ${this.getToken()}`;
                    response = await fetch(url, config);
                } else {
                    this.clearTokens();
                    window.dispatchEvent(new Event('auth_logout'));
                }
            }

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'API request failed');
            }
            return data;
        } catch (error) {
            console.error(`[API Error] ${endpoint}:`, error.message);
            throw error;
        }
    }

    static async refreshToken() {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            const res = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
                credentials: 'include',
            });
            const data = await res.json();
            if (data.success && data.data?.accessToken) {
                this.setTokens(data.data.accessToken, null);
                return true;
            }
            return false;
        } catch (err) {
            return false;
        }
    }

    // Auth API
    static login(credentials) {
        return this.request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
    }

    static register(userData) {
        return this.request('/auth/register', { method: 'POST', body: JSON.stringify(userData) });
    }

    static logout() {
        return this.request('/auth/logout', { method: 'POST' });
    }

    static forgotPassword(email) {
        return this.request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
    }

    static resetPassword(data) {
        return this.request('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) });
    }

    static verifyEmail(token) {
        return this.request(`/auth/verify-email?token=${token}`, { method: 'GET' });
    }

    // Notes API
    static getNotes(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/notes${query ? `?${query}` : ''}`, { method: 'GET' });
    }

    static getNoteStats() {
        return this.request('/notes/stats', { method: 'GET' });
    }

    static createNote(noteData) {
        return this.request('/notes', { method: 'POST', body: JSON.stringify(noteData) });
    }

    static updateNote(id, noteData) {
        return this.request(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(noteData) });
    }

    static deleteNote(id) {
        return this.request(`/notes/${id}`, { method: 'DELETE' });
    }

    static restoreNote(id) {
        return this.request(`/notes/${id}/restore`, { method: 'POST' });
    }

    static duplicateNote(id) {
        return this.request(`/notes/${id}/duplicate`, { method: 'POST' });
    }

    // Categories API
    static getCategories() {
        return this.request('/categories', { method: 'GET' });
    }

    static createCategory(name) {
        return this.request('/categories', { method: 'POST', body: JSON.stringify({ name }) });
    }

    static deleteCategory(id) {
        return this.request(`/categories/${id}`, { method: 'DELETE' });
    }

    // Reminders API
    static setReminder(noteId, reminderData) {
        return this.request(`/reminders/${noteId}`, { method: 'POST', body: JSON.stringify(reminderData) });
    }

    static deleteReminder(noteId) {
        return this.request(`/reminders/${noteId}`, { method: 'DELETE' });
    }

    // User API
    static getProfile() {
        return this.request('/users/profile', { method: 'GET' });
    }

    static updateProfile(profileData) {
        return this.request('/users/profile', { method: 'PUT', body: JSON.stringify(profileData) });
    }

    static uploadAvatar(formData) {
        return this.request('/users/upload-avatar', { method: 'POST', body: formData });
    }

    static changePassword(passwordData) {
        return this.request('/users/change-password', { method: 'PUT', body: JSON.stringify(passwordData) });
    }
}

export default ApiClient;
