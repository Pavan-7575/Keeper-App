import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import {
    Trash2, Pin, Star, Archive, RotateCcw, Copy, CheckCircle2,
    Circle, Bell, Tag, Edit3, Palette, X
} from 'lucide-react';
import { useNotes } from '../context/NotesContext';
import ReminderModal from './ReminderModal';

function Note({
    id,
    title,
    content,
    color,
    is_pinned,
    is_archived,
    is_deleted,
    is_completed,
    is_favorite,
    category_name,
    labels = [],
    reminder_datetime,
    reminder_is_active,
    onDelete,
    onEdit,
}) {
    const { editNote, restoreNote, duplicateNote, setReminder, removeReminder } = useNotes();
    const [showReminderModal, setShowReminderModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(title || '');
    const [editContent, setEditContent] = useState(content || '');

    const handleSaveEdit = async () => {
        await editNote(id, { title: editTitle, content: editContent });
        setIsEditing(false);
    };

    return (
        <div
            className={`note-card ${is_pinned ? 'pinned' : ''} ${is_completed ? 'completed' : ''}`}
            style={{ backgroundColor: color || '#ffffff' }}
        >
            <div className="note-header">
                <h1>{title}</h1>
                <div style={{ display: 'flex', gap: '4px' }}>
                    {!is_deleted && (
                        <>
                            <button
                                className="icon-btn"
                                onClick={() => editNote(id, { is_favorite: !is_favorite })}
                                title={is_favorite ? 'Remove Favorite' : 'Mark Favorite'}
                            >
                                <Star size={16} color={is_favorite ? '#f5ba13' : 'currentColor'} fill={is_favorite ? '#f5ba13' : 'none'} />
                            </button>
                            <button
                                className="icon-btn"
                                onClick={() => editNote(id, { is_pinned: !is_pinned })}
                                title={is_pinned ? 'Unpin' : 'Pin'}
                            >
                                <Pin size={16} color={is_pinned ? '#f5ba13' : 'currentColor'} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            <p>{content}</p>

            <div className="note-badges">
                {category_name && <span className="badge">{category_name}</span>}
                {labels && labels.map((tag, idx) => (
                    <span key={idx} className="badge">
                        #{tag}
                    </span>
                ))}
                {reminder_datetime && reminder_is_active && (
                    <span className="badge reminder-badge" onClick={() => setShowReminderModal(true)} style={{ cursor: 'pointer' }}>
                        <Bell size={12} /> {new Date(reminder_datetime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                )}
            </div>

            <div className="note-footer">
                {!is_deleted ? (
                    <>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                                className="icon-btn"
                                onClick={() => editNote(id, { is_completed: !is_completed })}
                                title={is_completed ? 'Mark Pending' : 'Mark Done'}
                            >
                                {is_completed ? <CheckCircle2 size={16} color="#2ecc71" /> : <Circle size={16} />}
                            </button>
                            <button className="icon-btn" onClick={() => setShowReminderModal(true)} title="Set Reminder">
                                <Bell size={16} />
                            </button>
                            <button className="icon-btn" onClick={() => setIsEditing(true)} title="Edit Note">
                                <Edit3 size={16} />
                            </button>
                            <button
                                className="icon-btn"
                                onClick={() => editNote(id, { is_archived: !is_archived })}
                                title={is_archived ? 'Unarchive' : 'Archive'}
                            >
                                <Archive size={16} />
                            </button>
                            <button className="icon-btn" onClick={() => duplicateNote(id)} title="Duplicate">
                                <Copy size={16} />
                            </button>
                        </div>
                        <button className="icon-btn" onClick={() => onDelete(id)} title="Move to Trash">
                            <Trash2 size={16} color="#e74c3c" />
                        </button>
                    </>
                ) : (
                    <>
                        <button className="chip" onClick={() => restoreNote(id)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <RotateCcw size={14} /> Restore
                        </button>
                        <button className="icon-btn" onClick={() => onDelete(id)} title="Permanently Delete">
                            <Trash2 size={16} color="#e74c3c" />
                        </button>
                    </>
                )}
            </div>

            {/* Edit Dialog */}
            {isEditing && ReactDOM.createPortal(
                <div className="modal-backdrop" onClick={() => setIsEditing(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2><Edit3 size={20} color="var(--primary-color)" /> Edit Note</h2>
                            <button type="button" className="icon-btn" onClick={() => setIsEditing(false)} title="Close">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="auth-form">
                            <div className="form-group">
                                <label>Title</label>
                                <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Content</label>
                                <textarea
                                    rows={5}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', resize: 'vertical' }}
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                                <button type="button" className="chip" onClick={() => setIsEditing(false)} style={{ padding: '8px 16px', fontWeight: 600 }}>
                                    Cancel
                                </button>
                                <button type="button" className="btn-primary" onClick={handleSaveEdit} style={{ margin: 0, width: 'auto', padding: '10px 24px' }}>
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Reminder Modal */}
            {showReminderModal && (
                <ReminderModal
                    note={{ reminder_datetime, notification_sound: 'chime' }}
                    onClose={() => setShowReminderModal(false)}
                    onSave={(remData) => setReminder(id, remData)}
                />
            )}
        </div>
    );
}

export default Note;
