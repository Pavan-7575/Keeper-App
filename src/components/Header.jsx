import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotes } from '../context/NotesContext';
import { Lightbulb, Search, Moon, Sun, User, LogOut, LayoutDashboard, SlidersHorizontal } from 'lucide-react';

function Header({ currentTab, setCurrentTab }) {
    const { user, logout } = useAuth();
    const { darkMode, toggleTheme } = useTheme();
    const { search, setSearch, filter, setFilter, sortBy, setSortBy } = useNotes();

    return (
        <header>
            <h1 onClick={() => setCurrentTab('notes')}>
                <Lightbulb size={28} /> Keeper
            </h1>

            {user && currentTab === 'notes' && (
                <div className="header-controls">
                    <div className="search-bar">
                        <Search size={18} color="#ffffff" />
                        <input
                            type="text"
                            placeholder="Search title, content..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            )}

            <div className="header-controls">
                <button className="header-btn" onClick={toggleTheme} title="Toggle Theme">
                    {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                    {darkMode ? 'Light' : 'Dark'}
                </button>

                {user ? (
                    <div className="user-menu">
                        <button
                            className="header-btn"
                            onClick={() => setCurrentTab(currentTab === 'profile' ? 'notes' : 'profile')}
                        >
                            {user.profile_image ? (
                                <img src={user.profile_image} alt="Avatar" className="user-avatar" />
                            ) : (
                                <div className="user-avatar">{user.first_name?.[0] || 'U'}</div>
                            )}
                            <span>{user.first_name}</span>
                        </button>

                        <button className="header-btn" onClick={logout} title="Logout">
                            <LogOut size={18} /> Logout
                        </button>
                    </div>
                ) : (
                    <div className="user-menu">
                        <button className="header-btn" onClick={() => setCurrentTab('login')}>
                            Login
                        </button>
                        <button className="header-btn" onClick={() => setCurrentTab('register')}>
                            Register
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}

export default Header;
