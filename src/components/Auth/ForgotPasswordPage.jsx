import React, { useState } from 'react';
import ApiClient from '../../services/api';

function ForgotPasswordPage({ setCurrentTab }) {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            const res = await ApiClient.forgotPassword(email);
            if (res.success) {
                setMessage(res.message);
            }
        } catch (err) {
            setError(err.message || 'Failed to send password reset request.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-header">
                <h2>Forgot Password</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Enter your account email to receive a password reset link</p>
            </div>

            {error && <div className="error-alert">{error}</div>}
            {message && <div className="success-alert">{message}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label>Email Address</label>
                    <input
                        type="email"
                        required
                        placeholder="your_email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Sending Request...' : 'Send Reset Link'}
                </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Remembered your password?{' '}
                <span
                    style={{ color: 'var(--primary-color)', fontWeight: 'bold', cursor: 'pointer' }}
                    onClick={() => setCurrentTab('login')}
                >
                    Back to Login
                </span>
            </p>
        </div>
    );
}

export default ForgotPasswordPage;
