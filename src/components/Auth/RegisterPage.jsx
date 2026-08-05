import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

function RegisterPage({ setCurrentTab }) {
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        password: '',
        confirm_password: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validatePassword = (pwd) => {
        if (pwd.length < 8) return 'Password must be at least 8 characters long.';
        if (!/[A-Z]/.test(pwd)) return 'Password must contain an uppercase letter.';
        if (!/[a-z]/.test(pwd)) return 'Password must contain a lowercase letter.';
        if (!/[0-9]/.test(pwd)) return 'Password must contain a number.';
        if (!/[\W_]/.test(pwd)) return 'Password must contain a special character.';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirm_password) {
            return setError('Passwords do not match.');
        }

        const pwdErr = validatePassword(formData.password);
        if (pwdErr) {
            return setError(pwdErr);
        }

        setLoading(true);
        try {
            const res = await register(formData);
            if (res.success) {
                setSuccess('Registration successful! Redirecting to Sign In page...');
                setTimeout(() => {
                    setCurrentTab('login');
                }, 1500);
            }
        } catch (err) {
            setError(err.message || 'Registration failed. Please check input values.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-header">
                <h2>Create Account</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Join Keeper App for smart note taking</p>
            </div>

            {error && <div className="error-alert">{error}</div>}
            {success && <div className="success-alert">{success}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label>First Name</label>
                        <input name="first_name" required value={formData.first_name} onChange={handleChange} />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label>Last Name</label>
                        <input name="last_name" required value={formData.last_name} onChange={handleChange} />
                    </div>
                </div>

                <div className="form-group">
                    <label>Username</label>
                    <input name="username" required value={formData.username} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" name="email" required value={formData.email} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>Password</label>
                    <input type="password" name="password" required value={formData.password} onChange={handleChange} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Min 8 chars with uppercase, lowercase, number & special symbol.
                    </span>
                </div>

                <div className="form-group">
                    <label>Confirm Password</label>
                    <input type="password" name="confirm_password" required value={formData.confirm_password} onChange={handleChange} />
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Register'}
                </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Already have an account?{' '}
                <span
                    style={{ color: 'var(--primary-color)', fontWeight: 'bold', cursor: 'pointer' }}
                    onClick={() => setCurrentTab('login')}
                >
                    Sign In
                </span>
            </p>
        </div>
    );
}

export default RegisterPage;
