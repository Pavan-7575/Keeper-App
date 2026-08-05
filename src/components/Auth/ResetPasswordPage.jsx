import React, { useState } from 'react';
import ApiClient from '../../services/api';

function ResetPasswordPage({ setCurrentTab }) {
    const [token, setToken] = useState(() => new URLSearchParams(window.location.search).get('token') || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (password !== confirmPassword) {
            return setError('Passwords do not match.');
        }

        setLoading(true);
        try {
            const res = await ApiClient.resetPassword({ token, password, confirm_password: confirmPassword });
            if (res.success) {
                setMessage('Password reset successful! Redirecting to login...');
                setTimeout(() => {
                    window.history.replaceState({}, document.title, '/login');
                    setCurrentTab('login');
                }, 1500);
            }
        } catch (err) {
            setError(err.message || 'Failed to reset password. Invalid or expired token.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-header">
                <h2>Reset Password</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Choose a new strong password</p>
            </div>

            {error && <div className="error-alert">{error}</div>}
            {message && <div className="success-alert">{message}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label>Reset Token</label>
                    <input
                        type="text"
                        required
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="Enter token from email"
                    />
                </div>

                <div className="form-group">
                    <label>New Password</label>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter new password"
                    />
                </div>

                <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                    />
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Resetting Password...' : 'Reset Password'}
                </button>
            </form>
        </div>
    );
}

export default ResetPasswordPage;
