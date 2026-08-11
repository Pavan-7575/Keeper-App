import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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

function NotesDashboard() {
    const {
        notes,
        filter,
        sortBy,
        setSortBy,
        selectedCategory,
        setSelectedCategory,
        categories,
        addNote,
        deleteNote,
        loadingNotes,
    } = useNotes();

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
}

function MainAppContent() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <div style={{ fontSize: '1.2rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                    Loading Keeper App...
                </div>
            </div>
        );
    }

    return (
        <div>
            <Header />
            <main>
                <Routes>
                    {/* Protected Routes */}
                    <Route path="/" element={user ? <NotesDashboard /> : <Navigate to="/login" replace />} />
                    <Route path="/notes" element={user ? <NotesDashboard /> : <Navigate to="/login" replace />} />
                    <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" replace />} />

                    {/* Auth Routes */}
                    <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" replace />} />
                    <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" replace />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/verify-email" element={<VerifyEmailPage />} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
                </Routes>
            </main>
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

