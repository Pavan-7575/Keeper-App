import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import Note from './Note';
import CreateArea from './CreateArea';
import DashboardStats from './DashboardStats';
import LoginPage from './Auth/LoginPage';
import RegisterPage from './Auth/RegisterPage';
import ForgotPasswordPage from './Auth/ForgotPasswordPage';
import ResetPasswordPage from './Auth/ResetPasswordPage';
import VerifyEmailPage from './Auth/VerifyEmailPage';
import ProfilePage from './Profile/ProfilePage';

import { AuthProvider, useAuth } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { NotesProvider, useNotes } from '../context/NotesContext';
import { FileQuestion, ArrowUpDown, Filter } from 'lucide-react';

function getInitialTab() {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);

    if (path.includes('reset-password') || searchParams.has('token') && path.includes('reset')) {
        return 'reset-password';
    }
    if (path.includes('verify-email') || searchParams.has('token') && path.includes('verify')) {
        return 'verify-email';
    }
    if (path.includes('forgot-password')) {
        return 'forgot-password';
    }
    if (path.includes('register')) {
        return 'register';
    }
    if (path.includes('login')) {
        return 'login';
    }
    return 'notes';
}

function MainAppContent() {
    const { user, loading } = useAuth();
    const {
        notes,
        filter,
        setFilter,
        sortBy,
        setSortBy,
        selectedCategory,
        setSelectedCategory,
        categories,
        addNote,
        deleteNote,
        loadingNotes,
    } = useNotes();

    const [currentTab, setCurrentTab] = useState(getInitialTab);

    useEffect(() => {
        const handleLocationChange = () => {
            setCurrentTab(getInitialTab());
        };
        window.addEventListener('popstate', handleLocationChange);
        return () => window.removeEventListener('popstate', handleLocationChange);
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <div style={{ fontSize: '1.2rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                    Loading Keeper App...
                </div>
            </div>
        );
    }

    const renderContent = () => {
        if (!user) {
            if (currentTab === 'register') return <RegisterPage setCurrentTab={setCurrentTab} />;
            if (currentTab === 'forgot-password') return <ForgotPasswordPage setCurrentTab={setCurrentTab} />;
            if (currentTab === 'reset-password') return <ResetPasswordPage setCurrentTab={setCurrentTab} />;
            if (currentTab === 'verify-email') return <VerifyEmailPage setCurrentTab={setCurrentTab} />;
            return <LoginPage setCurrentTab={setCurrentTab} />;
        }

        if (currentTab === 'profile') {
            return <ProfilePage />;
        }

        return (
            <div className="app-container">
                <DashboardStats />

                <div className="toolbar">
                    <div className="filter-group">
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Filter size={16} /> Category:
                        </span>
                        <select
                            className="select-dropdown"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="sort-group">
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <ArrowUpDown size={16} /> Sort by:
                        </span>
                        <select
                            className="select-dropdown"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="alphabetical">Alphabetical (A-Z)</option>
                            <option value="reminder">Reminder Date</option>
                        </select>
                    </div>
                </div>

                {filter !== 'deleted' && filter !== 'archived' && <CreateArea onAdd={addNote} />}

                {loadingNotes ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        Fetching notes...
                    </div>
                ) : notes.length === 0 ? (
                    <div className="empty-state">
                        <FileQuestion size={48} color="var(--text-muted)" />
                        <h3>No notes found</h3>
                        <p>Create your first note above or change your active filters.</p>
                    </div>
                ) : (
                    <div className="notes-grid">
                        {notes.map((noteItem) => (
                            <Note
                                key={noteItem.id}
                                id={noteItem.id}
                                title={noteItem.title}
                                content={noteItem.content}
                                color={noteItem.color}
                                is_pinned={noteItem.is_pinned}
                                is_archived={noteItem.is_archived}
                                is_deleted={noteItem.is_deleted}
                                is_completed={noteItem.is_completed}
                                is_favorite={noteItem.is_favorite}
                                category_name={noteItem.category_name}
                                labels={noteItem.labels}
                                reminder_datetime={noteItem.reminder_datetime}
                                reminder_is_active={noteItem.reminder_is_active}
                                onDelete={deleteNote}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div>
            <Header currentTab={currentTab} setCurrentTab={setCurrentTab} />
            <main>{renderContent()}</main>
            <Footer />
        </div>
    );
}

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <NotesProvider>
                    <MainAppContent />
                </NotesProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
