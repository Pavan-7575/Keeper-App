import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../services/api';
import { LogIn, Mail, Lock, Globe, Eye, EyeOff } from 'lucide-react';

function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const errParam = searchParams.get('error');
        if (errParam) {
            if (errParam === 'facebook_not_configured') {
                setError('Facebook OAuth is not configured on the server. Please set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET in backend/.env.');
            } else if (errParam === 'google_not_configured') {
                setError('Google OAuth is not configured on the server. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend/.env.');
            } else if (errParam === 'oauth_failed') {
                setError('Social authentication failed or was cancelled.');
            } else if (errParam === 'oauth_error') {
                setError('An unexpected error occurred during social login.');
            } else {
                setError('Authentication failed. Please try again.');
            }
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login({ identifier, password });
            navigate('/');
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

            <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
                <div className="form-group">
                    <label>Email or Username</label>
                    <input
                        type="text"
                        required
                        autoComplete="off"
                        placeholder="Enter email or username"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label>Password</label>
                        <Link
                            to="/forgot-password"
                            style={{ fontSize: '0.8rem', color: 'var(--primary-color)', textDecoration: 'none' }}
                        >
                            Forgot?
                        </Link>
                    </div>
                    <div style={{ position: 'relative', width: '100%' }}>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            autoComplete="new-password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ paddingRight: '40px', width: '100%' }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            title={showPassword ? "Hide password" : "Show password"}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--text-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '4px',
                            }}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
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
                <Link
                    to="/register"
                    style={{ color: 'var(--primary-color)', fontWeight: 'bold', textDecoration: 'none' }}
                >
                    Create Account
                </Link>
            </p>
        </div>
    );
}

export default LoginPage;

