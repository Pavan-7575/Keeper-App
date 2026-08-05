import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../services/api';
import { LogIn, Mail, Lock, Globe } from 'lucide-react';

function LoginPage({ setCurrentTab }) {
    const { login } = useAuth();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login({ identifier, password });
            setCurrentTab('notes');
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-header">
                <h2>Welcome Back</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sign in to access your Keeper notes</p>
            </div>

            {error && <div className="error-alert">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label>Email or Username</label>
                    <input
                        type="text"
                        required
                        placeholder="Enter email or username"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label>Password</label>
                        <span
                            style={{ fontSize: '0.8rem', color: 'var(--primary-color)', cursor: 'pointer' }}
                            onClick={() => setCurrentTab('forgot-password')}
                        >
                            Forgot?
                        </span>
                    </div>
                    <input
                        type="password"
                        required
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Logging in...' : 'Sign In'}
                </button>
            </form>

            <div className="social-auth">
                <div style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)', margin: '10px 0' }}>
                    OR CONTINUE WITH
                </div>
                <a href={`${API_BASE_URL}/auth/google`} className="btn-oauth" style={{ textDecoration: 'none' }}>
                    <Globe size={18} color="#db4437" /> Continue with Google
                </a>
                <a href={`${API_BASE_URL}/auth/facebook`} className="btn-oauth" style={{ textDecoration: 'none' }}>
                    <Globe size={18} color="#4267B2" /> Continue with Facebook
                </a>
            </div>

            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Don't have an account?{' '}
                <span
                    style={{ color: 'var(--primary-color)', fontWeight: 'bold', cursor: 'pointer' }}
                    onClick={() => setCurrentTab('register')}
                >
                    Create Account
                </span>
            </p>
        </div>
    );
}

export default LoginPage;
