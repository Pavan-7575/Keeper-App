import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import ApiClient from '../services/api';
import { useAuth } from './AuthContext';
import { playNotificationTone } from '../utils/audio';

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
            console.error('Failed to load notes:', err);
        } finally {
            setLoadingNotes(false);
        }
    }, [user, search, filter, sortBy, selectedCategory]);

    useEffect(() => {
        loadNotes();
    }, [loadNotes]);

    // Live Audio Reminder Checker
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
                        playNotificationTone(note.notification_sound || 'chime');
                        setTriggeredReminders((prev) => new Set(prev).add(note.id));

                        if (Notification.permission === 'granted') {
                            new Notification(`Reminder: ${note.title || 'Keeper Note'}`, {
                                body: note.content,
                                icon: '/favicon.ico',
                            });
                        }
                    }
                }
            });
        }, 15000);

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
        </NotesContext.Provider>
    );
};

export const useNotes = () => useContext(NotesContext);
