import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiClient from '../../services/api';
import { CheckCircle2, XCircle } from 'lucide-react';

function VerifyEmailPage() {
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Verifying your email token...');

    useEffect(() => {
        const token = new URLSearchParams(window.location.search).get('token');
        if (!token) {
            setStatus('error');
            setMessage('Verification token missing in link.');
            return;
        }

        ApiClient.verifyEmail(token)
            .then((res) => {
                if (res.success) {
                    setStatus('success');
                    setMessage(res.message || 'Email verified successfully!');
                }
            })
            .catch((err) => {
                setStatus('error');
                setMessage(err.message || 'Invalid or expired verification link.');
            });
    }, []);

    const goToLogin = () => {
        navigate('/login');
    };

    return (
        <div className="auth-container" style={{ textAlign: 'center' }}>
            <div className="auth-header">
                <h2>Email Verification</h2>
            </div>

            {status === 'verifying' && <p>{message}</p>}

            {status === 'success' && (
                <div>
                    <CheckCircle2 size={48} color="#2ecc71" style={{ margin: '0 auto 16px auto' }} />
                    <p className="success-alert">{message}</p>
                    <button className="btn-primary" onClick={goToLogin}>
                        Proceed to Login
                    </button>
                </div>
            )}

            {status === 'error' && (
                <div>
                    <XCircle size={48} color="#e74c3c" style={{ margin: '0 auto 16px auto' }} />
                    <p className="error-alert">{message}</p>
                    <button className="btn-primary" onClick={goToLogin}>
                        Back to Login
                    </button>
                </div>
            )}
        </div>
    );
}

export default VerifyEmailPage;

