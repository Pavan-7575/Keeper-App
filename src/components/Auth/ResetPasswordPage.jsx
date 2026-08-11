import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiClient from '../../services/api';
import { Eye, EyeOff } from 'lucide-react';

function ResetPasswordPage() {
    const navigate = useNavigate();
    const [token, setToken] = useState(() => new URLSearchParams(window.location.search).get('token') || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
                    navigate('/login');
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

            <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
                <div className="form-group">
                    <label>Reset Token</label>
                    <input
                        type="text"
                        required
                        autoComplete="off"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="Enter token from email"
                    />
                </div>

                <div className="form-group">
                    <label>New Password</label>
                    <div style={{ position: 'relative', width: '100%' }}>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter new password"
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

                <div className="form-group">
                    <label>Confirm New Password</label>
                    <div style={{ position: 'relative', width: '100%' }}>
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            style={{ paddingRight: '40px', width: '100%' }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            title={showConfirmPassword ? "Hide password" : "Show password"}
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
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Resetting Password...' : 'Reset Password'}
                </button>
            </form>
        </div>
    );
}

export default ResetPasswordPage;

