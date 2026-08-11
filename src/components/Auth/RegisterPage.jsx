import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

function RegisterPage() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        password: '',
        confirm_password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
                    navigate('/login');
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

            <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label>First Name</label>
                        <input name="first_name" required autoComplete="off" value={formData.first_name} onChange={handleChange} />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label>Last Name</label>
                        <input name="last_name" required autoComplete="off" value={formData.last_name} onChange={handleChange} />
                    </div>
                </div>

                <div className="form-group">
                    <label>Username</label>
                    <input name="username" required autoComplete="off" value={formData.username} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" name="email" required autoComplete="off" value={formData.email} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>Password</label>
                    <div style={{ position: 'relative', width: '100%' }}>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            required
                            autoComplete="new-password"
                            value={formData.password}
                            onChange={handleChange}
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
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Min 8 chars with uppercase, lowercase, number & special symbol.
                    </span>
                </div>

                <div className="form-group">
                    <label>Confirm Password</label>
                    <div style={{ position: 'relative', width: '100%' }}>
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirm_password"
                            required
                            autoComplete="new-password"
                            value={formData.confirm_password}
                            onChange={handleChange}
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
                    {loading ? 'Creating Account...' : 'Register'}
                </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Already have an account?{' '}
                <Link
                    to="/login"
                    style={{ color: 'var(--primary-color)', fontWeight: 'bold', textDecoration: 'none' }}
                >
                    Sign In
                </Link>
            </p>
        </div>
    );
}

export default RegisterPage;

