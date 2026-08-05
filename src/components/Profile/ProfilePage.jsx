import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import ApiClient, { SERVER_BASE_URL } from '../../services/api';
import { Camera, Lock, User, CheckCircle2 } from 'lucide-react';

function ProfilePage() {
    const { user, updateUserState } = useAuth();
    const [profileData, setProfileData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        username: user?.username || '',
    });

    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: '',
    });

    const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
    const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
    const [uploadMsg, setUploadMsg] = useState({ type: '', text: '' });
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingPassword, setLoadingPassword] = useState(false);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileMsg({ type: '', text: '' });
        setLoadingProfile(true);

        try {
            const res = await ApiClient.updateProfile(profileData);
            if (res.success) {
                updateUserState(res.data);
                setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
            }
        } catch (err) {
            setProfileMsg({ type: 'error', text: err.message || 'Profile update failed.' });
        } finally {
            setLoadingProfile(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordMsg({ type: '', text: '' });

        if (passwordData.new_password !== passwordData.confirm_password) {
            return setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
        }

        setLoadingPassword(true);
        try {
            const res = await ApiClient.changePassword({
                current_password: passwordData.current_password,
                new_password: passwordData.new_password,
            });
            if (res.success) {
                setPasswordMsg({ type: 'success', text: 'Password changed successfully.' });
                setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
            }
        } catch (err) {
            setPasswordMsg({ type: 'error', text: err.message || 'Failed to update password.' });
        } finally {
            setLoadingPassword(false);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadMsg({ type: '', text: '' });
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const res = await ApiClient.uploadAvatar(formData);
            if (res.success) {
                updateUserState(res.data);
                setUploadMsg({ type: 'success', text: 'Avatar uploaded successfully.' });
            }
        } catch (err) {
            setUploadMsg({ type: 'error', text: err.message || 'Avatar upload failed.' });
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '30px auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header / Avatar Card */}
            <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', textAlign: 'left', padding: '24px' }}>
                <div style={{ position: 'relative' }}>
                    {user?.profile_image ? (
                        <img
                            src={user.profile_image.startsWith('http') ? user.profile_image : `${SERVER_BASE_URL}${user.profile_image}`}
                            alt="Profile"
                            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                    ) : (
                        <div
                            style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--primary-color)',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2rem',
                                fontWeight: 'bold',
                            }}
                        >
                            {user?.first_name?.[0] || 'U'}
                        </div>
                    )}
                    <label
                        htmlFor="avatar-upload"
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            background: '#333',
                            color: '#fff',
                            borderRadius: '50%',
                            padding: '6px',
                            cursor: 'pointer',
                        }}
                    >
                        <Camera size={14} />
                    </label>
                    <input id="avatar-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
                </div>

                <div>
                    <h2 style={{ fontSize: '1.4rem' }}>
                        {user?.first_name} {user?.last_name}
                    </h2>
                    <p style={{ color: 'var(--text-muted)' }}>@{user?.username} • {user?.email}</p>
                    {uploadMsg.text && (
                        <span style={{ fontSize: '0.8rem', color: uploadMsg.type === 'error' ? '#e74c3c' : '#2ecc71' }}>
                            {uploadMsg.text}
                        </span>
                    )}
                </div>
            </div>

            {/* Profile Information Form */}
            <div className="auth-container" style={{ maxWidth: '100%', margin: 0 }}>
                <h3><User size={18} /> Update Profile</h3>

                {profileMsg.text && (
                    <div className={profileMsg.type === 'error' ? 'error-alert' : 'success-alert'}>
                        {profileMsg.text}
                    </div>
                )}

                <form onSubmit={handleProfileSubmit} className="auth-form" style={{ marginTop: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>First Name</label>
                            <input
                                value={profileData.first_name}
                                onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                            />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Last Name</label>
                            <input
                                value={profileData.last_name}
                                onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Username</label>
                        <input
                            value={profileData.username}
                            onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loadingProfile}>
                        {loadingProfile ? 'Saving...' : 'Save Profile'}
                    </button>
                </form>
            </div>

            {/* Change Password Form */}
            <div className="auth-container" style={{ maxWidth: '100%', margin: 0 }}>
                <h3><Lock size={18} /> Change Password</h3>

                {passwordMsg.text && (
                    <div className={passwordMsg.type === 'error' ? 'error-alert' : 'success-alert'}>
                        {passwordMsg.text}
                    </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="auth-form" style={{ marginTop: '16px' }}>
                    <div className="form-group">
                        <label>Current Password</label>
                        <input
                            type="password"
                            required
                            value={passwordData.current_password}
                            onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            required
                            value={passwordData.new_password}
                            onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirm New Password</label>
                        <input
                            type="password"
                            required
                            value={passwordData.confirm_password}
                            onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loadingPassword}>
                        {loadingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ProfilePage;
