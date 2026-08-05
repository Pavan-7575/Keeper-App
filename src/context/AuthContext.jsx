import React, { createContext, useContext, useState, useEffect } from 'react';
import ApiClient from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);

    const fetchUserProfile = async () => {
        try {
            const token = ApiClient.getToken();
            if (!token) {
                setLoading(false);
                return;
            }
            const res = await ApiClient.getProfile();
            if (res.success) {
                setUser(res.data);
            }
        } catch (err) {
            console.warn('Session expired or unauthenticated.');
            ApiClient.clearTokens();
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserProfile();

        const handleLogout = () => {
            setUser(null);
        };
        window.addEventListener('auth_logout', handleLogout);
        return () => window.removeEventListener('auth_logout', handleLogout);
    }, []);

    const login = async (credentials) => {
        setAuthError(null);
        try {
            const res = await ApiClient.login(credentials);
            if (res.success) {
                ApiClient.setTokens(res.data.accessToken, res.data.refreshToken);
                setUser(res.data.user);
                return res;
            }
        } catch (err) {
            setAuthError(err.message);
            throw err;
        }
    };

    const register = async (userData) => {
        setAuthError(null);
        try {
            const res = await ApiClient.register(userData);
            return res;
        } catch (err) {
            setAuthError(err.message);
            throw err;
        }
    };

    const logout = async () => {
        try {
            await ApiClient.logout();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            ApiClient.clearTokens();
            setUser(null);
        }
    };

    const updateUserState = (updatedUser) => {
        setUser((prev) => ({ ...prev, ...updatedUser }));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                authError,
                login,
                register,
                logout,
                updateUserState,
                fetchUserProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
