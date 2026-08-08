import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import ApiClient from '../services/api';
import { useAuth } from './AuthContext';
import { playNotificationTone } from '../utils/audio';
import { Bell } from 'lucide-react';

const NotesContext = createContext();

export const NotesProvider = ({ children }) => {
    const { user } = useAuth();
    const [notes, setNotes] = useState([]);
    const [stats, setStats] = useState({
        total_notes: 0,
        completed_count: 0,
        pending_count: 0,
        pinned_count: 0,
        archived_count: 0,
        favorites_count: 0,
        deleted_count: 0,
    });
    const [categories, setCategories] = useState([]);
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loadingNotes, setLoadingNotes] = useState(false);
    const [triggeredReminders, setTriggeredReminders] = useState(new Set());
    const [activeAlarm, setActiveAlarm] = useState(null);

    const loadNotes = useCallback(async () => {
        if (!user) return;
        setLoadingNotes(true);
        try {
            const res = await ApiClient.getNotes({
                search,
                filter,
                sortBy,
                categoryId: selectedCategory,
            });
            if (res.success) {
                setNotes(res.data);
            }

            const statsRes = await ApiClient.getNoteStats();
            if (statsRes.success) {
                setStats(statsRes.data);
            }

            const catRes = await ApiClient.getCategories();
            if (catRes.success) {
                setCategories(catRes.data);
            }
        } catch (err) {
            console.error('Failed to load notes data:', err);
        } finally {
            setLoadingNotes(false);
        }
    }, [user, search, filter, sortBy, selectedCategory]);

    useEffect(() => {
        loadNotes();
    }, [loadNotes]);

    // Live Audio & Screen Alarm Checker (every 3 seconds)
    useEffect(() => {
        if (!user || notes.length === 0) return;

        const interval = setInterval(() => {
            const now = new Date();
            notes.forEach((note) => {
                if (note.reminder_datetime && note.reminder_is_active) {
                    const reminderTime = new Date(note.reminder_datetime);
                    const timeDiff = now - reminderTime;

                    // Play if within last 60 seconds and not already played
                    if (timeDiff >= 0 && timeDiff <= 60000 && !triggeredReminders.has(note.id)) {
                        playNotificationTone(note.notification_sound || 'alarm');
                        setActiveAlarm(note);
                        setTriggeredReminders((prev) => new Set(prev).add(note.id));

                        if ('Notification' in window && Notification.permission === 'granted') {
                            new Notification(`⏰ Reminder: ${note.title || 'Keeper Note'}`, {
                                body: note.content || 'Your scheduled reminder alarm is ringing!',
                                icon: '/favicon.ico',
                            });
                        }
                    }
                }
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [user, notes, triggeredReminders]);

    const addNote = async (newNote) => {
        try {
            const res = await ApiClient.createNote(newNote);
            if (res.success) {
                loadNotes();
                return res.data;
            }
        } catch (err) {
            console.error('Add note error:', err);
            throw err;
        }
    };

    const editNote = async (id, updates) => {
        try {
            const res = await ApiClient.updateNote(id, updates);
            if (res.success) {
                loadNotes();
                return res.data;
            }
        } catch (err) {
            console.error('Update note error:', err);
            throw err;
        }
    };

    const deleteNote = async (id) => {
        try {
            const res = await ApiClient.deleteNote(id);
            if (res.success) {
                loadNotes();
            }
        } catch (err) {
            console.error('Delete note error:', err);
        }
    };

    const restoreNote = async (id) => {
        try {
            const res = await ApiClient.restoreNote(id);
            if (res.success) {
                loadNotes();
            }
        } catch (err) {
            console.error('Restore note error:', err);
        }
    };

    const duplicateNote = async (id) => {
        try {
            const res = await ApiClient.duplicateNote(id);
            if (res.success) {
                loadNotes();
            }
        } catch (err) {
            console.error('Duplicate note error:', err);
        }
    };

    const setReminder = async (noteId, reminderData) => {
        try {
            const res = await ApiClient.setReminder(noteId, reminderData);
            if (res.success) {
                loadNotes();
            }
        } catch (err) {
            console.error('Set reminder error:', err);
        }
    };

    const removeReminder = async (noteId) => {
        try {
            const res = await ApiClient.deleteReminder(noteId);
            if (res.success) {
                loadNotes();
            }
        } catch (err) {
            console.error('Remove reminder error:', err);
        }
    };

    const addCategory = async (name) => {
        try {
            const res = await ApiClient.createCategory(name);
            if (res.success) {
                setCategories((prev) => [...prev, res.data]);
                return res.data;
            }
        } catch (err) {
            console.error('Add category error:', err);
        }
    };

    return (
        <NotesContext.Provider
            value={{
                notes,
                stats,
                categories,
                filter,
                setFilter,
                sortBy,
                setSortBy,
                search,
                setSearch,
                selectedCategory,
                setSelectedCategory,
                loadingNotes,
                addNote,
                editNote,
                deleteNote,
                restoreNote,
                duplicateNote,
                setReminder,
                removeReminder,
                addCategory,
                refreshNotes: loadNotes,
            }}
        >
            {children}

            {/* Live On-Screen Alarm Popup Modal */}
            {activeAlarm && ReactDOM.createPortal(
                <div className="modal-backdrop" style={{ zIndex: 99999 }}>
                    <div className="modal-content" style={{ textAlign: 'center', maxWidth: '420px', padding: '32px 24px' }}>
                        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                            <div style={{
                                background: 'rgba(245, 186, 19, 0.15)',
                                padding: '16px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Bell size={40} color="#f5ba13" />
                            </div>
                        </div>
                        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '8px' }}>
                            ⏰ {activeAlarm.title || 'Reminder Alert!'}
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.5 }}>
                            {activeAlarm.content || 'Your scheduled reminder time has arrived.'}
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                type="button"
                                className="chip"
                                style={{ padding: '8px 16px', fontWeight: 600 }}
                                onClick={() => {
                                    const snoozeTime = new Date(Date.now() + 5 * 60 * 1000);
                                    setReminder(activeAlarm.id, {
                                        reminder_datetime: snoozeTime.toISOString(),
                                        notification_sound: activeAlarm.notification_sound || 'alarm',
                                        repeat_type: 'none',
                                    });
                                    setActiveAlarm(null);
                                }}
                            >
                                Snooze (5m)
                            </button>
                            <button
                                type="button"
                                className="btn-primary"
                                style={{ margin: 0, width: 'auto', padding: '10px 24px' }}
                                onClick={() => setActiveAlarm(null)}
                            >
                                Dismiss Alarm
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </NotesContext.Provider>
    );
};

export const useNotes = () => useContext(NotesContext);
