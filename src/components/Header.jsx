import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotes } from '../context/NotesContext';
import { Lightbulb, Search, Moon, Sun, User, LogOut, MoreVertical } from 'lucide-react';

function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const { darkMode, toggleTheme } = useTheme();
    const { search, setSearch } = useNotes();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isNotesView = location.pathname === '/' || location.pathname === '/notes';
    const isProfileView = location.pathname === '/profile';

    return (
        <header className="main-header">
            <h1 className="header-brand" onClick={() => navigate('/')}>
                <Lightbulb size={26} />
                <span>Keeper</span>
            </h1>

            <div className="header-right-group">
                {user && isNotesView && (
                    <div className="search-bar">
                        <Search size={18} color="#ffffff" />
                        <input
                            type="text"
                            placeholder="Search title, content..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                )}

                {/* Inline Header Buttons (Visible on screens >= 540px) */}
                <div className="header-buttons-inline">
                    <button className="header-btn" onClick={toggleTheme} title="Toggle Theme">
                        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                        <span className="btn-label">{darkMode ? 'Light' : 'Dark'}</span>
                    </button>

                    {user ? (
                        <>
                            <button
                                className="header-btn"
                                onClick={() => navigate(isProfileView ? '/' : '/profile')}
                                title="Profile"
                            >
                                {user.profile_image ? (
                                    <img src={user.profile_image} alt="Avatar" className="user-avatar" />
                                ) : (
                                    <div className="user-avatar">{user.first_name?.[0] || 'U'}</div>
                                )}
                                <span className="btn-label">{user.first_name}</span>
                            </button>

                            <button className="header-btn" onClick={() => { logout(); navigate('/login'); }} title="Logout">
                                <LogOut size={18} />
                                <span className="btn-label">Logout</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="header-btn" onClick={() => navigate('/login')}>
                                Login
                            </button>
                            <button className="header-btn" onClick={() => navigate('/register')}>
                                Register
                            </button>
                        </>
                    )}
                </div>

                {/* Mobile Header Menu (< 540px) */}
                {user && (
                    <div className="header-mobile-menu-wrapper">
                        <button
                            type="button"
                            className="header-btn header-menu-toggle"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            title="Menu"
                        >
                            <MoreVertical size={20} />
                        </button>
                        {mobileMenuOpen && (
                            <div className="header-mobile-dropdown">
                                <button
                                    type="button"
                                    className="dropdown-item"
                                    onClick={() => {
                                        toggleTheme();
                                        setMobileMenuOpen(false);
                                    }}
                                >
                                    {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                                    <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                                </button>
                                <button
                                    type="button"
                                    className="dropdown-item"
                                    onClick={() => {
                                        navigate('/profile');
                                        setMobileMenuOpen(false);
                                    }}
                                >
                                    <User size={16} />
                                    <span>Profile ({user.first_name})</span>
                                </button>
                                <button
                                    type="button"
                                    className="dropdown-item danger"
                                    onClick={() => {
                                        logout();
                                        navigate('/login');
                                        setMobileMenuOpen(false);
                                    }}
                                >
                                    <LogOut size={16} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}

export default Header;


